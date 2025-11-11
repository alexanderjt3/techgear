# TechGear Quick Reference

One-page reference for common tasks and commands.

## 🚀 Quick Start Commands

```bash
# Install and build widget
cd packages/widgets/headphones-widget
npm install && npm run build

# Start MCP server
cd ../../mcp
npm install && npm run dev

# Run inspector (in new terminal)
cd ../playground
npm run inspector
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `packages/mcp/src/app/mcp/route.ts` | MCP HTTP endpoint |
| `packages/mcp/mcp.config.ts` | Widget registry |
| `packages/widgets/headphones-widget/src/register.ts` | Widget registration |
| `packages/widgets/headphones-widget/src/data/headphones.ts` | Headphone data |
| `packages/widgets/headphones-widget/src/components/HeadphonesWidget.tsx` | React component |
| `packages/playground/mcp.config.json` | Inspector config |

## 🔧 Common Tasks

### Add a Headphone

Edit `packages/widgets/headphones-widget/src/data/headphones.ts`:

```typescript
{
    id: "my-headphone",
    name: "My Headphones",
    priceBracket: "budget",
    activity: "commuting",
    style: "over-ear",
    price: "$99",
    description: "Great headphones",
    ctaUrl: "https://example.com/buy",
}
```

Rebuild: `npm run build`

### Change Widget Styling

Edit `packages/widgets/headphones-widget/src/components/HeadphonesWidget.tsx`

Changes hot-reload automatically when MCP server is running.

### Disable a Widget

Edit `packages/mcp/mcp.config.ts`:

```typescript
headphones: {
    package: headphonesWidgetPackage,
    mcp: {
        enabled: false, // ← Set to false
        production: true,
        basePath: "/widgets/headphones",
    },
},
```

### Change MCP Port

```bash
PORT=3001 npm run dev
```

Update `packages/playground/mcp.config.json` to match.

### Clear Cache

```bash
cd packages/mcp
rm -rf .next
npm run dev
```

## 🧪 Testing Prompts

Try these in MCPJam Inspector:

```
Show me headphones
Find budget headphones
I need headphones for gaming
Show me over-ear headphones under $200
Find premium studio headphones
What headphones do you have for commuting?
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `kill -9 $(lsof -ti:3000)` |
| Widget not building | `cd packages/widgets/headphones-widget && rm -rf node_modules dist && npm install && npm run build` |
| Inspector won't connect | Check MCP server is running at http://localhost:3000 |
| Changes not showing | Clear Next.js cache: `rm -rf packages/mcp/.next` |
| TypeScript errors | `npm install` in both widget and mcp packages |

## 🌐 URLs

| URL | Description |
|-----|-------------|
| http://localhost:3000 | MCP server homepage |
| http://localhost:3000/mcp | MCP endpoint |
| http://localhost:3000/widgets/headphones | Widget preview |
| http://localhost:5173 | MCPJam Inspector |

## 📦 Package Scripts

### Widget Package
```bash
npm install      # Install dependencies
npm run build    # Build TypeScript
npm run dev      # Watch mode
npm run clean    # Remove node_modules and dist
```

### MCP Package
```bash
npm install      # Install dependencies
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

### Playground Package
```bash
npm run inspector  # Start MCPJam Inspector
```

### Root Commands
```bash
npm run dev              # Start MCP server
npm run build            # Build everything
npm run build:widget     # Build widget only
npm run build:mcp        # Build MCP server only
npm run inspector        # Start inspector
```

## 🔑 Key Concepts

### MCP Tool Registration

```typescript
server.registerTool(
    "tool_name",          // Tool identifier
    {
        title: "...",     // Display name
        description: "...", // AI-facing description
        inputSchema: {...}, // Zod schema
        _meta: {...},     // OpenAI metadata
    },
    async (input) => {    // Handler function
        return {
            content: [...],
            structuredContent: {...},
        };
    }
);
```

### Widget Structure

```
1. Config (metadata)
2. Contracts (Zod schemas)
3. Prompts (AI descriptions)
4. Component (React UI)
5. Registration (MCP binding)
```

### Data Flow

```
User Prompt
    ↓
ChatGPT decides to call tool
    ↓
MCP client sends request
    ↓
MCP server receives
    ↓
Widget handler processes
    ↓
Returns data + HTML
    ↓
Client renders widget
    ↓
User sees results
```

## 📝 Code Snippets

### Create New Widget Tool

```typescript
server.registerTool(
    "my_tool",
    {
        title: "My Tool",
        description: "What it does",
        inputSchema: z.object({
            query: z.string(),
        }).shape,
        _meta: createWidgetMeta(metadata),
    },
    async ({ query }) => ({
        content: [{ type: "text", text: "Result" }],
        structuredContent: { data: "..." },
    })
);
```

### Register New Widget in Config

```typescript
// mcp.config.ts
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

### Use OpenAI Data in Component

```typescript
import { useWidgetProps } from "../hooks/useOpenAI";

const toolOutput = useWidgetProps<MyData>();
// toolOutput contains data from MCP tool
```

## 🎯 Best Practices

1. **Always build widget** before starting MCP server
2. **Use TypeScript** for type safety
3. **Validate with Zod** for runtime safety
4. **Write clear prompts** so AI knows when to use tools
5. **Test standalone** before testing with AI
6. **Check logs** when debugging
7. **Use descriptive names** for tools and fields

## 📚 Documentation Links

- [Main README](./README.md)
- [Getting Started](./GETTING_STARTED.md)
- [Project Summary](./PROJECT_SUMMARY.md)
- [MCP Server README](./packages/mcp/README.md)
- [Widget README](./packages/widgets/headphones-widget/README.md)
- [Playground README](./packages/playground/README.md)

## 🆘 Support Resources

- [MCPJam Docs](https://docs.mcpjam.com/mcp)
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/build/mcp-server)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Next.js Docs](https://nextjs.org/docs)

---

**Keep this reference handy while developing!**

