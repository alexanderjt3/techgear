# TechGear ChatGPT App Development Guide

This comprehensive guide walks through building **TechGear**, an electronics shopping assistant that suggests headphones inside ChatGPT using the OpenAI Apps SDK and Model Context Protocol (MCP). You'll learn to develop locally with Next.js for the UI, create reusable widget packages, expose MCP tools, and test everything with MCPJam Inspector before deploying to ChatGPT.

> **Educational Focus**: This guide is designed to teach MCP fundamentals and ChatGPT app development without proprietary framework dependencies. We use only the official MCP SDK and standard web technologies.

> **Sources**: [OpenAI Apps SDK Quickstart](https://developers.openai.com/apps-sdk/quickstart), [MCP Specification](https://spec.modelcontextprotocol.io/), [MCPJam Inspector Docs](https://docs.mcpjam.com/)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Understanding the Architecture](#2-understanding-the-architecture)
3. [Project Structure Setup](#3-project-structure-setup)
4. [Building Helper Utilities](#4-building-helper-utilities)
5. [Creating the Headphones Widget Package](#5-creating-the-headphones-widget-package)
6. [Building the MCP Server](#6-building-the-mcp-server)
7. [Critical Configuration for Widget Rendering](#7-critical-configuration-for-widget-rendering)
8. [Testing with MCPJam Inspector](#8-testing-with-mcpjam-inspector)
9. [Troubleshooting Widget Rendering](#9-troubleshooting-widget-rendering)
10. [Testing with ChatGPT](#10-testing-with-chatgpt)
11. [Key Learnings and Best Practices](#11-key-learnings-and-best-practices)

---

## 1. Prerequisites

### Required Software

- **Node.js 20+** and npm (install via [nodejs.org](https://nodejs.org) or nvm)
- **Git** for version control
- **Visual Studio Code** (recommended) or your preferred code editor
- **MCPJam Inspector** for local testing (`npx @mcpjam/inspector@latest`)
- A modern web browser (Chrome, Firefox, Safari)

### Verify Your Environment

**macOS/Linux:**

```bash
node --version  # Should show v20.x.x or higher
npm --version   # Should show v10.x.x or higher
git --version   # Any recent version
```

**Using nvm (Recommended):**

```bash
# Install Node 20 if you don't have it
nvm install 20
nvm use 20
```

### Knowledge Prerequisites

- Basic understanding of React and TypeScript
- Familiarity with Next.js (helpful but not required)
- Understanding of REST APIs and HTTP
- Basic terminal/command line skills

---

## 2. Understanding the Architecture

Before we build anything, let's understand how a ChatGPT MCP app works.

### What is MCP (Model Context Protocol)?

MCP is a protocol that allows AI assistants like ChatGPT to:

- **Call Tools**: Execute functions you define (e.g., "find headphones")
- **Access Resources**: Read data you provide (e.g., HTML templates)
- **Use Prompts**: Leverage pre-defined prompt templates

### How TechGear Works

```
┌─────────────────────────────────────────────────────────────┐
│                         ChatGPT                             │
│  User: "Show me budget headphones for gaming"              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ 1. AI decides to call tool
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              MCP Client (in ChatGPT)                        │
│  Sends JSON-RPC request to MCP server                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ 2. HTTP POST to /mcp endpoint
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         MCP Server (Next.js at localhost:3000)              │
│  - Receives tool call request                              │
│  - Routes to headphones widget                             │
│  - Filters headphones data                                 │
│  - Returns structured data + HTML template                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ 3. Response with data
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              MCP Client (in ChatGPT)                        │
│  - Loads HTML template in sandboxed iframe                 │
│  - Injects tool data into window.openai.toolOutput        │
│  - Renders widget inline in chat                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ 4. Display to user
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                       ChatGPT                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Widget: Shows 2 filtered headphones                │   │
│  │  [Budget Gaming Headphones]                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **MCP Server** (`packages/mcp`): A Next.js app that exposes the `/mcp` endpoint
2. **Widget Package** (`packages/widgets/headphones-widget`): Reusable npm package with tool logic and React UI
3. **Playground** (`packages/playground`): Testing setup with MCPJam Inspector

### Why This Architecture?

- **Monorepo**: All packages in one repository for easier development
- **Widget as Package**: Widgets are self-contained and can be reused across projects
- **Next.js Server**: Provides both the MCP endpoint and widget HTML serving
- **No Framework Lock-in**: Uses only official MCP SDK, no proprietary frameworks

---

## 3. Project Structure Setup

### Create the Project Directory

**macOS/Linux:**

```bash
# Create project root
mkdir -p ~/projects/techgear
cd ~/projects/techgear

# Initialize as an npm workspace
npm init -y

# Create the monorepo structure
mkdir -p packages/mcp/src/{app,lib}
mkdir -p packages/widgets/headphones-widget/src/{components,data,hooks,semantic}
mkdir -p packages/playground
```

### Set Up Workspace Configuration

Create or modify `package.json` in the project root:

```json
{
  "name": "techgear",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "packages/widgets/*"
  ],
  "scripts": {
    "dev": "cd packages/mcp && npm run dev",
    "build": "npm run build:widget && npm run build:mcp",
    "build:widget": "cd packages/widgets/headphones-widget && npm run build",
    "build:mcp": "cd packages/mcp && npm run build",
    "inspector": "cd packages/playground && npm run inspector"
  }
}
```

**Why workspaces?** NPM workspaces allow us to manage multiple packages in one repository. The MCP server can reference the widget package locally without publishing to npm.

### Final Directory Structure

```
techgear/
├── package.json                    # Workspace root config
├── packages/
│   ├── mcp/                       # Next.js MCP server
│   │   ├── src/
│   │   │   ├── app/              # Next.js app directory
│   │   │   │   ├── mcp/          # MCP endpoint route
│   │   │   │   │   └── route.ts  # HTTP handler
│   │   │   │   ├── widgets/      # Widget preview pages
│   │   │   │   │   └── headphones/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── layout.tsx    # Root layout
│   │   │   │   ├── page.tsx      # Homepage
│   │   │   │   └── globals.css   # Global styles
│   │   │   └── lib/              # Helper utilities
│   │   │       ├── types.ts      # TypeScript types
│   │   │       ├── helpers.ts    # MCP metadata creators
│   │   │       └── loadWidgets.ts # Widget loader
│   │   ├── mcp.config.ts         # Widget registry
│   │   ├── next.config.ts        # Next.js config (critical!)
│   │   ├── tailwind.config.ts    # Tailwind CSS config
│   │   ├── tsconfig.json         # TypeScript config
│   │   └── package.json          # Dependencies
│   │
│   ├── widgets/
│   │   └── headphones-widget/    # Headphones widget package
│   │       ├── src/
│   │       │   ├── components/
│   │       │   │   └── HeadphonesWidget.tsx  # React component
│   │       │   ├── data/
│   │       │   │   └── headphones.ts         # Data & filtering
│   │       │   ├── hooks/
│   │       │   │   └── useOpenAI.ts          # ChatGPT integration
│   │       │   ├── semantic/
│   │       │   │   ├── contracts.ts          # Zod schemas
│   │       │   │   └── prompts.ts            # AI descriptions
│   │       │   ├── types.ts                  # Type definitions
│   │       │   ├── config.ts                 # Widget metadata
│   │       │   ├── register.ts               # MCP registration
│   │       │   ├── index.ts                  # Public exports
│   │       │   └── helpers.ts                # Helper functions
│   │       ├── tsconfig.json
│   │       └── package.json
│   │
│   └── playground/               # Testing setup
│       ├── mcp.config.json      # MCPJam Inspector config
│       ├── package.json         # Inspector launch script
│       └── README.md            # Testing instructions
```

---

## 4. Building Helper Utilities

Instead of using a proprietary framework, we'll create simple helper functions that generate MCP metadata. This makes the code easier to understand and maintain.

### Step 1: Define TypeScript Types

Create `packages/mcp/src/lib/types.ts`:

```typescript
import { McpServer } from "mcp-handler";

/**
 * Logger interface for widget registration
 */
export interface Logger {
    info: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
}

/**
 * Context provided to widgets during registration
 */
export interface WidgetContext {
    server: McpServer;           // MCP server instance
    logger: Logger;              // Logging interface
    basePath: string;            // Path to widget HTML (e.g., "/widgets/headphones")
    getHtml: (path: string) => Promise<string>;  // Function to fetch HTML
}

/**
 * Widget metadata for OpenAI Apps SDK
 */
export interface WidgetMetadata {
    templateUri: string;         // URI to widget HTML (e.g., "ui://headphones")
    invoking: string;            // Status message while tool executes
    invoked: string;             // Status message after tool completes
    prefersBorder: boolean;      // Whether widget should have border/shadow
}

/**
 * Widget configuration
 */
export interface WidgetConfig {
    id: string;                  // Unique widget identifier
    name: string;                // Display name
    description: string;         // Human-readable description
}

/**
 * Widget package structure
 */
export interface WidgetPackage {
    config: WidgetConfig;
    registerWidget: (context: WidgetContext) => Promise<void>;
}
```

**Why these types?** TypeScript types provide compile-time safety and make it clear what data flows between components. The `WidgetContext` is the contract between the MCP server and widget packages.

### Step 2: Create Metadata Helper Functions

Create `packages/mcp/src/lib/helpers.ts`:

```typescript
import { WidgetMetadata } from "./types";

/**
 * Create metadata for MCP resource registration
 * 
 * Resources are HTML templates that ChatGPT loads to render widgets.
 * This metadata tells ChatGPT how to configure the widget iframe.
 * 
 * @param description - Human-readable description of what the widget displays
 * @param prefersBorder - Whether the widget should render with a border and shadow
 * @returns Metadata object with OpenAI-specific fields
 */
export function createResourceMeta(
    description: string,
    prefersBorder: boolean
): Record<string, unknown> {
    return {
        "openai/widgetDescription": description,
        "openai/widgetPrefersBorder": prefersBorder,
    };
}

/**
 * Create metadata for MCP tool registration
 * 
 * Tools are functions that ChatGPT can call. This metadata links the tool
 * to a widget template and configures status messages.
 * 
 * @param metadata - Widget metadata configuration
 * @returns Metadata object with OpenAI-specific fields
 */
export function createWidgetMeta(
    metadata: WidgetMetadata
): Record<string, unknown> {
    return {
        "openai/outputTemplate": metadata.templateUri,
        "openai/toolInvocation/invoking": metadata.invoking,
        "openai/toolInvocation/invoked": metadata.invoked,
    };
}

/**
 * Get base URL for the application
 * 
 * In development, returns localhost with the port from environment.
 * In production, returns the Vercel URL or other deployment URL.
 * 
 * @returns Base URL string
 */
export function getBaseURL(): string {
    // In production on Vercel
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // In development
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}`;
}
```

**Plain English Explanation:**

- **`createResourceMeta`**: When you register a resource (HTML template), this function creates the metadata that tells ChatGPT "this is a widget, here's what it displays, and here's how to render it."
- **`createWidgetMeta`**: When you register a tool (function), this function links the tool to its widget template and sets the loading messages users see.
- **`getBaseURL`**: Figures out what URL to use based on where the app is running (localhost in development, your domain in production).

### Step 3: Create Widget Loader

Create `packages/mcp/src/lib/loadWidgets.ts`:

```typescript
import { WidgetContext } from "./types";
import config from "../../mcp.config";

const WIDGET_REGISTRY = config.widgets;

/**
 * Load and register all enabled widgets from the configuration
 * 
 * This function:
 * 1. Reads the widget registry from mcp.config.ts
 * 2. Filters widgets based on environment (development vs production)
 * 3. Calls each widget's registerWidget function
 * 4. Handles errors gracefully so one broken widget doesn't stop others
 * 
 * @param context - Server context to pass to widgets
 */
export async function loadWidgets(
    context: Omit<WidgetContext, "basePath">
): Promise<void> {
    const { logger } = context;
    const isProduction = process.env.NODE_ENV === "production";

    logger.info(
        `Loading widgets from registry (NODE_ENV: ${process.env.NODE_ENV || "development"})...`
    );

    // Filter based on environment
    const enabledWidgets = Object.entries(WIDGET_REGISTRY).filter(
        ([, entry]) => {
            // Widget must be enabled
            if (!entry.mcp.enabled) return false;

            // In production, only include production-ready widgets
            if (isProduction && !entry.mcp.production) return false;

            return true;
        }
    );

    logger.info(
        `Found ${enabledWidgets.length} ${isProduction ? "production" : "enabled"} widgets: ${enabledWidgets.map(([id]) => id).join(", ")}`
    );

    // Register each widget
    for (const [widgetId, entry] of enabledWidgets) {
        try {
            const { package: widgetPackage, mcp } = entry;

            logger.info(
                `Registering widget: ${widgetPackage.config.name} (${widgetId})`
            );

            // Create context with widget-specific basePath
            const widgetContext: WidgetContext = {
                ...context,
                basePath: mcp.basePath,  // e.g., "/widgets/headphones"
            };

            // Call the widget's registration function
            await widgetPackage.registerWidget(widgetContext);
            
            logger.info(
                `Successfully registered widget: ${widgetPackage.config.name}`
            );
        } catch (error) {
            // Log error but continue with other widgets
            logger.error(
                `Failed to register widget ${widgetId}: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    logger.info("Widget loading complete");
}
```

**Why this pattern?** This loader function makes it easy to add new widgets. Just import the widget package and add it to `mcp.config.ts` - no need to modify the server code.

---

## 5. Creating the Headphones Widget Package

Now we'll build the widget package that contains the tool logic, data, and React UI.

### Step 1: Initialize the Widget Package

```bash
cd packages/widgets/headphones-widget
npm init -y
```

Update `packages/widgets/headphones-widget/package.json`:

```json
{
  "name": "headphones-widget",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.2",
    "typescript": "^5.7.2"
  }
}
```

Install dependencies:

```bash
npm install
```

### Step 2: Configure TypeScript

Create `packages/widgets/headphones-widget/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Define Widget Configuration

Create `packages/widgets/headphones-widget/src/config.ts`:

```typescript
import { WidgetConfig, WidgetMetadata } from "./types";

/**
 * Widget configuration
 * Basic information about the widget
 */
export const headphonesWidgetConfig: WidgetConfig = {
    id: "headphones",
    name: "Headphones Finder",
    description: "Interactive widget for browsing and filtering headphones",
};

/**
 * Widget metadata for OpenAI Apps SDK
 * Controls how the widget renders and what messages users see
 */
export const headphonesWidgetMetadata: WidgetMetadata = {
    templateUri: "ui://headphones",           // Unique identifier for the HTML template
    invoking: "Finding headphones...",        // Message shown while tool executes
    invoked: "Headphones found",              // Message shown after tool completes
    prefersBorder: true,                      // Render with border and shadow
};
```

**Plain English:** This configuration defines what the widget is called, what it does, and how ChatGPT should display it.

### Step 4: Create Data and Filtering Logic

Create `packages/widgets/headphones-widget/src/data/headphones.ts`:

```typescript
import { Headphone } from "../semantic/contracts";

/**
 * Sample headphones database
 * 
 * In a real application, this would come from an API or database.
 * For educational purposes, we hardcode 6 diverse headphones covering
 * different price points, activities, and styles.
 */
export const HEADPHONES: Headphone[] = [
    {
        id: "arc-commuter",
        name: "ArcSound Metro ANC",
        priceBracket: "budget",
        activity: "commuting",
        style: "over-ear",
        price: "$99",
        description: "Lightweight ANC cans with USB-C fast charging and 28-hour battery life.",
        ctaUrl: "https://example.com/arcsound-metro",
    },
    {
        id: "pulse-lite",
        name: "Pulse Lite Sport",
        priceBracket: "budget",
        activity: "fitness",
        style: "in-ear",
        price: "$79",
        description: "IPX7 buds with secure wing tips and an energetic EQ for cardio workouts.",
        ctaUrl: "https://example.com/pulse-lite",
    },
    {
        id: "soniq-pro",
        name: "Soniq Pro Studio",
        priceBracket: "premium",
        activity: "studio",
        style: "over-ear",
        price: "$349",
        description: "Closed-back studio monitors tuned for accurate mixing and long sessions.",
        ctaUrl: "https://example.com/soniq-pro",
    },
    {
        id: "lumen-air",
        name: "Lumen Air Max",
        priceBracket: "premium",
        activity: "commuting",
        style: "in-ear",
        price: "$279",
        description: "Adaptive transparency with wind reduction for commuters on busy streets.",
        ctaUrl: "https://example.com/lumen-air",
    },
    {
        id: "nova-gx",
        name: "Nova GX Wireless",
        priceBracket: "midrange",
        activity: "gaming",
        style: "over-ear",
        price: "$179",
        description: "Low-latency 2.4GHz wireless with spatial audio tuned for FPS titles.",
        ctaUrl: "https://example.com/nova-gx",
    },
    {
        id: "auris-flow",
        name: "Auris Flow",
        priceBracket: "midrange",
        activity: "fitness",
        style: "on-ear",
        price: "$149",
        description: "Sweat-resistant on-ears with breathable pads and multipoint Bluetooth.",
        ctaUrl: "https://example.com/auris-flow",
    },
];

/**
 * Filter headphones based on user criteria
 * 
 * This is the core business logic of the widget. When ChatGPT calls the
 * find_headphones tool with filters, this function returns matching headphones.
 * 
 * @param priceBracket - "budget", "midrange", "premium", or "all"
 * @param activity - "commuting", "gaming", "studio", "fitness", or "all"
 * @param style - "in-ear", "on-ear", "over-ear", or "all"
 * @returns Array of headphones matching all specified criteria
 */
export function filterHeadphones(
    priceBracket?: string,
    activity?: string,
    style?: string
): Headphone[] {
    return HEADPHONES.filter((headphone) => {
        // Match price bracket
        const priceMatch =
            !priceBracket ||
            priceBracket === "all" ||
            headphone.priceBracket === priceBracket;

        // Match activity
        const activityMatch =
            !activity || activity === "all" || headphone.activity === activity;

        // Match style
        const styleMatch =
            !style || style === "all" || headphone.style === style;

        // Must match all specified criteria
        return priceMatch && activityMatch && styleMatch;
    });
}
```

**Plain English:** This is your data layer. `HEADPHONES` is the database (hardcoded for simplicity), and `filterHeadphones` is the query function that returns headphones matching the user's criteria.

### Step 5: Define Zod Schemas

Create `packages/widgets/headphones-widget/src/semantic/contracts.ts`:

```typescript
import z from "zod";

/**
 * Input schema for the find_headphones tool
 * 
 * Zod schemas provide both TypeScript types AND runtime validation.
 * If ChatGPT sends invalid data, Zod will catch it before it reaches your code.
 */
export const FindHeadphonesToolInputContract = z.object({
    priceBracket: z
        .enum(["budget", "midrange", "premium", "all"])
        .optional()
        .describe("Price range filter: budget, midrange, premium, or all"),
    activity: z
        .enum(["commuting", "gaming", "studio", "fitness", "all"])
        .optional()
        .describe("Activity filter: commuting, gaming, studio, fitness, or all"),
    style: z
        .enum(["in-ear", "on-ear", "over-ear", "all"])
        .optional()
        .describe("Style filter: in-ear, on-ear, over-ear, or all"),
});

/**
 * Headphone data structure
 * 
 * Each headphone must have these fields. This schema ensures data consistency.
 */
export const HeadphoneContract = z.object({
    id: z.string(),
    name: z.string(),
    priceBracket: z.enum(["budget", "midrange", "premium"]),
    activity: z.enum(["commuting", "gaming", "studio", "fitness"]),
    style: z.enum(["in-ear", "on-ear", "over-ear"]),
    price: z.string(),
    description: z.string(),
    ctaUrl: z.string(),
    imageUrl: z.string().optional(),
});

/**
 * Output schema for the find_headphones tool
 * 
 * This is what your tool returns to ChatGPT: an array of headphones
 * and an optional summary text.
 */
export const FindHeadphonesToolOutputContract = z.object({
    headphones: z.array(HeadphoneContract),
    summary: z.string().optional().describe("Optional summary of the results"),
});

// TypeScript types inferred from Zod schemas
export type FindHeadphonesToolInput = z.infer<typeof FindHeadphonesToolInputContract>;
export type FindHeadphonesToolOutput = z.infer<typeof FindHeadphonesToolOutputContract>;
export type Headphone = z.infer<typeof HeadphoneContract>;
```

**Why Zod?** Zod provides both compile-time TypeScript types and runtime validation. This means invalid data is caught early, and you get helpful error messages instead of cryptic runtime failures.

### Step 6: Write AI-Facing Descriptions

Create `packages/widgets/headphones-widget/src/semantic/prompts.ts`:

```typescript
/**
 * AI-facing descriptions for the headphones widget
 * 
 * These strings are shown to ChatGPT to help it understand when and how
 * to use your tool. Write them clearly and include examples.
 */
export const headphonesWidgetPrompts = {
    toolTitle: "Find Headphones",
    
    toolDescription: `Find and filter headphones based on price, activity, and style.

Use this tool when users ask about headphones, earbuds, or audio equipment.

Examples:
- "Show me budget headphones"
- "Find gaming headphones"
- "I need over-ear headphones for commuting"
- "What headphones do you have for the gym?"

Filters:
- priceBracket: budget ($50-100), midrange ($100-200), premium ($200+), or all
- activity: commuting, gaming, studio, fitness, or all
- style: in-ear, on-ear, over-ear, or all

All filters are optional. Omit filters to show all headphones.`,

    resourceTitle: "Headphones Widget HTML",
    
    resourceDescription: "HTML template for the interactive headphones carousel widget",
    
    widgetDescription: "Displays an interactive carousel of headphone recommendations with filtering options and detailed product information",
};
```

**Plain English:** These descriptions are how ChatGPT learns about your tool. The better these descriptions, the more accurately ChatGPT will know when to call your tool.

### Step 7: Create React Component

Create `packages/widgets/headphones-widget/src/components/HeadphonesWidget.tsx`:

```typescript
"use client";

import React from "react";
import { Headphone } from "../semantic/contracts";
import { useWidgetProps } from "../hooks/useOpenAI";

interface HeadphonesWidgetProps {
    fallbackData?: { headphones: Headphone[]; summary?: string };
}

/**
 * Headphones Widget Component
 * 
 * This React component renders the headphones carousel. It works in two modes:
 * 1. ChatGPT mode: Reads data from window.openai.toolOutput (injected by ChatGPT)
 * 2. Standalone mode: Uses fallbackData for preview pages
 */
export function HeadphonesWidget({ fallbackData }: HeadphonesWidgetProps) {
    // Get tool output from ChatGPT or use fallback
    const toolOutput = useWidgetProps<{ headphones: Headphone[]; summary?: string }>(
        fallbackData
    );

    // Handle loading state
    if (!toolOutput) {
        return (
            <div className="flex items-center justify-center min-h-screen p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading headphones...</p>
                </div>
            </div>
        );
    }

    const { headphones, summary } = toolOutput;

    // Handle no results
    if (!headphones || headphones.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen p-8">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No headphones found matching your criteria.</p>
                    <p className="text-sm text-gray-500">Try adjusting your filters.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Summary */}
                {summary && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Headphones Recommendations
                        </h1>
                        <p className="text-lg text-gray-600">{summary}</p>
                    </div>
                )}

                {/* Headphones Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {headphones.map((headphone) => (
                        <HeadphoneCard key={headphone.id} headphone={headphone} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Individual headphone card component
 */
function HeadphoneCard({ headphone }: { headphone: Headphone }) {
    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <h3 className="text-xl font-bold text-white">{headphone.name}</h3>
                <p className="text-sm text-blue-100 mt-1">{headphone.price}</p>
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge label={headphone.priceBracket} color="blue" />
                    <Badge label={headphone.activity} color="green" />
                    <Badge label={headphone.style} color="purple" />
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {headphone.description}
                </p>

                {/* CTA Button */}
                <a
                    href={headphone.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors duration-200"
                >
                    View Details
                </a>
            </div>
        </div>
    );
}

/**
 * Badge component for displaying headphone attributes
 */
function Badge({ label, color }: { label: string; color: string }) {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-800",
        green: "bg-green-100 text-green-800",
        purple: "bg-purple-100 text-purple-800",
    };

    return (
        <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
        >
            {label}
        </span>
    );
}
```

**Plain English:** This is the UI that users see in ChatGPT. The `useWidgetProps` hook reads data from `window.openai.toolOutput` (which ChatGPT injects), and the component renders a card for each headphone.

### Step 8: Create ChatGPT Integration Hook (CRITICAL)

Create `packages/widgets/headphones-widget/src/hooks/useOpenAI.ts`:

```typescript
"use client";

import { useSyncExternalStore } from "react";

/**
 * OpenAI global event type for subscribing to changes
 * ChatGPT fires this custom event when it updates window.openai properties
 */
const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";

/**
 * Hook to subscribe to a specific OpenAI global value
 * 
 * This uses React's useSyncExternalStore API to efficiently subscribe to
 * changes in window.openai. When ChatGPT sets window.openai.toolOutput,
 * this hook triggers a re-render with the new data.
 * 
 * This approach is better than polling because:
 * - It responds immediately to changes (no delay)
 * - It doesn't waste CPU cycles checking repeatedly
 * - It follows React 18+ best practices
 * - It matches OpenAI's official examples
 * 
 * Based on: https://github.com/openai/openai-apps-sdk-examples
 */
function useOpenAIGlobal<K extends keyof any>(key: K): any {
    return useSyncExternalStore(
        // Subscribe function
        (onChange) => {
            // Return no-op if running on server
            if (typeof window === "undefined") {
                return () => {};
            }

            // Listen for OpenAI's custom event
            const handleSetGlobal = (event: CustomEvent) => {
                const globals = event.detail?.globals || {};
                const value = globals[key];
                
                // Only trigger re-render if our key was updated
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

            // Cleanup function
            return () => {
                window.removeEventListener(
                    SET_GLOBALS_EVENT_TYPE,
                    handleSetGlobal as EventListener
                );
            };
        },
        
        // Get current value
        () =>
            typeof window !== "undefined" && (window as any).openai
                ? (window as any).openai[key] ?? null
                : null,
        
        // Get server snapshot
        () => null
    );
}

/**
 * Hook to get widget props (tool output) from ChatGPT
 * 
 * In ChatGPT, when a tool is called, the response data is injected into
 * window.openai.toolOutput. This hook subscribes to that value and returns it.
 * 
 * @param defaultState - Fallback data for standalone mode (preview pages)
 * @returns The tool output data or the default fallback
 */
export function useWidgetProps<T>(defaultState?: T | (() => T)): T | null {
    const toolOutput = useOpenAIGlobal("toolOutput") as T | null;

    // Use fallback if no tool output (standalone mode)
    const fallback =
        typeof defaultState === "function"
            ? (defaultState as () => T | null)()
            : (defaultState ?? null);

    return toolOutput ?? fallback;
}

/**
 * Hook to get max height for the widget
 * Useful for responsive layouts in ChatGPT
 */
export function useMaxHeight(): number | null {
    return useOpenAIGlobal("maxHeight");
}

/**
 * Hook to check if running in ChatGPT app
 * Returns true if window.openai is available
 */
export function useIsChatGptApp(): boolean {
    return useSyncExternalStore(
        () => () => {},  // No subscription needed
        () => typeof window !== "undefined" && "openai" in window,
        () => false
    );
}
```

**Why this is critical:** This hook is how your widget gets data from ChatGPT. The old approach (polling with `setInterval`) had timing issues and wasted CPU. This event-driven approach using `useSyncExternalStore` is:
- **Immediate**: Reacts instantly when ChatGPT injects data
- **Efficient**: No polling overhead
- **Correct**: Follows React 18+ patterns
- **Official**: Matches OpenAI's examples

### Step 9: Create MCP Registration Logic

Create `packages/widgets/headphones-widget/src/register.ts`:

```typescript
import { WidgetPackage, WidgetContext } from "./types";
import { createWidgetMeta, createResourceMeta } from "./helpers";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { headphonesWidgetConfig, headphonesWidgetMetadata } from "./config";
import {
    FindHeadphonesToolInputContract,
    FindHeadphonesToolInput,
    FindHeadphonesToolOutput,
} from "./semantic/contracts";
import { headphonesWidgetPrompts } from "./semantic/prompts";
import { filterHeadphones } from "./data/headphones";

/**
 * Register the headphones widget with the MCP server
 * 
 * This function is called by the MCP server during startup. It:
 * 1. Registers the HTML resource (widget template)
 * 2. Registers the find_headphones tool
 * 3. Links the tool to the widget via metadata
 */
async function registerWidget(context: WidgetContext): Promise<void> {
    const { server, logger, getHtml, basePath } = context;

    logger.info(`Registering headphones widget at ${basePath}`);

    // Fetch the widget HTML from the Next.js server
    const html = await getHtml(basePath);

    // STEP 1: Register the resource (HTML template)
    // The assetPrefix in next.config.ts ensures scripts load with absolute URLs
    server.registerResource(
        "headphones-widget",                    // Resource name
        headphonesWidgetMetadata.templateUri,   // URI (e.g., "ui://headphones")
        {
            title: headphonesWidgetPrompts.resourceTitle,
            description: headphonesWidgetPrompts.resourceDescription,
            mimeType: "text/html+skybridge",    // CRITICAL: Must be +skybridge
            _meta: createResourceMeta(
                headphonesWidgetPrompts.widgetDescription,
                headphonesWidgetMetadata.prefersBorder
            ),
        },
        async (uri: URL) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: "text/html+skybridge",  // CRITICAL: Must match above
                    text: `<html>${html}</html>`,    // Wrap in html tags
                    _meta: createResourceMeta(
                        headphonesWidgetPrompts.widgetDescription,
                        headphonesWidgetMetadata.prefersBorder
                    ),
                },
            ],
        })
    );

    // STEP 2: Register the tool
    server.registerTool(
        "find_headphones",                      // Tool name (what ChatGPT calls)
        {
            title: headphonesWidgetPrompts.toolTitle,
            description: headphonesWidgetPrompts.toolDescription,
            inputSchema: FindHeadphonesToolInputContract.shape,  // Zod schema
            _meta: createWidgetMeta(headphonesWidgetMetadata),  // CRITICAL: Links to widget
        },
        async (input: FindHeadphonesToolInput): Promise<CallToolResult> => {
            const { priceBracket, activity, style } = input;

            // Filter headphones based on input
            const headphones = filterHeadphones(priceBracket, activity, style);

            // Create summary text
            const filters = [
                priceBracket && priceBracket !== "all" ? priceBracket : null,
                activity && activity !== "all" ? activity : null,
                style && style !== "all" ? style : null,
            ].filter(Boolean);

            const summary =
                filters.length > 0
                    ? `Found ${headphones.length} headphones matching: ${filters.join(", ")}`
                    : `Showing all ${headphones.length} headphones`;

            const result: FindHeadphonesToolOutput = {
                headphones,
                summary,
            };

            // CRITICAL: Return in simplified format
            // The structuredContent will be injected into window.openai.toolOutput
            return {
                content: [
                    {
                        type: "text",
                        text: summary,
                    },
                ],
                structuredContent: result,  // This becomes window.openai.toolOutput
                _meta: createWidgetMeta(headphonesWidgetMetadata),
            };
        }
    );

    logger.info("Headphones widget registered successfully");
}

/**
 * Headphones Widget Package
 * This is what gets imported by the MCP server
 */
export const headphonesWidgetPackage: WidgetPackage = {
    config: headphonesWidgetConfig,
    registerWidget,
};
```

**Plain English:** This file is the bridge between your widget and the MCP server. It:
1. Tells the server "here's my HTML template"
2. Tells the server "here's my tool and what it does"
3. Defines what happens when the tool is called (filter headphones, return data)

The critical part is the `structuredContent` field - this is what becomes `window.openai.toolOutput` in your React component.

### Step 10: Create Public Exports

Create `packages/widgets/headphones-widget/src/index.ts`:

```typescript
// Public exports for the widget package
export * from "./types";
export * from "./config";
export * from "./register";
export * from "./components/HeadphonesWidget";
export * from "./hooks/useOpenAI";
```

### Step 11: Build the Widget Package

```bash
cd packages/widgets/headphones-widget
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder. The MCP server will import from this compiled code.

---

## 6. Building the MCP Server

Now we'll create the Next.js server that exposes the MCP endpoint and serves widget HTML.

### Step 1: Initialize Next.js App

```bash
cd packages/mcp
npx create-next-app@latest . --ts --app --eslint --src-dir --import-alias "@/*" --tailwind --use-npm

# When prompted:
# - Ok to proceed? → Yes
# - Override existing files? → Yes
# - Use Tailwind CSS? → Yes
# - Use `src/` directory? → Yes
# - Use App Router? → Yes
# - Customize import alias? → No (use default @/*)
```

### Step 2: Install Dependencies

```bash
npm install mcp-handler headphones-widget
npm install @modelcontextprotocol/sdk
```

**What are these?**
- `mcp-handler`: Simplifies creating MCP servers with Next.js
- `headphones-widget`: Your local widget package
- `@modelcontextprotocol/sdk`: Official MCP SDK

### Step 3: Configure Next.js (CRITICAL FOR WIDGET RENDERING)

Create `packages/mcp/next.config.ts`:

```typescript
import type { NextConfig } from "next";

/**
 * Get the asset prefix for Next.js
 * 
 * WHY THIS IS CRITICAL:
 * When ChatGPT loads your widget HTML in an iframe, script tags with relative
 * paths (/_next/static/chunks/...) won't work because the browser resolves them
 * relative to chatgpt.com, not your server.
 * 
 * By setting assetPrefix to an absolute URL (http://localhost:3000), all script
 * tags become absolute and load correctly even in ChatGPT's sandboxed iframe.
 * 
 * - Development: Uses localhost with port
 * - Production: Uses relative paths (works with any domain)
 */
function getAssetPrefix(): string {
    if (process.env.NODE_ENV === "development") {
        const port = process.env.PORT || 3000;
        return `http://localhost:${port}`;
    }
    return "";  // Relative paths in production
}

const nextConfig: NextConfig = {
    assetPrefix: getAssetPrefix(),  // CRITICAL: Makes script URLs absolute
    output: "standalone",           // For Docker/production deployments
    transpilePackages: ["headphones-widget"],  // Compile widget package
};

export default nextConfig;
```

**This is critical!** Without `assetPrefix`, JavaScript won't load in ChatGPT iframes and your widget will be a blank page. This was one of the major issues discovered during development.

### Step 4: Create MCP Widget Registry

Create `packages/mcp/mcp.config.ts`:

```typescript
import { headphonesWidgetPackage, WidgetPackage } from "headphones-widget";

/**
 * Widget registry entry
 * Defines how a widget is configured in the MCP server
 */
interface WidgetRegistryEntry {
    package: WidgetPackage;     // The widget package
    mcp: {
        enabled: boolean;        // Whether to load this widget
        production: boolean;     // Whether to load in production
        basePath: string;        // Path to widget HTML (e.g., "/widgets/headphones")
    };
}

/**
 * MCP configuration structure
 */
interface McpConfig {
    widgets: Record<string, WidgetRegistryEntry>;
}

/**
 * MCP Configuration
 * 
 * Add new widgets here as you create them. The loadWidgets function
 * reads this configuration and registers all enabled widgets.
 */
const config: McpConfig = {
    widgets: {
        headphones: {
            package: headphonesWidgetPackage,
            mcp: {
                enabled: true,          // Enable this widget
                production: true,       // Include in production
                basePath: "/widgets/headphones",  // Where to find HTML
            },
        },
        // Add more widgets here:
        // speakers: {
        //     package: speakersWidgetPackage,
        //     mcp: { enabled: true, production: true, basePath: "/widgets/speakers" },
        // },
    },
};

export default config;
```

**Plain English:** This file is your widget registry. To add a new widget, just import its package and add an entry here. No need to modify server code.

### Step 5: Create MCP Endpoint

Create `packages/mcp/src/app/mcp/route.ts`:

```typescript
import { createMcpHandler } from "mcp-handler";
import { loadWidgets } from "@/lib/loadWidgets";
import { WidgetContext } from "headphones-widget";
import { getBaseURL } from "@/lib/helpers";

/**
 * MCP Handler - Gateway for all widgets
 * 
 * This is the HTTP endpoint that ChatGPT calls. It:
 * 1. Creates an MCP server instance
 * 2. Loads all enabled widgets from mcp.config.ts
 * 3. Handles JSON-RPC requests from ChatGPT
 * 4. Returns tool results and widget HTML
 */
const handler = createMcpHandler(async (server) => {
    // Create context for widgets
    const context: Omit<WidgetContext, "basePath"> = {
        server,
        
        // Logger for debugging
        logger: {
            info: console.info.bind(console),
            error: console.error.bind(console),
            warn: console.warn.bind(console),
            debug: console.debug.bind(console),
        },
        
        // Function to fetch widget HTML
        // This is called during widget registration to get the HTML template
        getHtml: async (path: string) => {
            const baseURL = getBaseURL();
            const result = await fetch(`${baseURL}${path}`, {
                cache: "no-store",  // Always get fresh HTML
            });
            return await result.text();
        },
    };

    // Load all enabled widgets from mcp.config.ts
    await loadWidgets(context);
});

// Export both GET and POST handlers
// ChatGPT uses POST for tool calls, GET for health checks
export const GET = handler;
export const POST = handler;
```

**Plain English:** This is your MCP endpoint (`/mcp`). When ChatGPT makes a request, this handler:
1. Creates an MCP server
2. Loads all your widgets
3. Processes the request
4. Returns the response

### Step 6: Create Widget Preview Page

Create `packages/mcp/src/app/widgets/headphones/page.tsx`:

```typescript
import { HeadphonesWidget } from "headphones-widget";
import { HEADPHONES } from "headphones-widget/dist/data/headphones";

/**
 * Headphones Widget Preview Page
 * 
 * This page lets you view the widget standalone (without ChatGPT) during development.
 * It uses fallback data so you can test styling and functionality.
 * 
 * Visit: http://localhost:3000/widgets/headphones
 */
export default function HeadphonesWidgetPage() {
    // Use all headphones as fallback data
    const fallbackData = {
        headphones: HEADPHONES,
        summary: "Showing all 6 headphones (preview mode)",
    };

    return <HeadphonesWidget fallbackData={fallbackData} />;
}
```

**Why this page?** During development, you need to see your widget without calling the MCP tool. This preview page lets you test styling, layout, and interactions.

### Step 7: Create Homepage

Create `packages/mcp/src/app/page.tsx`:

```typescript
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    TechGear MCP Server
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    An educational MCP server for suggesting headphones in ChatGPT.
                </p>

                <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                        <h2 className="font-semibold text-blue-900 mb-2">MCP Endpoint</h2>
                        <code className="text-sm text-blue-700">POST /mcp</code>
                        <p className="text-sm text-blue-600 mt-2">
                            This is the endpoint ChatGPT calls to interact with widgets.
                        </p>
                    </div>

                    <div className="border-l-4 border-green-500 bg-green-50 p-4">
                        <h2 className="font-semibold text-green-900 mb-2">Widget Preview</h2>
                        <Link
                            href="/widgets/headphones"
                            className="text-sm text-green-700 hover:underline"
                        >
                            View Headphones Widget →
                        </Link>
                        <p className="text-sm text-green-600 mt-2">
                            See how the widget looks without ChatGPT.
                        </p>
                    </div>

                    <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
                        <h2 className="font-semibold text-purple-900 mb-2">Testing</h2>
                        <p className="text-sm text-purple-600">
                            Use MCPJam Inspector to test the MCP endpoint locally before deploying.
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• <a href="https://developers.openai.com/apps-sdk" className="hover:underline">OpenAI Apps SDK</a></li>
                        <li>• <a href="https://spec.modelcontextprotocol.io/" className="hover:underline">MCP Specification</a></li>
                        <li>• <a href="https://docs.mcpjam.com/" className="hover:underline">MCPJam Documentation</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
```

### Step 8: Start the Development Server

```bash
cd packages/mcp
npm run dev
```

**Expected output:**

```
  ▲ Next.js 15.5.5
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Starting...
 ✓ Ready in 1234ms
```

**Test it:**
1. Visit `http://localhost:3000` - Should show homepage
2. Visit `http://localhost:3000/widgets/headphones` - Should show widget with all headphones
3. Visit `http://localhost:3000/mcp` - Should show a JSON error (normal - MCP clients use POST)

---

## 7. Critical Configuration for Widget Rendering

This section covers the critical configurations that make widgets render correctly in ChatGPT. These were discovered through troubleshooting and align with the reference implementation.

### Issue 1: JavaScript Assets Not Loading

**Problem:** When ChatGPT loads your widget HTML in an iframe, script tags with relative paths like `<script src="/_next/static/chunks/webpack.js">` fail because the browser resolves them relative to `chatgpt.com`, not your server.

**Solution:** The `assetPrefix` in `next.config.ts` (already configured in Step 6.3)

**How it works:**
```typescript
// Without assetPrefix:
<script src="/_next/static/chunks/webpack.js"></script>
// Browser tries: https://chatgpt.com/_next/static/chunks/webpack.js ❌

// With assetPrefix:
<script src="http://localhost:3000/_next/static/chunks/webpack.js"></script>
// Browser tries: http://localhost:3000/_next/static/chunks/webpack.js ✅
```

### Issue 2: Data Not Updating Widget

**Problem:** Initial implementations used polling (`setInterval`) to check for `window.openai.toolOutput`, which had timing issues and didn't reliably trigger re-renders.

**Solution:** Event-driven reactivity with `useSyncExternalStore` (already implemented in Step 5.8)

**How it works:**
```typescript
// OLD APPROACH (Don't use) ❌
useEffect(() => {
    const intervalId = setInterval(() => {
        if (window.openai?.toolOutput) {
            setProps(window.openai.toolOutput);
        }
    }, 1000);  // Check every second
    return () => clearInterval(intervalId);
}, []);

// NEW APPROACH (Correct) ✅
useSyncExternalStore(
    (onChange) => {
        // Subscribe to OpenAI's custom event
        const handleSetGlobal = (event: CustomEvent) => {
            if (event.detail?.globals?.toolOutput) {
                onChange();  // Trigger immediate re-render
            }
        };
        window.addEventListener("openai:set_globals", handleSetGlobal);
        return () => window.removeEventListener("openai:set_globals", handleSetGlobal);
    },
    () => window.openai?.toolOutput ?? null,
    () => null
);
```

**Benefits:**
- ✅ Immediate reactivity (no 1-second delay)
- ✅ No CPU waste from polling
- ✅ Follows React 18+ best practices
- ✅ Matches OpenAI's official examples

### Issue 3: MIME Type Must Be Correct

**Problem:** Using `text/html` as the MIME type doesn't signal to ChatGPT that this is a widget template.

**Solution:** Always use `text/html+skybridge`

```typescript
// WRONG ❌
mimeType: "text/html"

// CORRECT ✅
mimeType: "text/html+skybridge"
```

This appears in two places in `register.ts`:
1. Resource descriptor metadata
2. Resource contents mimeType

### Issue 4: Metadata Must Be Complete

**Problem:** Missing or incorrect `_meta` fields prevent widget rendering.

**Solution:** Always include complete metadata in:

1. **Resource registration:**
```typescript
_meta: createResourceMeta(
    headphonesWidgetPrompts.widgetDescription,
    headphonesWidgetMetadata.prefersBorder
)
```

2. **Tool registration:**
```typescript
_meta: createWidgetMeta(headphonesWidgetMetadata)
```

3. **Tool response:**
```typescript
return {
    content: [{ type: "text", text: summary }],
    structuredContent: result,
    _meta: createWidgetMeta(headphonesWidgetMetadata),  // Links tool to widget
};
```

### Response Format (Simplified)

**DO NOT use deprecated format:**
```typescript
// DEPRECATED ❌
return {
    content: [
        {
            type: "text",
            text: summary,
            _meta: {
                openai: {
                    widgets: [  // This array format is deprecated
                        {
                            type: "widget",
                            uri: "ui://headphones",
                            structuredContent: result,
                        },
                    ],
                },
            },
        },
    ],
};
```

**USE simplified format:**
```typescript
// CORRECT ✅
return {
    content: [{ type: "text", text: summary }],
    structuredContent: result,  // At root level
    _meta: createWidgetMeta(headphonesWidgetMetadata),
};
```

**Why this works:**
- The tool's `_meta["openai/outputTemplate"]` already links to the widget
- ChatGPT knows which widget to render from the tool metadata
- The `structuredContent` at root level is automatically injected into `window.openai.toolOutput`

---

## 8. Testing with MCPJam Inspector

MCPJam Inspector is a local testing tool that simulates how ChatGPT interacts with your MCP server.

### Step 1: Set Up Playground Package

```bash
cd packages/playground
npm init -y
```

Update `packages/playground/package.json`:

```json
{
  "name": "playground",
  "version": "1.0.0",
  "scripts": {
    "inspector": "npx @mcpjam/inspector@latest"
  }
}
```

### Step 2: Create Inspector Configuration

Create `packages/playground/mcp.config.json`:

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

**Plain English:** This tells MCPJam Inspector where your MCP server is running.

### Step 3: Launch Inspector

**Terminal 1** (MCP Server):
```bash
cd packages/mcp
npm run dev
```

**Terminal 2** (Inspector):
```bash
cd packages/playground
npm run inspector
```

**Expected output:**
```
┌─────────────────────────┐
│ 🚀 Inspector Launched   │
├─────────────────────────┤
│ http://127.0.0.1:6274   │
└─────────────────────────┘
✅ 🌐 Browser opened at http://127.0.0.1:6274
```

### Step 4: Connect to Your Server

1. **Servers Tab**: You should see "TechGear" listed
2. Click **Connect** next to TechGear
3. Wait for green checkmark ✅

**What's happening:** Inspector is making a request to `http://localhost:3000/mcp` to discover available tools and resources.

### Step 5: Test in Playground

1. Click **Playground** tab
2. Select a model (or use MCPJam's free models)
3. Try these prompts:

**Test 1: All headphones**
```
Show me headphones
```
**Expected:** Widget displays all 6 headphones

**Test 2: Price filter**
```
Find budget headphones
```
**Expected:** Widget shows only 2 budget headphones (ArcSound Metro, Pulse Lite)

**Test 3: Activity filter**
```
I need headphones for gaming
```
**Expected:** Widget shows 1 headphone (Nova GX Wireless)

**Test 4: Combined filters**
```
Show me midrange headphones for fitness
```
**Expected:** Widget shows 1 headphone (Auris Flow)

### Step 6: Verify in Browser Console

Open browser DevTools (F12) and check the Console:

**Expected logs:**
```javascript
[HeadphonesWidget] window.openai available: {toolOutput: {...}}
[useWidgetProps] window.openai found: {toolOutput: {...}}
[useWidgetProps] Setting toolOutput: {headphones: [...], summary: "..."}
```

**Check widget styling:**
- ✅ Cards have rounded corners
- ✅ Cards have shadows
- ✅ Gradient headers (blue to purple)
- ✅ Hover effects work
- ✅ Badges are colored

### Step 7: Debug with Messages Tab

Click the **Messages** tab to see raw JSON-RPC messages:

**Tool call request (from ChatGPT):**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "find_headphones",
    "arguments": {
      "priceBracket": "budget"
    }
  }
}
```

**Tool call response (from your server):**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 2 headphones matching: budget"
      }
    ],
    "structuredContent": {
      "headphones": [...],
      "summary": "Found 2 headphones matching: budget"
    },
    "_meta": {
      "openai/outputTemplate": "ui://headphones",
      "openai/toolInvocation/invoking": "Finding headphones...",
      "openai/toolInvocation/invoked": "Headphones found"
    }
  }
}
```

**Resource read request:**
```json
{
  "jsonrpc": "2.0",
  "method": "resources/read",
  "params": {
    "uri": "ui://headphones"
  }
}
```

**Resource read response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "contents": [
      {
        "uri": "ui://headphones",
        "mimeType": "text/html+skybridge",
        "text": "<html><!DOCTYPE html><html>...",
        "_meta": {
          "openai/widgetDescription": "Displays an interactive carousel...",
          "openai/widgetPrefersBorder": true
        }
      }
    ]
  }
}
```

---

## 9. Troubleshooting Widget Rendering

### Problem 1: Widget Shows Blank Page

**Symptoms:**
- Widget iframe loads but shows nothing
- Console error: `Uncaught SyntaxError: Unexpected token '<'`
- Network tab shows 404 for `/_next/static/chunks/...`

**Diagnosis:** Script paths are relative, failing in ChatGPT iframe

**Solution:** Verify `assetPrefix` in `next.config.ts`

```bash
# Check if asset URLs are absolute
curl -s http://localhost:3000/widgets/headphones | grep -o 'src="[^"]*"' | head -5
```

**Expected:**
```
src="http://localhost:3000/_next/static/chunks/webpack.js"
src="http://localhost:3000/_next/static/chunks/main.js"
```

**If you see relative paths:**
```
src="/_next/static/chunks/webpack.js"  ❌
```

**Fix:** Restart the MCP server after verifying `next.config.ts` has `assetPrefix: getAssetPrefix()`.

### Problem 2: Widget Shows Loading Forever

**Symptoms:**
- Widget loads but shows "Loading headphones..." forever
- No console logs from `useWidgetProps`

**Diagnosis:** Data not reaching the widget

**Solution Steps:**

1. **Check browser console for errors**
2. **Verify window.openai exists:**
```javascript
// In browser console:
window.openai
// Should show: {toolOutput: {...}, maxHeight: number}
```

3. **Check if useSyncExternalStore is being used:**
```bash
# In widget package:
grep -n "useSyncExternalStore" src/hooks/useOpenAI.ts
```
Should show the event-driven implementation from Step 5.8

4. **Rebuild widget if necessary:**
```bash
cd packages/widgets/headphones-widget
npm run build
cd ../../mcp
# Restart server: Ctrl+C then npm run dev
```

### Problem 3: Widget Shows JSON Instead of HTML

**Symptoms:**
- Widget area shows raw JSON text
- No HTML is rendered

**Diagnosis:** MIME type is wrong

**Solution:** Check `register.ts`

```typescript
// Both places must have +skybridge:
mimeType: "text/html+skybridge"  // ✅ Correct
```

### Problem 4: Widget Shows But Data Doesn't Update

**Symptoms:**
- Widget renders with fallback data
- Doesn't update when tool is called
- Console shows: `[Carousel] Using fallback data`

**Diagnosis:** Tool response not including proper metadata

**Solution:** Verify tool response in `register.ts`:

```typescript
return {
    content: [{ type: "text", text: summary }],
    structuredContent: result,  // ✅ Must be at root level
    _meta: createWidgetMeta(headphonesWidgetMetadata),  // ✅ Must include _meta
};
```

### Problem 5: Tool Not Being Called

**Symptoms:**
- You ask about headphones but tool isn't called
- ChatGPT responds in text only

**Diagnosis:** Tool description isn't clear enough

**Solution:** Update `prompts.ts` with better examples:

```typescript
toolDescription: `Find and filter headphones based on price, activity, and style.

Use this tool when users ask about headphones, earbuds, or audio equipment.

Examples:
- "Show me budget headphones"
- "Find gaming headphones"
- "I need over-ear headphones for commuting"
- "What headphones do you have for the gym?"

...`
```

Be explicit about when to use the tool and provide diverse examples.

---

## 10. Testing with ChatGPT

Once everything works in MCPJam Inspector, test with real ChatGPT.

### Step 1: Expose Your Server

**Option A: ngrok (Easiest)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

**Expected output:**
```
Forwarding  https://abcd-1234-5678.ngrok.io -> http://localhost:3000
```

Copy the HTTPS URL: `https://abcd-1234-5678.ngrok.io`

**Option B: Deploy to Vercel**
```bash
cd packages/mcp
vercel deploy
```

### Step 2: Enable Developer Mode

1. Open ChatGPT (requires ChatGPT Plus)
2. Go to **Settings** → **Beta Features**
3. Enable **Developer Mode**

### Step 3: Add MCP Connector

1. In ChatGPT, click **Settings** → **Apps & Connectors**
2. Click **Add Connector**
3. Enter details:
   - **Name:** TechGear
   - **URL:** `https://your-ngrok-url.ngrok.io/mcp` (or Vercel URL + `/mcp`)
   - **Type:** HTTP
4. Click **Save**

### Step 4: Test in ChatGPT

Start a new chat and try:

```
Show me budget headphones for gaming
```

**Expected:**
1. ChatGPT calls the `find_headphones` tool
2. Tool returns 1 headphone (Nova GX is midrange, but let's try budget+gaming)
3. Widget renders inline in the chat
4. You see a styled card with the headphone

Try more prompts:
- "What headphones do you have under $100?"
- "I need over-ear headphones for the office"
- "Find me wireless earbuds for working out"

### Step 5: Monitor Your Server

Watch the MCP server logs:

```bash
# In packages/mcp terminal
npm run dev

# You'll see:
[Info] Loading widgets from registry (NODE_ENV: development)...
[Info] Found 1 enabled widgets: headphones
[Info] Registering widget: Headphones Finder (headphones)
[Info] Registering headphones widget at /widgets/headphones
[Info] Headphones widget registered successfully
[Info] Widget loading complete
```

When ChatGPT calls your tool, you'll see HTTP POST requests in the logs.

---

## 11. Key Learnings and Best Practices

### Architecture Lessons

1. **Monorepo Structure Works Well**
   - Widget packages are self-contained and reusable
   - MCP server dynamically loads widgets from config
   - Easy to add new widgets without modifying server code

2. **No Framework Needed**
   - Simple helper functions (`createResourceMeta`, `createWidgetMeta`) replace entire frameworks
   - Easier to understand and debug
   - No vendor lock-in

3. **TypeScript + Zod = Bulletproof**
   - Compile-time type safety from TypeScript
   - Runtime validation from Zod
   - Catch errors before they reach production

### Critical Configurations

1. **Asset Prefix is Non-Negotiable**
   ```typescript
   // next.config.ts
   assetPrefix: process.env.NODE_ENV === "development" 
     ? `http://localhost:${process.env.PORT || 3000}` 
     : ""
   ```
   Without this, widgets are blank pages in ChatGPT.

2. **Event-Driven Reactivity is Required**
   ```typescript
   // Use useSyncExternalStore, not polling
   useSyncExternalStore(
     (onChange) => {
       window.addEventListener("openai:set_globals", onChange);
       return () => window.removeEventListener("openai:set_globals", onChange);
     },
     () => window.openai?.toolOutput
   );
   ```

3. **MIME Type Must Be `text/html+skybridge`**
   ```typescript
   mimeType: "text/html+skybridge"  // Not "text/html"
   ```

4. **Complete Metadata is Essential**
   - Resource registration needs `_meta`
   - Tool registration needs `_meta`
   - Tool response needs `_meta`

### Development Workflow

1. **Build Widget First**
   ```bash
   cd packages/widgets/headphones-widget
   npm run build
   ```

2. **Start MCP Server**
   ```bash
   cd packages/mcp
   npm run dev
   ```

3. **Test Standalone Page**
   - Visit `http://localhost:3000/widgets/headphones`
   - Verify styling and layout

4. **Test with Inspector**
   - Start MCPJam Inspector
   - Connect to server
   - Try various prompts

5. **Test with ChatGPT**
   - Expose server (ngrok or deploy)
   - Add connector in ChatGPT
   - Test end-to-end

### Debugging Tips

1. **Use Browser DevTools**
   - Console: Check for errors and logs
   - Network: Verify asset loading
   - Elements: Inspect rendered HTML

2. **Check MCPJam Messages Tab**
   - See raw JSON-RPC requests/responses
   - Verify tool parameters
   - Verify response structure

3. **Add Logging**
   ```typescript
   console.log("[Component] State:", state);
   ```
   Prefix logs with component name for easy filtering

4. **Test Incrementally**
   - Test widget standalone first
   - Then test with Inspector
   - Finally test with ChatGPT

### Common Mistakes to Avoid

1. **Forgetting to Rebuild Widget**
   - After changing widget code, always run `npm run build`
   - Restart MCP server to pick up changes

2. **Using Deprecated Response Format**
   - Don't use `_meta.openai.widgets` array
   - Use `structuredContent` at root level

3. **Missing assetPrefix**
   - Always verify `next.config.ts` has `assetPrefix`
   - Check generated HTML has absolute URLs

4. **Polling Instead of Events**
   - Don't use `setInterval` to check `window.openai`
   - Use `useSyncExternalStore` with event listeners

5. **Wrong MIME Type**
   - Must be `text/html+skybridge`, not `text/html`

### Scaling to Multiple Widgets

When adding more widgets:

1. **Create widget package** following the same structure
2. **Add to mcp.config.ts**:
   ```typescript
   widgets: {
     headphones: { ... },
     speakers: {  // New widget
       package: speakersWidgetPackage,
       mcp: {
         enabled: true,
         production: true,
         basePath: "/widgets/speakers",
       },
     },
   }
   ```
3. **Create preview page** at `/app/widgets/speakers/page.tsx`
4. **Build and test** following the same workflow

No server code changes needed!

---

## Conclusion

You've now built a complete ChatGPT MCP app from scratch! Here's what you learned:

### Core Concepts
✅ Model Context Protocol (MCP) fundamentals  
✅ OpenAI Apps SDK integration  
✅ Widget architecture and data flow  
✅ Event-driven reactivity with React  
✅ Type-safe development with TypeScript + Zod  

### Technical Skills
✅ Next.js API routes and SSR  
✅ React hooks and component patterns  
✅ Monorepo structure and workspace management  
✅ Debugging MCP applications  
✅ Testing with MCPJam Inspector  

### Best Practices
✅ No framework dependencies (maintainability)  
✅ Complete type safety (compile-time + runtime)  
✅ Clear separation of concerns (data, logic, UI)  
✅ Comprehensive error handling  
✅ Educational code with explanations  

### Next Steps

1. **Experiment**: Modify the headphones data, add fields, change styling
2. **Expand**: Create new widgets (books, recipes, products)
3. **Deploy**: Push to Vercel, add to ChatGPT
4. **Learn**: Read the OpenAI Apps SDK docs, explore MCP specification
5. **Build**: Create your own MCP app for your use case

### Resources

- **OpenAI Apps SDK**: https://developers.openai.com/apps-sdk
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **MCPJam Inspector**: https://docs.mcpjam.com/
- **Next.js Docs**: https://nextjs.org/docs
- **React useSyncExternalStore**: https://react.dev/reference/react/useSyncExternalStore

### Support

- Check project README: `README.md`
- Review quick reference: `QUICK_REFERENCE.md`
- Read fix documentation: `HYDRATION_FIXES.md`, `MCP_WIDGET_FIXES.md`

---

**Happy Building! 🚀**

You now have everything you need to build sophisticated ChatGPT apps with MCP. Go create something amazing!

