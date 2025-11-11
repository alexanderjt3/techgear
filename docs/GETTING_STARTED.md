# Getting Started with TechGear

This guide will walk you through setting up and running the TechGear MCP application step by step.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 20+** installed ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- A terminal/command line interface
- A code editor (VS Code recommended)

### Check Your Node Version

```bash
node --version
# Should show v20.x.x or higher
```

If you use `nvm`, you can use the project's Node version:

```bash
nvm use
```

## 🚀 Step-by-Step Setup

### Step 1: Navigate to the Project

```bash
cd /Users/jalexander12/projects/techgear
```

### Step 2: Install Widget Dependencies

Start by building the headphones widget:

```bash
cd packages/widgets/headphones-widget
npm install
npm run build
```

**What this does:**
- Installs all dependencies for the widget
- Compiles TypeScript to JavaScript
- Creates the `dist/` folder with compiled code

### Step 3: Install MCP Server Dependencies

```bash
cd ../../mcp
npm install
```

**What this does:**
- Installs Next.js and all dependencies
- Links the local headphones-widget package
- Sets up the development environment

### Step 4: Start the MCP Server

```bash
npm run dev
```

**What happens:**
- Next.js development server starts
- Server runs at `http://localhost:3000`
- Hot-reloading is enabled (changes auto-refresh)
- MCP endpoint available at `http://localhost:3000/mcp`

### Step 5: Verify It's Working

Open your browser and visit:

1. **Homepage**: http://localhost:3000
   - Should show "TechGear MCP Server" with links

2. **Headphones Widget**: http://localhost:3000/widgets/headphones
   - Should display the headphones carousel
   - Try the filters to see it working

3. **MCP Endpoint**: http://localhost:3000/mcp
   - You'll see a JSON error (this is expected!)
   - This endpoint is meant for MCP clients, not browsers

## 🧪 Testing with MCPJam Inspector

Now let's test the MCP server with AI!

### Step 1: Open a New Terminal

Keep the MCP server running, and open a **new terminal window**.

### Step 2: Navigate to Playground

```bash
cd /Users/jalexander12/projects/techgear/packages/playground
```

### Step 3: Run the Inspector

```bash
npm run inspector
```

**What happens:**
- MCPJam Inspector downloads and starts
- Opens in your browser (usually `http://localhost:5173`)
- You may need to sign in or use as guest

### Step 4: Connect to TechGear Server

1. In the Inspector, click the **Servers** tab
2. You should see "TechGear" in the list
3. Click **Connect** next to TechGear
4. Wait for the connection indicator to turn green

### Step 5: Test in Playground

1. Click the **Playground** tab
2. Select a model (or use MCPJam's free models)
3. Try these prompts:

```
Show me headphones
```

```
Find budget headphones for the gym
```

```
I need over-ear headphones for gaming under $200
```

```
Show me premium studio headphones
```

**What to expect:**
- The AI will call the `find_headphones` tool
- The headphones widget will render inline
- You'll see filtered results based on your request

## 🎯 Common Test Scenarios

### Scenario 1: Price Filter

**Prompt**: "Show me budget headphones"

**Expected**: Should show only headphones under $100

### Scenario 2: Activity Filter

**Prompt**: "I need headphones for commuting"

**Expected**: Should show headphones suitable for commuting

### Scenario 3: Style Filter

**Prompt**: "Find in-ear headphones"

**Expected**: Should show only in-ear/earbud style

### Scenario 4: Combined Filters

**Prompt**: "Show me midrange over-ear headphones for gaming"

**Expected**: Should show headphones matching all three criteria

## 🔍 Debugging

### Server Not Starting?

**Error**: "Port 3000 already in use"

**Solution**: 
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 npm run dev
```

### Widget Not Showing?

**Check**:
1. Did you build the widget? `cd packages/widgets/headphones-widget && npm run build`
2. Are there errors in the server console?
3. Try clearing Next.js cache: `rm -rf .next && npm run dev`

### Inspector Can't Connect?

**Check**:
1. Is the MCP server running at `http://localhost:3000`?
2. Open `http://localhost:3000/mcp` in a browser - it should show an error (that's OK)
3. Check the playground config: `packages/playground/mcp.config.json`

### Tool Not Being Called?

**Try**:
1. Be more explicit: "Use the find_headphones tool"
2. Check the MCP server console for errors
3. Enable JSON-RPC viewer in Inspector to see messages

## 📚 Next Steps

Once you have everything working:

1. **Explore the Code**:
   - Read through `packages/widgets/headphones-widget/src/register.ts`
   - Check out `packages/mcp/src/app/mcp/route.ts`
   - Look at the widget component

2. **Modify the Data**:
   - Edit `packages/widgets/headphones-widget/src/data/headphones.ts`
   - Add new headphones
   - Change descriptions
   - Rebuild and test: `npm run build`

3. **Customize the Widget**:
   - Edit `packages/widgets/headphones-widget/src/components/HeadphonesWidget.tsx`
   - Change colors, layout, or styling
   - Changes hot-reload automatically

4. **Create a New Widget**:
   - Follow the "Adding a New Widget" section in the main README
   - Use the headphones widget as a template

## 🎓 Understanding the Flow

Here's what happens when you ask for headphones:

1. **User prompt** → ChatGPT/Inspector
2. **AI decides** to call `find_headphones` tool
3. **MCP client** sends request to `http://localhost:3000/mcp`
4. **MCP server** receives request
5. **Widget's tool handler** filters headphones
6. **Server responds** with structured data + HTML template
7. **MCP client** renders widget with data
8. **User sees** filtered headphones in the chat

## ✅ Success Checklist

- [ ] Node.js 20+ installed
- [ ] Widget built successfully
- [ ] MCP server running at port 3000
- [ ] Homepage loads in browser
- [ ] Widget page shows headphones
- [ ] MCPJam Inspector running
- [ ] Connected to TechGear server
- [ ] Tool calls work in playground
- [ ] Widget renders with filtered results

## 🆘 Still Stuck?

1. Check the main [README.md](./README.md)
2. Review the [Playground README](./packages/playground/README.md)
3. Check the console logs in both terminals
4. Make sure all dependencies are installed
5. Try restarting everything from scratch

---

**You're ready to start building! 🚀**

