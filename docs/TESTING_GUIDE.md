# TechGear Testing Guide

## ✅ Recent Fixes Applied

The following critical issues have been resolved:

1. **Asset Loading**: Added `assetPrefix` to `next.config.ts` to ensure JavaScript bundles load with absolute URLs (`http://localhost:3000/_next/static/...`) when embedded in ChatGPT iframes
2. **Data Reactivity**: Updated `useWidgetProps` hook to use React's `useSyncExternalStore` instead of polling, ensuring proper reactivity when `window.openai.toolOutput` changes
3. **Event Subscription**: Implemented proper event listener for `openai:set_globals` custom events fired by ChatGPT

These changes align our implementation with the official OpenAI Apps SDK best practices and the reference application architecture.

## Quick Setup (Clear All Ports & Restart)

If you encounter port conflicts, run these commands:

```bash
# Kill all conflicting processes
lsof -ti:3000 | xargs kill -9  # MCP server port
lsof -ti:3001 | xargs kill -9  # Alternate MCP port
lsof -ti:6274 | xargs kill -9  # MCPJam Inspector port

# Start MCP server on port 3000
cd /Users/jalexander12/projects/techgear/packages/mcp
nvm use
PORT=3000 npm run dev
```

Wait for: `✓ Ready in ~1000ms`

## Test with MCPJam Inspector

**In a NEW terminal:**

```bash
cd /Users/jalexander12/projects/techgear/packages/playground
npx @mcpjam/inspector@latest
```

**Expected:**
```
┌─────────────────────────┐
│ 🚀 Inspector Launched   │
├─────────────────────────┤
│ http://127.0.0.1:6274   │
└─────────────────────────┘
✅ 🌐 Browser opened at http://127.0.0.1:6274
```

## In MCPJam Inspector UI

### Step 1: Connect to Server
1. Click **"Servers"** tab (left sidebar)
2. You should see **"TechGear"** server
3. Click **"Connect"** button
4. Wait for green checkmark ✅

### Step 2: Test in Playground
1. Click **"Playground"** tab
2. Select a model (or use MCPJam's free models)
3. Try these prompts:

**Test 1: Simple Query**
```
Show me headphones
```
**Expected**: Widget with all 6 headphones

**Test 2: Budget Filter**
```
Find budget headphones
```
**Expected**: 2 headphones (ArcSound Metro $99, Pulse Lite $79)

**Test 3: Activity Filter**
```
I need headphones for gaming
```
**Expected**: 1 headphone (Nova GX Wireless $179)

**Test 4: Combined Filters**
```
Show me budget headphones for commuting
```
**Expected**: 1 headphone (ArcSound Metro ANC $99)

### Step 3: Verify CSS & Data

**Open Browser Console** (F12) and check for:

```javascript
[HeadphonesWidget] window.openai available: {...}
[HeadphonesWidget] toolOutput: {...}
[useWidgetProps] window.openai found: {...}
[useWidgetProps] Setting toolOutput: {headphones: [...], summary: "..."}
[Carousel] Using MCP data: [...]
[Carousel] Rendering with filtered.length: 2
```

**Check Visual Styling:**
- ✅ Cards have rounded corners
- ✅ Cards have shadows
- ✅ Hover effects work (cards lift up)
- ✅ Colors are applied (zinc grays, proper text colors)
- ✅ Buttons are styled (dark background, white text)

## Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find what's using the port
lsof -ti:PORT_NUMBER

# Kill it
lsof -ti:PORT_NUMBER | xargs kill -9
```

### MCPJam Won't Start

**Solution**:
```bash
# Kill any existing MCPJam processes
pkill -f mcpjam
pkill -f inspector

# Clear port and restart
lsof -ti:6274 | xargs kill -9
npx @mcpjam/inspector@latest
```

### Server Not on Port 3000

If Next.js picks a different port (3001, 3002, etc):

**Option 1**: Force port 3000
```bash
PORT=3000 npm run dev
```

**Option 2**: Update playground config
```json
// packages/playground/mcp.config.json
{
    "mcpServers": {
        "TechGear": {
            "url": "http://localhost:3001/mcp",  // Change to actual port
            "type": "http"
        }
    }
}
```

### CSS Not Applied in Widget

**Check**:
1. Open MCP server terminal - look for CSS fetch logs
2. Inspect element in browser - verify styles are inlined
3. Check network tab - CSS file should be fetched during registration

**Solution**: Restart MCP server to re-fetch and inline CSS
```bash
# In MCP server terminal: Ctrl+C
npm run dev
```

### Widget Not Showing Filtered Data

**Check Console Logs**:
```
[useWidgetProps] Setting toolOutput: {...}
[Carousel] Using MCP data: [...]
```

**If no logs**: Data hydration isn't working
- Verify `window.openai.toolOutput` is set
- Check the useOpenAI hook logs
- Ensure widget was rebuilt after hook changes

**Solution**: Rebuild widget and restart server
```bash
cd packages/widgets/headphones-widget
npm run build

cd ../../mcp
npm run dev
```

## Verification Checklist

Before testing:
- [ ] Port 3000 is free
- [ ] Port 6274 is free
- [ ] Widget is built (`dist/` folder exists)
- [ ] MCP server is running
- [ ] Server shows "Widget loading complete"

During testing:
- [ ] MCPJam connects to TechGear server
- [ ] Tool `find_headphones` is available
- [ ] Prompts trigger tool calls
- [ ] Widget renders inline in chat
- [ ] CSS is applied (styled cards)
- [ ] Data matches filters

## Success Criteria

✅ **CSS Applied**:
- Widget has Tailwind styles
- Cards have borders, shadows, rounded corners
- Colors match design (zinc grays)

✅ **Data Hydration**:
- Widget shows filtered headphones
- Count matches tool response
- Summary text is correct
- Only requested items shown

✅ **Tool Functionality**:
- Tool is called by AI
- Filters work (price, activity, style)
- Combinations work (multiple filters)
- Edge cases handled (no results)

## Next Steps

Once everything works:

1. **Test All Filter Combinations**:
   - Budget + Commuting
   - Midrange + Gaming
   - Premium + Studio
   - In-ear + Fitness

2. **Test in ChatGPT**:
   - Deploy or use ngrok
   - Enable Developer Mode (ChatGPT Plus required)
   - Add MCP connector
   - Test same prompts

3. **Customize**:
   - Add more headphones to data
   - Modify styling
   - Add images
   - Create new widgets

---

**Ready to test!** 🚀

Open two terminals:
1. MCP server: `cd packages/mcp && npm run dev`
2. Inspector: `cd packages/playground && npx @mcpjam/inspector@latest`

