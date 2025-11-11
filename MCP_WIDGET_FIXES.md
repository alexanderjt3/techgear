# MCP Widget Fixes - CSS & Data Hydration

## Issues Identified

1. **CSS Not Applied**: CSS links were relative (`/_next/static/css/...`) which don't work when the widget HTML is served in ChatGPT's iframe
2. **Tool Output Not Updating Widget**: The `useWidgetProps` hook only checked once on mount, missing async data from `window.openai.toolOutput`

## Fixes Applied

### 1. CSS Inlining (`register.ts`)

**Problem**: Relative CSS paths like `/_next/static/css/app/layout.css` won't load in ChatGPT's sandboxed iframe.

**Solution**: 
- Extract CSS path from HTML
- Fetch the actual CSS file
- Inline the CSS into a `<style>` tag in the widget HTML

```typescript
// Extract CSS from the HTML
const cssMatch = html.match(/<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>/i);
let inlinedCSS = '';

if (cssMatch) {
    const cssPath = cssMatch[1];
    const cssUrl = cssPath.startsWith('http') ? cssPath : `http://localhost:${process.env.PORT || 3001}${cssPath}`;
    const cssResponse = await fetch(cssUrl);
    if (cssResponse.ok) {
        inlinedCSS = await cssResponse.text();
    }
}

// Register with inlined CSS
text: `<html>
<head>
${inlinedCSS ? `<style>${inlinedCSS}</style>` : ''}
</head>
<body>
${bodyContent}
</body>
</html>`
```

### 2. Reactive Data Hydration (`useOpenAI.ts`)

**Problem**: `useEffect` with empty deps array only runs once on mount, but `window.openai.toolOutput` might be set after the component mounts.

**Solution**: 
- Check immediately on mount
- Check again after 100ms delay
- Set up interval to keep checking (for development)
- Add comprehensive logging

```typescript
export function useWidgetProps<T>(): T | null {
    const [props, setProps] = useState<T | null>(null);

    useEffect(() => {
        const updateProps = () => {
            if (typeof window !== "undefined" && "openai" in window) {
                const openai = (window as any).openai;
                console.log('[useWidgetProps] window.openai found:', openai);
                if (openai?.toolOutput) {
                    console.log('[useWidgetProps] Setting toolOutput:', openai.toolOutput);
                    setProps(openai.toolOutput as T);
                }
            }
        };

        updateProps(); // Check immediately
        const timeoutId = setTimeout(updateProps, 100); // Check after delay
        const intervalId = setInterval(updateProps, 1000); // Keep checking

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, []);

    return props;
}
```

## How to Test

### 1. Rebuild and Restart

```bash
# Rebuild widget
cd packages/widgets/headphones-widget
npm run build

# Restart MCP server (if running)
cd ../../mcp
# Kill existing: pkill -f "next dev"
npm run dev
```

### 2. Test in MCPJam Inspector

```bash
# In new terminal
cd packages/playground
npx @mcpjam/inspector@latest
```

**In Inspector:**
1. Go to "Servers" → Connect to "TechGear"
2. Go to "Playground" → Select a model
3. Try: `"Find budget headphones for gaming"`

**Expected Results:**
- ✅ Widget renders with Tailwind styles (borders, shadows, colors)
- ✅ Shows only filtered headphones (budget + gaming)
- ✅ Summary text matches filters
- ✅ Console shows `[useWidgetProps] Setting toolOutput:` with data

### 3. Check Browser Console

Open browser dev tools and look for:

```
[HeadphonesWidget] window.openai available: {...}
[HeadphonesWidget] toolOutput: {...}
[useWidgetProps] Checking for window.openai...
[useWidgetProps] window.openai found: {...}
[useWidgetProps] Setting toolOutput: {headphones: [...], summary: "..."}
[Carousel] Using MCP data: [...]
```

### 4. Verify CSS

**In standalone page** (`http://localhost:3000/widgets/headphones`):
- Should have styles from external CSS file

**In MCP response** (when tool is called):
- Should have inlined `<style>` tag with Tailwind CSS
- All classes should be styled (check with browser inspector)

## Debug Checklist

- [ ] Widget builds without errors
- [ ] MCP server starts and registers widget
- [ ] POST to `/mcp` returns tool response with `structuredContent`
- [ ] Widget HTML includes inlined `<style>` tag
- [ ] Widget HTML includes `window.openai` initialization script
- [ ] Browser console shows data hydration logs
- [ ] Widget updates to show filtered headphones
- [ ] Tailwind classes are applied (borders, shadows, colors visible)

## Known Behavior

**Standalone Page** (`/widgets/headphones`):
- Uses fallback data (all 6 headphones)
- Shows filter dropdowns
- Uses external CSS link

**MCP Tool Call** (in ChatGPT/Inspector):
- Uses `window.openai.toolOutput` data
- Shows filtered headphones based on tool input
- Hides filter dropdowns (data is pre-filtered)
- Uses inlined CSS

## Files Modified

1. `packages/widgets/headphones-widget/src/register.ts`
   - Added CSS fetching and inlining
   - Added body content extraction
   - Added window.openai initialization

2. `packages/widgets/headphones-widget/src/hooks/useOpenAI.ts`
   - Made `useWidgetProps` reactive
   - Added retry logic for async data
   - Added comprehensive logging

## Next Steps

If issues persist:

1. **Check Network Tab**: Verify CSS file is being fetched during widget registration
2. **Check Console**: Look for `[useWidgetProps]` and `[Carousel]` logs
3. **Inspect Element**: Verify Tailwind classes have actual CSS rules applied
4. **Check MCP Response**: Use Inspector's message viewer to see raw tool response

## Production Considerations

For production deployment:

1. **Remove Console Logs**: Clean up debug logging
2. **Remove Interval**: The 1-second interval should be removed or conditional
3. **Optimize CSS**: Consider using only required Tailwind utilities
4. **Cache Busting**: Add version to CSS URLs if needed
5. **Error Handling**: Add better error handling for CSS fetch failures

---

**Status**: Fixes applied and ready for testing ✅

