# Widget Hydration & Asset Loading Fixes

## Problem Summary

The widget was experiencing two critical issues:
1. **JavaScript Assets Not Loading**: Console errors showing `Uncaught SyntaxError: Unexpected token '<'` when trying to load `webpack.js`
2. **Data Not Hydrating**: The widget UI wasn't updating when `window.openai.toolOutput` was set by ChatGPT

## Root Causes

### Issue 1: Relative Asset Paths
When Next.js rendered the widget HTML without an `assetPrefix`, script tags used relative paths:
```html
<script src="/_next/static/chunks/webpack.js"></script>
```

When ChatGPT loaded this HTML in a sandboxed iframe, the browser tried to resolve these relative paths from the ChatGPT domain, not from `localhost:3000`, resulting in 404 errors.

### Issue 2: Inefficient Reactivity
The `useWidgetProps` hook used polling with `setInterval` to check for `window.openai.toolOutput`:
```typescript
// OLD: Polling approach ❌
const [props, setProps] = useState(null);
useEffect(() => {
    const intervalId = setInterval(() => {
        if (window.openai?.toolOutput) {
            setProps(window.openai.toolOutput);
        }
    }, 1000);
    return () => clearInterval(intervalId);
}, []);
```

This approach:
- Had timing issues (up to 1 second delay)
- Didn't subscribe to OpenAI's event system
- Wasn't guaranteed to trigger re-renders reliably

## Solutions Implemented

### Solution 1: Asset Prefix Configuration

**File**: `packages/mcp/next.config.ts`

Added `assetPrefix` to ensure all assets use absolute URLs in development:

```typescript
function getAssetPrefix(): string {
    if (process.env.NODE_ENV === "development") {
        const port = process.env.PORT || 3000;
        return `http://localhost:${port}`;
    }
    return "";  // Use relative paths in production
}

const nextConfig: NextConfig = {
    assetPrefix: getAssetPrefix(),
    // ... other config
};
```

**Result**: Script tags now use absolute URLs:
```html
<script src="http://localhost:3000/_next/static/chunks/webpack.js"></script>
```

These load correctly even from within ChatGPT's sandboxed iframe.

### Solution 2: Sync External Store Pattern

**File**: `packages/widgets/headphones-widget/src/hooks/useOpenAI.ts`

Replaced polling with React's `useSyncExternalStore` and subscribed to OpenAI's event system:

```typescript
// NEW: Event-driven approach ✅
const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";

function useOpenAIGlobal<K extends keyof any>(key: K): any {
    return useSyncExternalStore(
        (onChange) => {
            if (typeof window === "undefined") {
                return () => {};
            }

            const handleSetGlobal = (event: CustomEvent) => {
                const globals = event.detail?.globals || {};
                const value = globals[key];
                if (value === undefined) {
                    return;
                }
                onChange();  // Trigger React re-render
            };

            window.addEventListener(
                SET_GLOBALS_EVENT_TYPE, 
                handleSetGlobal as EventListener,
                { passive: true }
            );

            return () => {
                window.removeEventListener(
                    SET_GLOBALS_EVENT_TYPE,
                    handleSetGlobal as EventListener
                );
            };
        },
        () =>
            typeof window !== "undefined" && (window as any).openai
                ? (window as any).openai[key] ?? null
                : null,
        () => null
    );
}

export function useWidgetProps<T>(defaultState?: T | (() => T)): T | null {
    const toolOutput = useOpenAIGlobal("toolOutput") as T | null;
    const fallback =
        typeof defaultState === "function"
            ? (defaultState as () => T | null)()
            : (defaultState ?? null);
    return toolOutput ?? fallback;
}
```

**Benefits**:
- ✅ Subscribes to ChatGPT's `openai:set_globals` custom events
- ✅ Triggers immediate re-renders when data changes
- ✅ No polling overhead
- ✅ Follows React 18+ best practices
- ✅ Matches OpenAI Apps SDK examples

### Solution 3: Simplified Widget Registration

**File**: `packages/widgets/headphones-widget/src/register.ts`

Removed manual CSS inlining and body extraction since the assetPrefix handles everything:

```typescript
// BEFORE: Complex manual inlining ❌
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
const cssMatch = html.match(/<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>/i);
// ... fetch CSS, inline it, extract body, etc.

// AFTER: Simple passthrough ✅
const html = await getHtml(basePath);
server.registerResource(
    "headphones-widget",
    headphonesWidgetMetadata.templateUri,
    // ...
    async (uri: URL) => ({
        contents: [{
            uri: uri.href,
            mimeType: "text/html+skybridge",
            text: `<html>${html}</html>`,
            // ...
        }],
    })
);
```

## Alignment with Reference App

These changes directly mirror the architecture used in the reference application:

| File | Reference App | TechGear (After Fix) | Status |
|------|---------------|----------------------|--------|
| `next.config.ts` | Uses `getAssetPrefix()` helper | Uses `getAssetPrefix()` function | ✅ Aligned |
| `useOpenAI.ts` | Uses `useSyncExternalStore` | Uses `useSyncExternalStore` | ✅ Aligned |
| `register.ts` | Simple `text: \`<html>${html}</html>\`` | Simple `text: \`<html>${html}</html>\`` | ✅ Aligned |

## Testing the Fixes

### 1. Verify Asset Loading
```bash
curl -s http://localhost:3000/widgets/headphones | grep -o 'src="[^"]*"' | head -5
```

**Expected Output**:
```
src="http://localhost:3000/_next/static/chunks/main-app.js?v=..."
src="http://localhost:3000/_next/static/chunks/app-pages-internals.js"
src="http://localhost:3000/_next/static/chunks/app/widgets/headphones/page.js"
...
```

### 2. Test in MCPJam Inspector
1. Start MCP server: `cd packages/mcp && PORT=3000 npm run dev`
2. Start MCPJam: `cd packages/playground && npx @mcpjam/inspector@latest`
3. Connect to server
4. Ask: "Show me budget headphones for commuting"
5. **Verify**:
   - ✅ No JavaScript errors in console
   - ✅ Widget displays with proper styling
   - ✅ Headphones data updates based on tool output
   - ✅ Carousel shows filtered results

## Key Takeaways

1. **Asset Prefix is Critical**: When serving Next.js widgets in iframes, always use absolute URLs for assets
2. **Event-Driven is Better**: Use `useSyncExternalStore` to subscribe to `window.openai` changes instead of polling
3. **Follow the Pattern**: The OpenAI Apps SDK and reference implementations provide battle-tested patterns - use them!
4. **Console Logs Help**: The `window.openai` object and its events can be logged for debugging data flow

## References

- [OpenAI Apps SDK - MCP Server Guide](https://developers.openai.com/apps-sdk/build/mcp-server)
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [OpenAI Apps SDK Examples](https://github.com/openai/openai-apps-sdk-examples/tree/main/src)
- Reference App: `/Users/jalexander12/projects/fett_ai-applications/packages`

