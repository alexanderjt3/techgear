# Headphones Widget

A widget for displaying and filtering headphone recommendations in ChatGPT via MCP.

## Overview

This widget exposes a `find_headphones` MCP tool that accepts optional filters for price, activity, and style. It returns a filtered list of headphones with a React component that renders them in an interactive carousel.

## Structure

```
headphones-widget/
├── src/
│   ├── components/
│   │   └── HeadphonesWidget.tsx    # React component
│   ├── data/
│   │   └── headphones.ts           # Headphone data & filter logic
│   ├── hooks/
│   │   └── useOpenAI.ts            # ChatGPT integration hooks
│   ├── semantic/
│   │   ├── contracts.ts            # Zod schemas (tool I/O)
│   │   └── prompts.ts              # LLM-facing descriptions
│   ├── config.ts                   # Widget metadata
│   ├── register.ts                 # MCP registration logic
│   └── index.ts                    # Package exports
├── package.json
└── tsconfig.json
```

## MCP Tool: `find_headphones`

### Input Schema

```typescript
{
    priceBracket?: "budget" | "midrange" | "premium" | "all",
    activity?: "commuting" | "gaming" | "studio" | "fitness" | "all",
    style?: "in-ear" | "on-ear" | "over-ear" | "all"
}
```

### Output Schema

```typescript
{
    headphones: Headphone[],
    summary?: string
}
```

Where `Headphone` is:

```typescript
{
    id: string,
    name: string,
    priceBracket: "budget" | "midrange" | "premium",
    activity: "commuting" | "gaming" | "studio" | "fitness",
    style: "in-ear" | "on-ear" | "over-ear",
    price: string,
    description: string,
    ctaUrl: string,
    imageUrl?: string
}
```

## Development

### Build

```bash
npm install
npm run build
```

This compiles TypeScript to the `dist/` folder.

### Watch Mode

```bash
npm run dev
```

Watches for changes and rebuilds automatically.

## Usage in MCP Server

### 1. Import the Widget Package

```typescript
import { headphonesWidgetPackage } from "headphones-widget";
```

### 2. Register in mcp.config.ts

```typescript
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
```

### 3. Create Widget Page

Create `src/app/widgets/headphones/page.tsx`:

```typescript
"use client";

import HeadphonesWidget from "headphones-widget/component";

export default function HeadphonesWidgetPage() {
    return <HeadphonesWidget />;
}
```

## Customization

### Adding More Headphones

Edit `src/data/headphones.ts` and add to the `HEADPHONES` array:

```typescript
{
    id: "my-headphones",
    name: "My Custom Headphones",
    priceBracket: "midrange",
    activity: "commuting",
    style: "over-ear",
    price: "$149",
    description: "Custom description",
    ctaUrl: "https://example.com/my-headphones",
}
```

### Styling

The component uses Tailwind CSS. Modify `src/components/HeadphonesWidget.tsx` to change the appearance.

### Tool Behavior

Edit `src/register.ts` to modify:
- Tool description (what the AI sees)
- Filter logic
- Response format

## Testing

The widget can be tested in multiple ways:

1. **Standalone**: Visit `/widgets/headphones` on the MCP server
2. **MCPJam Inspector**: Test with AI in the playground
3. **ChatGPT**: Connect via developer mode

## Key Files Explained

### `register.ts`

Handles MCP registration:
- Registers the HTML resource (widget UI)
- Registers the tool (find_headphones)
- Implements tool handler (filter & return data)

### `contracts.ts`

Defines Zod schemas for:
- Tool input validation
- Tool output structure
- Type safety

### `prompts.ts`

Contains LLM-facing text:
- Tool title & description
- Widget descriptions
- These guide the AI on when/how to use the tool

### `config.ts`

Widget metadata:
- Template URI
- Status messages
- Display preferences

## OpenAI Integration

When running in ChatGPT, the widget receives data via `window.openai.toolOutput`. The custom hooks in `hooks/useOpenAI.ts` provide easy access:

```typescript
const toolOutput = useWidgetProps<ToolOutput>();
// toolOutput contains { headphones: [...], summary: "..." }
```

## Dependencies

- `@modelcontextprotocol/sdk`: Official MCP SDK
- `zod`: Schema validation
- `react`: UI framework (peer dependency)
- `next`: Framework for component (peer dependency)

## License

MIT

