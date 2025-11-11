# TechGear - Headphones Shopping Assistant

A simplified electronics shopping helper that suggests headphones inside ChatGPT using the OpenAI Apps SDK and Model Context Protocol (MCP). This is an educational project designed to teach developers how to build ChatGPT apps with custom MCP servers.

## 🎯 What This Project Demonstrates

- Building an MCP server with Next.js
- Creating interactive widgets that render in ChatGPT
- Using the OpenAI Apps SDK to extend ChatGPT functionality
- Testing MCP servers locally with MCPJam Inspector
- Monorepo structure for scalable MCP applications

## 📁 Project Structure

```
techgear/
├── packages/
│   ├── mcp/                    # Next.js MCP server
│   │   ├── src/
│   │   │   ├── app/           # Next.js app routes
│   │   │   │   ├── mcp/       # MCP endpoint
│   │   │   │   └── widgets/   # Widget pages
│   │   │   └── lib/           # Helper utilities
│   │   └── mcp.config.ts      # Widget registry
│   │
│   ├── widgets/
│   │   └── headphones-widget/ # Headphones widget package
│   │       ├── src/
│   │       │   ├── components/    # React components
│   │       │   ├── data/          # Headphones data
│   │       │   ├── semantic/      # MCP contracts & prompts
│   │       │   ├── config.ts      # Widget config
│   │       │   └── register.ts    # MCP registration
│   │       └── package.json
│   │
│   └── playground/            # Testing with MCPJam
│       ├── mcp.config.json    # Inspector configuration
│       └── README.md          # Testing instructions
│
└── README.md                  # This file
```

## 🚀 Quick Start

> **New to this project?** Check out the [Getting Started Guide](./GETTING_STARTED.md) for detailed step-by-step instructions!

### Prerequisites

- **Node.js** 20+ (use `nvm` if you have it)
- **npm** or **yarn**
- A modern web browser

### Step 1: Install

```bash
# Navigate to the project
cd techgear

# Install dependencies for the headphones widget
cd packages/widgets/headphones-widget
npm install

# Build the widget
npm run build

# Install dependencies for the MCP server
cd ../../mcp
npm install
```

### Step 2: Start the MCP Server

```bash
# From packages/mcp
npm run dev
```

The server will start at `http://localhost:3000`. You can visit:
- `http://localhost:3000` - Homepage with server info
- `http://localhost:3000/widgets/headphones` - Headphones widget preview
- `http://localhost:3000/mcp` - MCP endpoint (used by ChatGPT/Inspector)

### Step 3: Test with MCPJam Inspector

```bash
# Open a new terminal
cd packages/playground
npm run inspector
```

This launches MCPJam Inspector. Follow the [playground README](./packages/playground/README.md) for detailed testing instructions.

## 🏗️ Architecture Overview

### How It Works

1. **MCP Server** (`packages/mcp`): A Next.js application that:
   - Exposes an MCP endpoint at `/mcp`
   - Registers widgets from the widget packages
   - Serves widget HTML to be rendered in ChatGPT
   - Handles tool calls from the AI

2. **Headphones Widget** (`packages/widgets/headphones-widget`): A package that:
   - Defines the `find_headphones` MCP tool
   - Provides a React component for displaying headphones
   - Filters headphones based on price, activity, and style
   - Returns structured data to be rendered

3. **Playground** (`packages/playground`): A minimal testing setup using:
   - MCPJam Inspector for local testing
   - Configuration pointing to the local MCP server

### MCP Tool: `find_headphones`

The headphones widget exposes one MCP tool:

**Tool Name**: `find_headphones`

**Parameters**:
- `priceBracket` (optional): `"budget"`, `"midrange"`, `"premium"`, or `"all"`
- `activity` (optional): `"commuting"`, `"gaming"`, `"studio"`, `"fitness"`, or `"all"`
- `style` (optional): `"in-ear"`, `"on-ear"`, `"over-ear"`, or `"all"`

**Returns**: A filtered list of headphones with details and a summary.

### Widget Registration Flow

```
1. MCP Server starts → loads mcp.config.ts
2. mcp.config.ts imports headphonesWidgetPackage
3. loadWidgets() is called with server context
4. Each widget's registerWidget() function:
   - Registers MCP resource (HTML template)
   - Registers MCP tool (find_headphones)
   - Sets up metadata for ChatGPT rendering
5. Server is ready to receive tool calls
```

## 🧪 Testing

### Local Testing with MCPJam Inspector

1. Start the MCP server: `cd packages/mcp && npm run dev`
2. Start the inspector: `cd packages/playground && npm run inspector`
3. Connect to the TechGear server in the Inspector
4. Try prompts in the playground chat interface

See the [playground README](./packages/playground/README.md) for detailed instructions.

### Testing with ChatGPT

Once you have a working local setup, you can test with ChatGPT:

1. **Expose your server**: Use ngrok or similar to expose `http://localhost:3000`
   ```bash
   ngrok http 3000
   ```

2. **Enable Developer Mode** in ChatGPT (requires ChatGPT Plus)

3. **Add your MCP server**:
   - Go to Settings → Beta Features → Developer Mode
   - Add a new MCP connector with your ngrok URL + `/mcp`

4. **Test in ChatGPT**: Ask "Show me budget headphones for gaming"

## 🔧 Development Guide

### Adding a New Widget

1. **Create the widget package**:
   ```bash
   cd packages/widgets
   mkdir my-widget
   cd my-widget
   npm init -y
   ```

2. **Follow the headphones-widget structure**:
   - `src/config.ts` - Widget metadata
   - `src/semantic/contracts.ts` - Zod schemas
   - `src/semantic/prompts.ts` - LLM-facing text
   - `src/components/MyWidget.tsx` - React component
   - `src/register.ts` - MCP registration logic
   - `src/index.ts` - Exports

3. **Register in mcp.config.ts**:
   ```typescript
   import { myWidgetPackage } from "my-widget";
   
   const config: McpConfig = {
       widgets: {
           "my-widget": {
               package: myWidgetPackage,
               mcp: {
                   enabled: true,
                   production: true,
                   basePath: "/widgets/my-widget",
               },
           },
       },
   };
   ```

4. **Create the widget page** in `packages/mcp/src/app/widgets/my-widget/page.tsx`

5. **Build and test**:
   ```bash
   cd packages/widgets/my-widget
   npm run build
   
   cd ../../mcp
   npm run dev
   ```

### Helper Utilities

The MCP package provides simplified helpers (no framework dependencies):

- **`createResourceMeta()`**: Generate metadata for MCP resources
- **`createWidgetMeta()`**: Generate metadata for MCP tools
- **`getBaseURL()`**: Get the application base URL
- **`loadWidgets()`**: Dynamically load and register widgets

These are located in `packages/mcp/src/lib/helpers.ts` and `packages/mcp/src/lib/loadWidgets.ts`.

### TypeScript Types

Core types are defined in `packages/mcp/src/lib/types.ts`:

- `WidgetContext` - Context passed to widgets during registration
- `WidgetPackage` - Widget package structure
- `WidgetMetadata` - Display metadata
- `McpConfig` - Configuration structure

## 📚 Key Concepts

### Model Context Protocol (MCP)

MCP is a protocol for connecting AI assistants to external tools and data sources. It defines:

- **Tools**: Functions the AI can call
- **Resources**: Data the AI can access
- **Prompts**: Pre-defined prompt templates

Learn more: [MCP Specification](https://spec.modelcontextprotocol.io/)

### OpenAI Apps SDK

The OpenAI Apps SDK extends ChatGPT with custom functionality. It uses MCP to:

- Define tools that appear in ChatGPT
- Render custom UI inline in conversations
- Pass structured data to custom components

Learn more: [OpenAI Apps SDK Documentation](https://developers.openai.com/apps-sdk/build/mcp-server)

### Widget Architecture

Each widget is a self-contained package with:

1. **MCP Tool Definition**: What the AI can call
2. **React Component**: How results are displayed
3. **Registration Logic**: How it connects to the MCP server

This separation allows widgets to be:
- Developed independently
- Tested in isolation
- Reused across projects
- Enabled/disabled easily

## 🐛 Troubleshooting

### Server won't start

- Check that port 3000 is available
- Ensure dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 20+)

### Widget not rendering

- Verify the widget package is built: `cd packages/widgets/headphones-widget && npm run build`
- Check the MCP server logs for errors
- Ensure the widget is enabled in `mcp.config.ts`

### Inspector can't connect

- Confirm the MCP server is running at `http://localhost:3000`
- Check `packages/playground/mcp.config.json` has the correct URL
- Try restarting both the server and inspector

### Tool not being called

- Check the tool description in `semantic/prompts.ts`
- Try more explicit prompts: "Use the find_headphones tool"
- Enable JSON-RPC message viewer in Inspector to see what's happening

## 📖 Learn More

### Documentation

- [MCPJam Documentation](https://docs.mcpjam.com/mcp)
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/build/mcp-server)
- [Model Context Protocol Spec](https://spec.modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)

### Key Technologies

- **Next.js 15.5.5**: React framework for the MCP server
- **React 19**: UI library
- **TypeScript**: Type safety
- **Zod**: Schema validation
- **Tailwind CSS**: Styling
- **mcp-handler**: Simplifies MCP server creation
- **@modelcontextprotocol/sdk**: Official MCP SDK

## 🎓 Educational Goals

This project is designed to teach:

1. **MCP Fundamentals**: How to create MCP servers and tools
2. **Widget Architecture**: How to structure reusable AI-powered components
3. **OpenAI Integration**: How to extend ChatGPT with custom functionality
4. **Monorepo Patterns**: How to organize multi-package projects
5. **Local Development**: How to test AI integrations without deployment

## 📝 License

MIT

## 🤝 Contributing

This is an educational project. Feel free to:

- Fork and experiment
- Add new widgets
- Improve documentation
- Share your learnings

---

**Happy Building! 🚀**

For questions or issues, please refer to the documentation links above or check the individual package READMEs.

