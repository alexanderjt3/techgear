# TechGear Playground

This playground package provides a simple way to test the TechGear MCP server using MCPJam Inspector.

## What is MCPJam Inspector?

[MCPJam Inspector](https://www.mcpjam.com/blog/playground-v2) is a local-first development tool for testing MCP servers. It provides:

- Full support for MCP-UI and OpenAI Apps SDK
- View all JSON-RPC messages between client and server
- Access to frontier models (GPT, Claude, Gemini, etc.) for free
- Clean chat interface with tool inspection

## Quick Start

### 1. Start the MCP Server

First, make sure the TechGear MCP server is running:

```bash
cd ../mcp
npm install
npm run dev
```

The server will start at `http://localhost:3000`.

### 2. Run the Inspector

In this directory, run:

```bash
npm run inspector
```

This will launch the MCPJam Inspector in your browser.

### 3. Connect to the Server

1. In the Inspector, go to the **Servers** tab
2. The TechGear server should be automatically detected from `mcp.config.json`
3. Click **Connect** to connect to the server
4. Once connected, navigate to the **Playground** tab

### 4. Test the Headphones Widget

In the playground chat interface, try prompts like:

- "Show me headphones"
- "Find budget headphones for commuting"
- "I need over-ear headphones for gaming"
- "Show me premium studio headphones"

The MCP tool will be called and the headphones widget will render inline with filtered results.

## Configuration

The `mcp.config.json` file tells MCPJam Inspector where to find your MCP server:

```json
{
    "mcpServers": {
        "TechGear": {
            "url": "http://localhost:3000/mcp",
            "type": "http"
        }
    }
}
```

You can add more MCP servers to this configuration file to test multiple servers simultaneously.

## Debugging

- **Server not connecting?** Make sure the MCP server is running at `http://localhost:3000`
- **Tool not working?** Check the MCP server logs in the terminal where you ran `npm run dev`
- **View JSON-RPC messages**: In MCPJam Inspector, enable the message viewer to see all communication between client and server

## Learn More

- [MCPJam Documentation](https://docs.mcpjam.com/mcp)
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/build/mcp-server)
- [Model Context Protocol Spec](https://spec.modelcontextprotocol.io/)

