# TechGear MCP Server

The MCP (Model Context Protocol) server for TechGear. This Next.js application exposes MCP tools that can be used by ChatGPT and other AI assistants.

## Overview

This server:
- Exposes an MCP endpoint at `/mcp`
- Dynamically loads and registers widgets
- Serves widget HTML for rendering in ChatGPT
- Handles tool calls from AI assistants

## Structure

```
mcp/
├── src/
│   ├── app/
│   │   ├── mcp/
│   │   │   └── route.ts          # MCP HTTP endpoint
│   │   ├── widgets/
│   │   │   └── headphones/
│   │   │       └── page.tsx      # Widget preview page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Homepage
│   │   └── globals.css           # Global styles
│   └── lib/
│       ├── types.ts              # TypeScript types
│       ├── helpers.ts            # MCP helper functions
│       └── loadWidgets.ts        # Widget loader
├── mcp.config.ts                 # Widget registry
├── next.config.ts                # Next.js configuration
├── package.json
└── tsconfig.json
```

## Development

### Start Development Server

```bash
npm install
npm run dev
```

Server runs at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run start
```

## Endpoints

### Homepage: `/`

Displays information about the MCP server and links to widgets.

### MCP Endpoint: `/mcp`

The main MCP endpoint used by ChatGPT and MCP clients. Accepts POST requests with MCP protocol messages.

### Widget Pages: `/widgets/*`

Preview pages for each widget:
- `/widgets/headphones` - Headphones widget

## Configuration

### mcp.config.ts

The widget registry that defines which widgets are loaded:

```typescript
import { headphonesWidgetPackage } from "headphones-widget";
import { McpConfig } from "./src/lib/types";

const config: McpConfig = {
    widgets: {
        headphones: {
            package: headphonesWidgetPackage,
            mcp: {
                enabled: true,
                production: true,
                basePath: "/widgets/headphones",
            },
        },
    },
};

export default config;
```

**Fields**:
- `enabled`: Whether the widget is loaded
- `production`: Whether to include in production builds
- `basePath`: Where the widget's HTML is served

### next.config.ts

Next.js configuration:

```typescript
const nextConfig: NextConfig = {
    output: "standalone",
    transpilePackages: ["headphones-widget"],
};
```

**Key settings**:
- `output: "standalone"`: For easy deployment
- `transpilePackages`: Transpile local widget packages

## Adding a New Widget

### 1. Create the Widget Package

See the main README for details on creating a widget package.

### 2. Install the Widget

```bash
npm install ../widgets/my-widget
```

Or add to `package.json`:

```json
{
    "dependencies": {
        "my-widget": "file:../widgets/my-widget"
    }
}
```

### 3. Register in mcp.config.ts

```typescript
import { myWidgetPackage } from "my-widget";

const config: McpConfig = {
    widgets: {
        // ... existing widgets
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

### 4. Create Widget Page

Create `src/app/widgets/my-widget/page.tsx`:

```typescript
"use client";

import MyWidget from "my-widget/component";

export default function MyWidgetPage() {
    return <MyWidget />;
}
```

### 5. Update Tailwind Config

Add the widget to the content paths in `tailwind.config.ts`:

```typescript
content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../widgets/my-widget/src/**/*.{js,ts,jsx,tsx}",
],
```

### 6. Restart the Server

```bash
npm run dev
```

## Helper Utilities

### createResourceMeta()

Creates metadata for MCP resource registration:

```typescript
import { createResourceMeta } from "@/lib/helpers";

const meta = createResourceMeta(
    "Widget description for the AI",
    true // prefersBorder
);
```

### createWidgetMeta()

Creates metadata for MCP tool registration:

```typescript
import { createWidgetMeta } from "@/lib/helpers";

const meta = createWidgetMeta(widgetMetadata);
```

### getBaseURL()

Gets the application base URL:

```typescript
import { getBaseURL } from "@/lib/helpers";

const baseURL = getBaseURL();
// http://localhost:3000 in dev
// https://your-domain.com in production
```

### loadWidgets()

Loads and registers all enabled widgets:

```typescript
import { loadWidgets } from "@/lib/loadWidgets";

await loadWidgets(context);
```

## Environment Variables

Create a `.env.local` file:

```bash
PORT=3000
NODE_ENV=development
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Deploy

### Docker

```bash
npm run build
docker build -t techgear-mcp .
docker run -p 3000:3000 techgear-mcp
```

### Other Platforms

Build and deploy the `.next/standalone` folder.

## Troubleshooting

### Widget Not Loading

1. Check widget is built: `cd ../widgets/my-widget && npm run build`
2. Check widget is enabled in `mcp.config.ts`
3. Check server logs for errors
4. Clear Next.js cache: `rm -rf .next`

### MCP Endpoint Errors

1. Check the endpoint returns JSON (not HTML)
2. Verify the request is a POST with proper MCP format
3. Check logs in the terminal

### Styling Issues

1. Ensure widget is in Tailwind content paths
2. Rebuild: `rm -rf .next && npm run dev`
3. Check for CSS conflicts

## Testing

### Preview Widgets

Visit `http://localhost:3000/widgets/{widget-name}` to preview widgets without MCP.

### Test MCP Endpoint

Use the playground package:

```bash
cd ../playground
npm run inspector
```

### Test in ChatGPT

1. Deploy or use ngrok to expose localhost
2. Enable ChatGPT Developer Mode
3. Add your MCP server URL
4. Test with prompts

## Dependencies

- **next**: React framework
- **react** & **react-dom**: UI library
- **@modelcontextprotocol/sdk**: Official MCP SDK
- **mcp-handler**: Simplifies MCP route creation
- **zod**: Schema validation
- **tailwindcss**: Styling
- **typescript**: Type safety

## License

MIT

