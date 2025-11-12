---
theme: default
background: https://images.unsplash.com/photo-1557683316-973673baf926?w=1920
class: text-center
highlighter: shiki
lineNumbers: true
info: |
  ## Building ChatGPT Apps with MCP
  Learn how to build interactive widgets for ChatGPT using the Model Context Protocol
drawings:
  persist: false
transition: slide-left
title: Building ChatGPT Apps with MCP
mdc: true
---

# Building ChatGPT Apps with MCP

An Educational Guide to the Model Context Protocol

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Press Space for next page <carbon:arrow-right class="inline"/>
  </span>
</div>

---
layout: center
---

# What is a ChatGPT App?

<v-clicks>

- Interactive widgets that appear **inside** ChatGPT conversations
- Responds to natural language queries
- Renders rich UI (carousels, cards, charts, etc.)
- Combines AI understanding with custom business logic

</v-clicks>

<div v-after class="mt-8 text-center">
  <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600" class="mx-auto rounded-lg shadow-lg" />
</div>

---

# What Really is a ChatGPT App?

<div class="grid grid-cols-2 gap-8">

<div>

## Traditional Apps
- User → UI → Backend
- Direct HTTP requests
- Explicit button clicks
- Fixed navigation paths

</div>

<div v-click>

## ChatGPT Apps
- User → ChatGPT → **MCP Server**
- Natural language intent
- AI decides when to call tools
- Dynamic, conversational flow

</div>

</div>

<div v-click class="mt-8 p-4 bg-blue-500/10 rounded-lg">
<strong>Key Difference:</strong> ChatGPT acts as an intelligent middleware that interprets user intent and calls your tools at the right time.
</div>

---

# Tool Structure

ChatGPT apps are built on **tools** - functions that ChatGPT can call

```typescript {all|1-4|6-10|12-16}
// Tool Definition
{
  name: "find_headphones",
  description: "Find headphones based on filters",
  
  // Input schema (what ChatGPT sends)
  inputSchema: {
    priceBracket: "budget" | "midrange" | "premium",
    activity: "commuting" | "gaming" | "studio" | "fitness"
  },
  
  // Tool execution (your business logic)
  handler: async (input) => {
    const results = filterHeadphones(input);
    return { headphones: results };
  }
}
```

---
layout: two-cols
---

# How It Works

```mermaid
sequenceDiagram
    participant User
    participant ChatGPT
    participant MCP Server
    participant Widget
    
    User->>ChatGPT: "Show budget headphones"
    ChatGPT->>ChatGPT: Analyze intent
    ChatGPT->>MCP Server: call find_headphones(budget)
    MCP Server->>MCP Server: Filter data
    MCP Server->>ChatGPT: Return results + HTML
    ChatGPT->>Widget: Load widget in iframe
    ChatGPT->>Widget: Inject data
    Widget->>User: Display interactive UI
```


---
layout: center
class: text-center
---

# TechGear Demo

## An Electronics Shopping Assistant

<div class="mt-1">
</div>

<div class="mt-4 text-xl">
  "Show me budget headphones for gaming"
</div>

---

# Basic Parts of a ChatGPT App

<div class="grid grid-cols-3 gap-6 mt-8">

<div v-click="1" class="p-4 bg-purple-500/10 rounded-lg">

### 🖥️ MCP Server
- Next.js application
- Exposes `/mcp` endpoint
- Handles JSON-RPC protocol
- Registers tools & resources

</div>

<div v-click="2" class="p-4 bg-blue-500/10 rounded-lg">

### 🎨 Widget Package
- React component
- Business logic
- Data & filtering
- Self-contained & reusable

</div>

<div v-click="3" class="p-4 bg-green-500/10 rounded-lg">

### 🧪 Playground
- Local testing environment
- MCPJam Inspector
- Debug before ChatGPT
- Free AI models

</div>

</div>

<div v-click="4" class="mt-8 text-center text-lg">
<strong>Tech Stack:</strong> Next.js + React + TypeScript + Zod + MCP SDK
</div>

---

# Architecture Overview

```mermaid
graph TB
    subgraph "ChatGPT Environment"
        A[User Query]
        B[ChatGPT AI]
        C[Widget Iframe]
    end
    
    subgraph "Your Infrastructure"
        D[MCP Server<br/>Next.js]
        E[Widget Package<br/>React Component]
        F[Business Logic<br/>Data Filtering]
    end
    
    A --> B
    B -->|JSON-RPC| D
    D --> F
    F --> D
    D -->|HTML + Data| B
    B --> C
    C -->|Renders| E
    
    style D fill:#9333ea
    style E fill:#3b82f6
    style F fill:#10b981
```

---

# Project Layout

<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.2 !important;
}
</style>

```
techgear/
├── packages/
│   ├── mcp/                          # Next.js MCP Server
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── mcp/route.ts      # MCP endpoint
│   │   │   │   ├── widgets/          # Preview pages
│   │   │   │   │   └── headphones/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── page.tsx          # Homepage
│   │   │   └── lib/
│   │   │       ├── types.ts          # Type definitions
│   │   │       ├── helpers.ts        # Metadata creators
│   │   │       └── loadWidgets.ts    # Dynamic loader
│   │   ├── mcp.config.ts             # Widget registry
│   │   └── next.config.ts            # Critical config!
│   │
│   ├── widgets/
│   │   └── headphones-widget/        # Widget package
│   │       └── src/
│   │           ├── components/       # React UI
│   │           ├── data/             # Business logic
│   │           ├── hooks/            # ChatGPT integration
│   │           ├── semantic/         # Zod schemas
│   │           └── register.ts       # MCP registration
│   │
│   └── playground/                   # Testing
│       └── mcp.config.json           # Inspector config
```






---
layout: center
class: text-center
---

# Building a Widget

## Let's Break It Down

<div class="mt-12 grid grid-cols-5 gap-4">
  <div v-click="1" class="p-4 bg-blue-500/20 rounded">1️⃣ Data</div>
  <div v-click="2" class="p-4 bg-purple-500/20 rounded">2️⃣ Schemas</div>
  <div v-click="3" class="p-4 bg-green-500/20 rounded">3️⃣ UI</div>
  <div v-click="4" class="p-4 bg-yellow-500/20 rounded">4️⃣ Integration</div>
  <div v-click="5" class="p-4 bg-red-500/20 rounded">5️⃣ Registration</div>
</div>

---

# Step 1: Data & Logic

Define your data and filtering logic
<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.2 !important;
}
</style>
```typescript {all|1-12|14-28}
// src/data/headphones.ts
export const HEADPHONES: Headphone[] = [
  {
    id: "arc-commuter",
    name: "ArcSound Metro ANC",
    priceBracket: "budget",
    activity: "commuting",
    style: "over-ear",
    price: "$99",
    description: "Lightweight ANC cans with USB-C fast charging",
  },
  // ... more headphones
];

export function filterHeadphones(
  priceBracket?: string,
  activity?: string,
  style?: string
): Headphone[] {
  return HEADPHONES.filter((headphone) => {
    const priceMatch = !priceBracket || 
                       priceBracket === "all" || 
                       headphone.priceBracket === priceBracket;
    const activityMatch = !activity || 
                          activity === "all" || 
                          headphone.activity === activity;
    return priceMatch && activityMatch;
  });
}
```

---

# Step 2: Zod Schemas
<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.2 !important;
}
</style>
Runtime validation + TypeScript types from a single source

```typescript {all|1-10|12-20|22-24}
// src/semantic/contracts.ts
import z from "zod";

export const FindHeadphonesToolInputContract = z.object({
  priceBracket: z.enum(["budget", "midrange", "premium", "all"])
    .optional()
    .describe("Price range filter"),
  activity: z.enum(["commuting", "gaming", "studio", "fitness", "all"])
    .optional()
    .describe("Activity filter"),
});

export const HeadphoneContract = z.object({
  id: z.string(),
  name: z.string(),
  priceBracket: z.enum(["budget", "midrange", "premium"]),
  activity: z.enum(["commuting", "gaming", "studio", "fitness"]),
  price: z.string(),
  description: z.string(),
});

// TypeScript types inferred from schemas
export type FindHeadphonesToolInput = z.infer<typeof FindHeadphonesToolInputContract>;
export type Headphone = z.infer<typeof HeadphoneContract>;
```

<div v-click class="mt-4 p-3 bg-yellow-500/10 rounded">
<strong>Why Zod?</strong> Single schema provides both compile-time types AND runtime validation!
</div>

---



# Step 3: ChatGPT Integration

The critical hook that receives data from ChatGPT
<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.2 !important;
}
</style>
```typescript {all|1-5|7-21|23-30}
// src/hooks/useOpenAI.ts
import { useSyncExternalStore } from "react";

// ChatGPT fires this event when it updates window.openai
const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";

function useOpenAIGlobal<K extends keyof any>(key: K): any {
  return useSyncExternalStore(
    // Subscribe to changes
    (onChange) => {
      const handleSetGlobal = (event: CustomEvent) => {
        if (event.detail?.globals?.[key]) {
          onChange(); // Trigger React re-render
        }
      };
      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      return () => window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
    },
    // Get current value
    () => window.openai?.[key] ?? null,
    () => null // Server snapshot
  );
}

// Hook to get widget data
export function useWidgetProps<T>(defaultState?: T): T | null {
  const toolOutput = useOpenAIGlobal("toolOutput") as T | null;
  const fallback = typeof defaultState === "function" ? defaultState() : defaultState;
  return toolOutput ?? fallback;
}
```

---

# Step 4: React Component

Build the UI that renders in ChatGPT
<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.2 !important;
}
</style>
```typescript {all|1-8|10-16|18-30}
// src/components/HeadphonesWidget.tsx
"use client";
import { useWidgetProps } from "../hooks/useOpenAI";

export function HeadphonesWidget({ fallbackData }: HeadphonesWidgetProps) {
  // Get data from ChatGPT or use fallback for preview
  const toolOutput = useWidgetProps<{ headphones: Headphone[] }>(fallbackData);
  
  if (!toolOutput) {
    return <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" />
      <span className="ml-3">Loading headphones...</span>
    </div>;
  }

  const { headphones, summary } = toolOutput;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {summary && <p className="text-lg mb-6">{summary}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {headphones.map((headphone) => (
            <HeadphoneCard key={headphone.id} headphone={headphone} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

# Step 5: AI-Facing Descriptions

Teach ChatGPT when and how to use your tool
<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.2 !important;
}
</style>
```typescript {all|1-15|17-20}
// src/semantic/prompts.ts
export const headphonesWidgetPrompts = {
  toolTitle: "Find Headphones",
  
  toolDescription: `Find and filter headphones based on price, activity, and style.

Use this tool when users ask about headphones, earbuds, or audio equipment.

Examples:
- "Show me budget headphones"
- "Find gaming headphones"
- "I need over-ear headphones for commuting"
- "What headphones do you have for the gym?"

Filters: priceBracket (budget/midrange/premium), activity (commuting/gaming/studio/fitness)`,

  resourceTitle: "Headphones Widget HTML",
  resourceDescription: "HTML template for the interactive headphones carousel widget",
  widgetDescription: "Displays an interactive carousel of headphone recommendations",
};
```

<div v-click class="mt-4 p-3 bg-blue-500/10 rounded">
<strong>Pro Tip:</strong> Be explicit, provide examples, use natural language. ChatGPT learns from these descriptions!
</div>

---

# Step 6a: MCP Registration - Resource

Register the HTML template with the MCP server

<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.2 !important;
}
</style>

```typescript {all|1-6|8-25}
// src/register.ts
async function registerWidget(context: WidgetContext): Promise<void> {
  const { server, logger, getHtml, basePath } = context;
  
  // Fetch widget HTML from Next.js
  const html = await getHtml(basePath); // e.g., "/widgets/headphones"
  
  // STEP 1: Register HTML resource
  server.registerResource(
    "headphones-widget",                    // Resource name
    "ui://widget/headphones-template.html", // Template URI
    {
      title: headphonesWidgetPrompts.resourceTitle,
      mimeType: "text/html+skybridge",      // CRITICAL!
      _meta: createResourceMeta(
        headphonesWidgetPrompts.widgetDescription,
        true // prefersBorder
      ),
    },
    async (uri: URL) => ({
      contents: [{
        uri: uri.href,
        mimeType: "text/html+skybridge",
        text: `<html>${html}</html>`,
      }],
    })
  );
  // ... tool registration next
}
```

<div v-click class="mt-4 p-3 bg-blue-500/10 rounded">
<strong>Key:</strong> The resource registration makes the widget HTML available to ChatGPT. The <code>mimeType</code> must be <code>text/html+skybridge</code>!
</div>

---

# Step 6b: MCP Registration - Tool

Register the tool that ChatGPT can call

<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.2 !important;
}
</style>

```typescript {all|1-10|12-20}
// src/register.ts (continued)
async function registerWidget(context: WidgetContext): Promise<void> {
  // ... resource registration above
  
  // STEP 2: Register tool
  server.registerTool(
    "find_headphones",                      // Tool name (what ChatGPT calls)
    {
      title: headphonesWidgetPrompts.toolTitle,
      description: headphonesWidgetPrompts.toolDescription,
      inputSchema: FindHeadphonesToolInputContract.shape,
      _meta: createWidgetMeta(headphonesWidgetMetadata), // Links to widget
    },
    async (input) => {
      // Filter headphones based on input
      const headphones = filterHeadphones(input.priceBracket, input.activity);
      
      return {
        content: [{ type: "text", text: "Found headphones" }],
        structuredContent: { headphones },     // Becomes window.openai.toolOutput
        _meta: createWidgetMeta(headphonesWidgetMetadata),
      };
    }
  );
}
```

<div v-click class="mt-4 p-3 bg-purple-500/10 rounded">
<strong>Key:</strong> The <code>_meta</code> field links the tool to the widget template. The <code>structuredContent</code> becomes <code>window.openai.toolOutput</code>.
</div>

---

# Widget Registration Flow

```mermaid
graph LR
    A[Widget Package] -->|Import| B[MCP Config]
    B -->|loadWidgets| C[MCP Server]
    C -->|registerWidget| D[Register Resource]
    D --> E[HTML Template]
    C -->|registerWidget| F[Register Tool]
    F --> G[Tool Handler]
    G --> H[Business Logic]
    H --> I[Return Data + Meta]
    I --> J[ChatGPT]
    J --> K[Load HTML]
    J --> L[Inject Data]
    K --> M[Widget Renders]
    L --> M
    
    style D fill:#3b82f6
    style F fill:#9333ea
    style M fill:#10b981
```

---

# Widget Package Exports

Create a clean public API
<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.2 !important;
}
</style>
```typescript
// src/index.ts - Public exports

// Types
export * from "./types";

// Configuration
export * from "./config";

// Registration function
export * from "./register";

// React component (for preview pages)
export * from "./components/HeadphonesWidget";

// Hooks (reusable for other widgets)
export * from "./hooks/useOpenAI";
```

<div class="mt-8">

## Then Build It!

```bash
cd packages/widgets/headphones-widget
npm run build
```

This compiles TypeScript → JavaScript in `dist/` folder

</div>

---
layout: center
class: text-center
---

# MCP Server Setup

## Bringing It All Together

<div class="mt-8 text-6xl">
🖥️ ↔️ 🎨 ↔️ 🤖
</div>

---

# MCP Server Components

Building the Next.js server that hosts your MCP endpoint

<div class="grid grid-cols-3 gap-4 mt-8">

<div v-click="1" class="p-4 bg-blue-500/10 rounded-lg border-2 border-blue-500/30">

### 1️⃣ MCP.config
Widget registry

</div>

<div v-click="2" class="p-4 bg-purple-500/10 rounded-lg border-2 border-purple-500/30">

### 2️⃣ Endpoint
HTTP route handler

</div>

<div v-click="3" class="p-4 bg-green-500/10 rounded-lg border-2 border-green-500/30">

### 3️⃣ Tooling
Helpers & Load Widgets

</div>

<div v-click="4" class="p-4 bg-yellow-500/10 rounded-lg border-2 border-yellow-500/30">

### 4️⃣ Next.js Config
**Critical:** Asset prefix

</div>

<div v-click="5" class="p-4 bg-red-500/10 rounded-lg border-2 border-red-500/30">

### 5️⃣ HomePage
Server info & links

</div>

<div v-click="6" class="p-4 bg-indigo-500/10 rounded-lg border-2 border-indigo-500/30">

### 6️⃣ Widget Page
Preview & testing

</div>

</div>

---

# 1️⃣ MCP.config - Widget Registry

Central configuration for all widgets

<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.3 !important;
}
</style>

```typescript {all|1|3-10|12-22}
// mcp.config.ts
import { headphonesWidgetPackage } from "headphones-widget";

interface WidgetRegistryEntry {
  package: WidgetPackage;
  mcp: {
    enabled: boolean;
    production: boolean;
    basePath: string;
  };
}

const config = {
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

---

# 2️⃣ Endpoint - MCP Route Handler

HTTP route handling JSON-RPC requests

<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.3 !important;
}
</style>

```typescript {all|1-3|5-17|19-20}
// src/app/mcp/route.ts
import { createMcpHandler } from "mcp-handler";
import { loadWidgets } from "@/lib/loadWidgets";

const handler = createMcpHandler(async (server) => {
  const context = {
    server,
    logger: {
      info: console.info.bind(console),
      error: console.error.bind(console),
    },
    getHtml: async (path: string) => {
      const baseURL = getBaseURL();
      return await fetch(`${baseURL}${path}`).then(r => r.text());
    },
  };
  
  await loadWidgets(context);  // Load all widgets
});

export const GET = handler;
export const POST = handler;
```

---

# 3️⃣ Tooling - Helpers & Load Widgets

Utilities that power the MCP server

<div class="grid grid-cols-2 gap-6 mt-8">

<div>

### Metadata Helpers

<style>
pre, code, .shiki {
  font-size: 0.5rem !important;
  line-height: 1.2 !important;
}
</style>

```typescript
// src/lib/helpers.ts

// Create resource metadata
export function createResourceMeta(
  description: string,
  prefersBorder: boolean
) {
  return {
    "openai/widgetDescription": description,
    "openai/widgetPrefersBorder": prefersBorder,
  };
}

// Create widget metadata
export function createWidgetMeta(
  metadata: WidgetMetadata
) {
  return {
    "openai/outputTemplate": metadata.templateUri,
    "openai/toolInvocation/invoking": metadata.invoking,
    "openai/toolInvocation/invoked": metadata.invoked,
  };
}
```

</div>

<div v-click>

### Widget Loader

```typescript
// src/lib/loadWidgets.ts

export async function loadWidgets(
  context: Omit<WidgetContext, "basePath">
) {
  const { logger } = context;
  
  // Filter enabled widgets
  const enabledWidgets = Object.entries(
    WIDGET_REGISTRY
  ).filter(([, entry]) => entry.mcp.enabled);
  
  // Register each widget
  for (const [widgetId, entry] of enabledWidgets) {
    const widgetContext = {
      ...context,
      basePath: entry.mcp.basePath,
    };
    
    await entry.package.registerWidget(
      widgetContext
    );
  }
}
```

</div>

</div>

---

# 4️⃣ Next.js Config - Critical Setup

⚡ **CRITICAL** for widget rendering in ChatGPT

<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.3 !important;
}
</style>

```typescript {all|4-11|13-16}
// next.config.ts
import type { NextConfig } from "next";

// Makes script URLs absolute in development
function getAssetPrefix(): string {
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}`;
  }
  return "";
}

const nextConfig: NextConfig = {
  assetPrefix: getAssetPrefix(),              // ⚡ CRITICAL!
  transpilePackages: ["headphones-widget"],
  output: "standalone",
};

export default nextConfig;
```

<div v-click class="mt-4 p-4 bg-red-500/10 rounded border-2 border-red-500/30">
<strong>Without this:</strong> Blank pages in ChatGPT! Scripts try to load from chatgpt.com instead of your server.
</div>

---

# 5️⃣ HomePage - Server Info

Landing page with server information

<style>
pre, code, .shiki {
  font-size: 0.6rem !important;
  line-height: 1.4 !important;
}
</style>

```tsx
// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold">TechGear MCP Server</h1>
        <p className="text-xl mt-4">ChatGPT App Development</p>
        
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">Available Widgets</h2>
          <Link href="/widgets/headphones">
            🎧 Headphones Widget Preview
          </Link>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Endpoints</h2>
          <p className="mt-2">MCP Endpoint: <code>/mcp</code></p>
        </div>
      </div>
    </div>
  );
}
```

---

# 6️⃣ Widget Page - Preview & Testing

Test widgets without MCP protocol

<style>
pre, code, .shiki {
  font-size: 0.6rem !important;
  line-height: 1.4 !important;
}
</style>

```tsx
// src/app/widgets/headphones/page.tsx
"use client";
import { HeadphonesWidget } from "headphones-widget";

export default function HeadphonesWidgetPage() {
  return <HeadphonesWidget />;
}
```

<div class="mt-8 grid grid-cols-2 gap-6">

<div v-click>

### 🎯 Benefits
- Fast visual testing
- No MCP overhead
- Debug styling easily
- Immediate feedback

</div>

<div v-click>

### 📍 Access
Visit: `localhost:3000/widgets/headphones`

Shows widget with fallback data

</div>

</div>

---

# Import Widget Config

How the server imports your widget

<style>
pre, code, .shiki {
  font-size: 0.6rem !important;
  line-height: 1.4 !important;
}
</style>

<div class="grid grid-cols-2 gap-6 mt-6">

<div>

### Widget Exports

```typescript
// headphones-widget/src/index.ts

export const headphonesWidgetPackage = {
  config: {
    id: "headphones",
    name: "Headphones Widget"
  },
  registerWidget: async (context) => {
    // Register tools & resources
  }
};
```

</div>

<div v-click>

### Server Imports

```typescript
// mcp.config.ts

import { 
  headphonesWidgetPackage 
} from "headphones-widget";

const config = {
  widgets: {
    headphones: {
      package: headphonesWidgetPackage,
      mcp: { ... }
    }
  }
};
```

</div>

</div>

<div v-click class="mt-8 p-4 bg-blue-500/10 rounded">

The `loadWidgets()` function reads this config and calls each widget's `registerWidget()` method

</div>

---

# That's All You Need! 

<div class="mt-8 text-center">

## The MCP Server Does 3 Things:

<div class="grid grid-cols-3 gap-8 mt-12">

<div v-click="1" class="p-8 bg-blue-500/20 rounded-lg">

### 1. Import
```typescript
import { widget }
from "headphones-widget"
```

</div>

<div v-click="2" class="p-8 bg-purple-500/20 rounded-lg">

### 2. Configure
```typescript
widgets: {
  headphones: { ... }
}
```

</div>

<div v-click="3" class="p-8 bg-green-500/20 rounded-lg">

### 3. Load
```typescript
await loadWidgets()
```

</div>

</div>

</div>

<div v-click class="mt-12 p-6 bg-green-500/10 rounded-lg border-2 border-green-500/30 text-center">

### ✨ No tool logic, no UI code, no business rules in the server!

Everything lives in the widget package.

</div>

---
layout: center
class: text-center
---

# 🧪 Testing with MCPJam

## Test Locally Before Deploying

<div class="mt-8 grid grid-cols-2 gap-8">

<div v-click>

### Why MCPJam Inspector?
- 🔌 Connects to local MCP server
- 💬 Chat interface for testing
- 🔍 JSON-RPC message debugger
- 🎨 Widget preview
- 🆓 Free AI models included
- ⚡ Fast iteration cycle

</div>

<div v-click>

### Testing Workflow
1. Start MCP server locally
2. Launch MCPJam Inspector
3. Connect to your server
4. Test with natural language
5. Debug with message viewer
6. Iterate quickly

</div>

</div>

---

# Setup MCPJam Inspector

Quick setup in 2 steps

<div class="grid grid-cols-2 gap-8 mt-8">

<div>

### 1. Configuration

Create `packages/playground/mcp.config.json`:

<style>
pre, code, .shiki {
  font-size: 0.55rem !important;
  line-height: 1.3 !important;
}
</style>

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

</div>

<div v-click>

### 2. Launch Both

```bash
# Terminal 1: MCP server
cd packages/mcp
npm run dev

# Terminal 2: Inspector
cd packages/playground
npm run inspector
```

<div class="mt-4 p-3 bg-blue-500/10 rounded">

Inspector opens at: `http://127.0.0.1:6274`

</div>

</div>

</div>

---

# Testing in Inspector

<div class="grid grid-cols-2 gap-8 mt-8">

<div>

### Connect to Server

1. Click **Servers** tab
2. Find "TechGear"
3. Click **Connect**
4. Wait for ✅ green checkmark
5. Go to **Playground** tab

</div>

<div v-click>

### Test with Prompts

```
Show me headphones
```

```
Find budget headphones for gaming
```

```
I need over-ear headphones for commuting
```

<div class="mt-4 p-3 bg-green-500/10 rounded">

✅ Widget renders with filtered results

</div>

</div>

</div>

---

# Debugging Tools

<div class="grid grid-cols-2 gap-8 mt-8">

<div>

### Messages Tab
View raw JSON-RPC protocol

<style>
pre, code, .shiki {
  font-size: 0.45rem !important;
  line-height: 1.1 !important;
}
</style>

```json
// Tool call request
{
  "method": "tools/call",
  "params": {
    "name": "find_headphones",
    "arguments": {
      "priceBracket": "budget"
    }
  }
}

// Tool response
{
  "structuredContent": {
    "headphones": [...]
  },
  "_meta": {
    "openai/outputTemplate": "ui://..."
  }
}
```

</div>

<div v-click>

### Browser DevTools (F12)

**Console Tab**
```javascript
window.openai?.toolOutput
```

**Network Tab**
- Check asset loading (200 OK)
- Verify absolute URLs
- Look for 404 errors

**Elements Tab**
- Inspect HTML structure
- Check Tailwind classes

</div>

</div>

---

# Success Checklist

Verify everything works before deploying

<div class="mt-8 grid grid-cols-2 gap-6">

<div>

### ✅ Server Connection
- Green checkmark on connect
- Tools listed correctly
- Resources discovered

### ✅ Widget Rendering
- HTML loads in iframe
- Tailwind CSS applied
- No console errors

</div>

<div v-click>

### ✅ Data Flow
- Tool receives correct params
- `structuredContent` present
- Widget shows filtered data

### ✅ Protocol
- Valid JSON-RPC messages
- Correct MIME types
- Metadata complete

</div>

</div>

<div v-click class="mt-8 p-6 bg-green-500/10 rounded-lg border-2 border-green-500/30 text-center">

### 🎉 All checks pass? Your MCP server is ready for ChatGPT!

</div>

---
layout: center
class: text-center
---

# What You've Learned

<div class="grid grid-cols-3 gap-8 mt-12">

<div v-click="1" class="p-6 bg-blue-500/20 rounded-lg">

### Widget Package
Self-contained logic  
Zod validation  
React components  
MCP registration

</div>

<div v-click="2" class="p-6 bg-purple-500/20 rounded-lg">

### MCP Server
Widget registry  
Dynamic loading  
JSON-RPC endpoint  
Asset configuration

</div>

<div v-click="3" class="p-6 bg-green-500/20 rounded-lg">

### Testing Flow
Preview pages  
MCPJam Inspector  
Browser DevTools  
Production ready

</div>

</div>

---

# Critical Configurations

The 5 must-have settings for widgets

<div class="mt-8 grid grid-cols-1 gap-4">

<div v-click class="p-4 bg-red-500/10 rounded-lg border-l-4 border-red-500">

**1. Asset Prefix** → `assetPrefix: getAssetPrefix()` in next.config.ts

</div>

<div v-click class="p-4 bg-orange-500/10 rounded-lg border-l-4 border-orange-500">

**2. Event-Driven Hook** → `useSyncExternalStore` not polling

</div>

<div v-click class="p-4 bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500">

**3. MIME Type** → `text/html+skybridge` not `text/html`

</div>

<div v-click class="p-4 bg-green-500/10 rounded-lg border-l-4 border-green-500">

**4. Complete Metadata** → `_meta` in resource, tool, response

</div>

<div v-click class="p-4 bg-blue-500/10 rounded-lg border-l-4 border-blue-500">

**5. Response Format** → `structuredContent` at root level

</div>

</div>

---

# Next Steps

Your path to building ChatGPT apps

<div class="mt-8 grid grid-cols-2 gap-8">

<div>

### Getting Started

<v-clicks>

1. 📥 Clone the TechGear repo
2. 📖 Read DEVELOPER_GUIDE.md
3. 🏗️ Build your first widget
4. 🧪 Test with MCPJam
5. 🚀 Deploy to ChatGPT

</v-clicks>

</div>

<div v-click>

### Resources

**Documentation**
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCPJam Inspector](https://docs.mcpjam.com/)

**TechGear Files**
- `DEVELOPER_GUIDE.md`
- `QUICK_REFERENCE.md`
- `SLIDES_CHEATSHEET.md`

</div>

</div>

---
layout: center
class: text-center
---

# 🚀 You're Ready!

<div class="mt-12 text-2xl">

You now know how to build ChatGPT apps with MCP

</div>

<div class="mt-12 grid grid-cols-2 gap-8 max-w-4xl mx-auto">

<div v-click class="p-6 bg-blue-500/20 rounded-lg">

### What You Built
✅ Widget package  
✅ MCP server  
✅ Testing workflow  
✅ Production-ready app

</div>

<div v-click class="p-6 bg-purple-500/20 rounded-lg">

### What You Learned
✅ MCP protocol  
✅ Event-driven hooks  
✅ Dynamic loading  
✅ Critical configs

</div>

</div>

<div v-click class="mt-12 text-3xl font-bold">

**Go build something amazing!** 🎉

</div>

---
layout: end
---

# Thank You!

### Building ChatGPT Apps with MCP

<div class="mt-12 text-xl opacity-75">

Questions? Check `DEVELOPER_GUIDE.md`

</div>

<div class="mt-8 text-base opacity-50">

TechGear - An educational guide to the Model Context Protocol

</div>
