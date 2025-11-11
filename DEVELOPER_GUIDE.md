# TechGear ChatGPT App Development Guide

This comprehensive guide walks through building **TechGear**, an electronics shopping assistant that suggests headphones inside ChatGPT using the OpenAI Apps SDK and Model Context Protocol (MCP). You'll learn to develop locally with Next.js for the UI, create reusable widget packages, expose MCP tools, and test everything with MCPJam Inspector before deploying to ChatGPT.

> **Educational Focus**: This guide is designed to teach MCP fundamentals and ChatGPT app development without proprietary framework dependencies. We use only the official MCP SDK and standard web technologies.

> **Sources**: [OpenAI Apps SDK Quickstart](https://developers.openai.com/apps-sdk/quickstart), [MCP Specification](https://spec.modelcontextprotocol.io/), [MCPJam Inspector Docs](https://docs.mcpjam.com/)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
   - Required Software
   - Verify Your Environment
   - Knowledge Prerequisites

2. [Understanding the Architecture](#2-understanding-the-architecture)
   - What is MCP (Model Context Protocol)?
   - How TechGear Works
   - Key Components
   - Why This Architecture?

3. [Project Structure Setup](#3-project-structure-setup)
   - Create the Project Directory
   - Set Up Workspace Configuration
   - Final Directory Structure

4. [Creating the Headphones Widget Package](#4-creating-the-headphones-widget-package)
   - Overview
   - Step 1: Initialize the Widget Package
   - Step 2: Configure TypeScript
   - Step 3: Define Zod Schemas
   - Step 4: Create Data and Filtering Logic
   - Step 5: Create ChatGPT Integration Hook (CRITICAL)
   - Step 6: Create React Component
   - Step 7: Create Widget Types
   - Step 8: Define Widget Configuration
   - Step 9: Write AI-Facing Descriptions
   - Step 10: Create MCP Registration Logic
   - Step 11: Create Public Exports
   - Step 12: Build the Widget Package

5. [Building Helper Utilities](#5-building-helper-utilities)
   - Overview
   - Step 1: Define TypeScript Types
   - Step 2: Create Metadata Helper Functions
   - Step 3: Create Widget Loader

6. [Building the MCP Server](#6-building-the-mcp-server)
   - Overview
   - Step 1: Initialize Next.js App
   - Step 2: Install Dependencies
   - Step 3: Configure Next.js (CRITICAL FOR WIDGET RENDERING)
   - Step 4: Create MCP Widget Registry
   - Step 5: Create MCP Endpoint
   - Step 6: Create Widget Preview Page
   - Step 7: Create Homepage
   - Step 8: Start the Development Server

7. [Testing with MCPJam Inspector](#7-testing-with-mcpjam-inspector)
   - Overview
   - Step 1: Set Up Playground Package
   - Step 2: Create Inspector Configuration
   - Step 3: Launch Inspector
   - Step 4: Connect to Your Server
   - Step 5: Test in Playground
   - Step 6: Verify in Browser Console
   - Step 7: Debug with Messages Tab
   - Testing Summary

8. [Critical Configuration and Troubleshooting](#8-critical-configuration-and-troubleshooting)
   - Overview
   - Critical Configuration 1: Asset Prefix
   - Critical Configuration 2: Event-Driven Reactivity
   - Critical Configuration 3: MIME Type
   - Critical Configuration 4: Complete Metadata
   - Critical Configuration 5: Simplified Response Format
   - Troubleshooting Guide
     - Problem 1: Widget Shows Blank Page
     - Problem 2: Widget Shows Loading Forever
     - Problem 3: Widget Shows JSON Instead of HTML
     - Problem 4: Widget Shows But Data Doesn't Update
     - Problem 5: Tool Not Being Called
   - Configuration Checklist

9. [Testing with ChatGPT](#9-testing-with-chatgpt)
   - Overview
   - Step 1: Expose Your Server
   - Step 2: Enable Developer Mode
   - Step 3: Add MCP Connector
   - Step 4: Test in ChatGPT
   - Step 5: Monitor Your Server

10. [Key Learnings and Best Practices](#10-key-learnings-and-best-practices)
    - Overview
    - Architecture Lessons
    - Critical Configurations
    - Development Workflow
    - Debugging Tips
    - Common Mistakes to Avoid
    - Scaling to Multiple Widgets

11. [Conclusion](#conclusion)
    - Core Concepts
    - Technical Skills
    - Best Practices
    - Next Steps
    - Resources
    - Support

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

## 4. Creating the Headphones Widget Package

Now we'll build the widget package that contains the tool logic, data, and React UI.

### Overview

In this section, we'll create a complete, self-contained widget package with the following components:

1. **Package Setup**: Initialize npm package with TypeScript compilation
2. **TypeScript Configuration**: Configure compiler for React and type declarations
3. **Widget Configuration**: Define widget identity and display preferences
4. **Widget Types**: Create TypeScript interfaces for the widget
5. **Business Logic**: Implement data storage and filtering algorithms
6. **Zod Schemas**: Define runtime validation schemas
7. **AI Prompts**: Write descriptions that help ChatGPT understand when to use the widget
8. **React Component**: Build the UI that renders in ChatGPT
9. **ChatGPT Hook**: Create the data-fetching mechanism using React 18+ patterns
10. **MCP Registration**: Connect the widget to the MCP server
11. **Public API**: Export the widget package for consumption
12. **Build**: Compile TypeScript to JavaScript

This widget package is designed to be:
- **Self-contained**: All logic, data, and UI in one package
- **Reusable**: Can be imported into any MCP server
- **Type-safe**: Full TypeScript coverage with runtime validation
- **Educational**: Clear code structure with explanatory comments

### Step 1: Initialize the Widget Package

**Purpose**: Set up the widget as an npm package with TypeScript compilation. This creates the foundation for a reusable, distributable widget that can be imported by the MCP server.

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

**Purpose**: Configure TypeScript to compile React/JSX code into JavaScript that the MCP server can import. The configuration enables strict type checking, generates declaration files for TypeScript consumers, and targets modern JavaScript features.

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

**Key configuration options**:
- `jsx: "react-jsx"`: Use React 17+ automatic JSX runtime (no need to import React)
- `declaration: true`: Generate `.d.ts` files for TypeScript consumers
- `outDir: "./dist"`: Compiled output goes to `dist/` folder
- `strict: true`: Enable all strict type-checking options

### Step 3: Define Zod Schemas

**Purpose**: Create type-safe schemas using Zod for runtime validation. Zod provides both TypeScript types (compile-time) and validation logic (runtime), ensuring that data from ChatGPT matches expected formats before it reaches your business logic.

**Why Zod?**
- **Dual purpose**: Single schema definition generates both TypeScript types and runtime validators
- **Safety**: Catches invalid data before it reaches your business logic
- **Documentation**: Schema serves as living documentation of your data structures
- **Error messages**: Provides clear, actionable error messages when validation fails

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




### Step 4: Create Data and Filtering Logic

**Purpose**: Implement the business logic layer with sample data and filtering functions. In a production app, this would connect to a database or API. For this educational example, we use hardcoded data to demonstrate the filtering patterns.

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

**Data layer breakdown**:
- **`HEADPHONES` array**: Serves as our in-memory database with 6 diverse products covering different price points, activities, and styles
- **`filterHeadphones()` function**: Core business logic that applies multiple filters using AND logic (all specified criteria must match)
- **Filter behavior**: Each filter parameter is optional; omit a filter or pass "all" to skip that filter



### Step 5: Create ChatGPT Integration Hook (CRITICAL)

**Purpose**: Implement the data-fetching mechanism that receives tool output from ChatGPT. This uses React 18's `useSyncExternalStore` for event-driven reactivity, replacing older polling patterns with immediate, efficient updates when ChatGPT injects data.

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

**Why this approach is critical**:
- **Immediate reactivity**: Responds instantly when ChatGPT injects data (no polling delay)
- **Efficient**: No wasted CPU cycles checking repeatedly
- **React 18+ compliant**: Uses `useSyncExternalStore` API as intended
- **Event-driven**: Subscribes to ChatGPT's `openai:set_globals` custom event
- **Official pattern**: Matches OpenAI's reference implementations

**Comparison to old approach**:
```typescript
// ❌ OLD: Polling (don't use)
setInterval(() => {
  if (window.openai?.toolOutput) {
    setData(window.openai.toolOutput);
  }
}, 1000);

// ✅ NEW: Event-driven (use this)
useSyncExternalStore(
  (onChange) => {
    window.addEventListener("openai:set_globals", onChange);
    return () => window.removeEventListener("openai:set_globals", onChange);
  },
  () => window.openai?.toolOutput
);
```



### Step 6: Create React Component

**Purpose**: Build the user interface that renders in ChatGPT. This React component receives data from `window.openai.toolOutput` (injected by ChatGPT) and renders an interactive, styled widget that displays headphone recommendations.

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
            {/* Loader Component */}
        );
    }

    const { headphones, summary } = toolOutput;

    // Handle no results
    if (!headphones || headphones.length === 0) {
        return (
            {/* Placeholder */}
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Summary */}
                {summary && (
                    {summary}
                )}
                {/* Headphones Grid */}
            </div>
        </div>
    );
}

/**
 * Individual headphone card component
 */
function HeadphoneCard({ headphone }: { headphone: Headphone }) {
    return (
            {/* Header */}
            {/* Body */}
            {/* Badges */}
            {/* Description */}
            {/* CTA Button */}
    );
}

function Badge({ label, color }: { label: string; color: string }) {
{/* Badge Content*/}
}
```

**Component architecture**:
- **`HeadphonesWidget`**: Main component that handles data loading and state management
- **`HeadphoneCard`**: Individual product card with styling and call-to-action
- **`Badge`**: Reusable badge component for displaying attributes
- **Data flow**: Uses `useWidgetProps()` hook to receive data from ChatGPT, with fallback support for standalone preview mode


### Step 7: Create Widget Types

**Purpose**: Define TypeScript interfaces specific to the widget. These types are referenced by the config file and used throughout the widget package for type safety.

Create `packages/widgets/headphones-widget/src/types.ts`:

```typescript
/**
 * Widget configuration structure
 */
export interface WidgetConfig {
    id: string;
    name: string;
}

/**
 * Widget metadata for OpenAI Apps SDK
 */
export interface WidgetMetadata {
    templateUri: string;
    invoking: string;
    invoked: string;
    prefersBorder: boolean;
}
```

**Why these types?** 
- **`WidgetConfig`**: Basic identification fields for the widget (id and name)
- **`WidgetMetadata`**: OpenAI-specific fields that control how the widget renders and what status messages appear

**Note**: These are widget-specific types. The MCP server has its own types (like `WidgetContext` and `WidgetPackage`) that we'll see in Section 5.


### Step 8: Define Widget Configuration

**Purpose**: Create the widget's identity and display preferences. This configuration tells the MCP server what the widget is called and how ChatGPT should render and describe it to users.

Create `packages/widgets/headphones-widget/src/config.ts`:

Import the types we created for Widgets, then define the configuration.

```typescript
import { WidgetMetadata, WidgetConfig } from "./types";

/**
 * Configuration for the Headphones widget
 */
export const headphonesWidgetConfig: WidgetConfig = {
    id: "headphones",
    name: "Headphones Widget",
} as const;

/**
 * Display metadata for the Headphones widget
 */
export const headphonesWidgetMetadata: WidgetMetadata = {
    templateUri: "ui://widget/headphones-template.html",
    invoking: "Finding headphones...",
    invoked: "Headphones loaded",
    prefersBorder: true,
};
```

**Configuration breakdown**:
- **`headphonesWidgetConfig`**: Basic widget identification
  - `id`: Unique identifier used in the widget registry (`"headphones"`)
  - `name`: Display name for logging and debugging
- **`headphonesWidgetMetadata`**: OpenAI-specific display settings
  - `templateUri`: Unique URI that links the tool to this widget's HTML template
  - `invoking`: Status message shown while the tool executes
  - `invoked`: Status message shown after the tool completes
  - `prefersBorder`: Tells ChatGPT to render the widget with a border and shadow


### Step 9: Write AI-Facing Descriptions

**Purpose**: Create clear, example-rich descriptions that teach ChatGPT when and how to use your widget. These prompts are critical - they're how the AI learns about your tool's capabilities and appropriate use cases.

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

**Best practices for AI prompts**:
- **Be explicit**: Clearly state when the tool should be used
- **Provide examples**: Include diverse example queries that trigger the tool
- **Explain parameters**: Describe what each filter does and what values are valid
- **Use natural language**: Write as if teaching a colleague, not writing code documentation



### Step 10: Create MCP Registration Logic

**Purpose**: Build the bridge between your widget and the MCP server. This file defines how to register the widget's HTML template (resource) and tool (function) with the MCP server, and implements the tool's execution logic.

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

**Registration flow breakdown**:

1. **STEP 1: Register HTML Resource**
   - Fetches widget HTML from Next.js server (`/widgets/headphones`)
   - Registers with unique URI (`ui://headphones`)
   - Sets MIME type to `text/html+skybridge` (critical for ChatGPT)
   - Includes metadata about widget description and border preference

2. **STEP 2: Register Tool**
   - Defines tool name (`find_headphones`) and description
   - Links tool to widget via `_meta` (contains `templateUri`)
   - Specifies input schema (Zod schema for validation)
   - Implements tool handler that:
     - Receives validated input from ChatGPT
     - Filters headphones using business logic
     - Returns results with `structuredContent` (becomes `window.openai.toolOutput`)

**Critical fields**:
- `mimeType: "text/html+skybridge"`: Must be exact for ChatGPT to recognize as widget
- `_meta` in tool response: Links the tool's output to the correct widget template
- `structuredContent`: Automatically injected into `window.openai.toolOutput` by ChatGPT

### Step 11: Create Public Exports

**Purpose**: Define the widget package's public API. This controls what other packages can import from your widget, creating a clean interface and hiding internal implementation details.

```typescript
// Public exports for the widget package
export * from "./types";
export * from "./config";
export * from "./register";
export * from "./components/HeadphonesWidget";
export * from "./hooks/useOpenAI";
```

**What gets exported**:
- `types`: TypeScript interfaces for widget configuration
- `config`: Widget metadata and display preferences
- `register`: The `headphonesWidgetPackage` that the MCP server imports
- `HeadphonesWidget`: React component for standalone preview pages
- `useOpenAI`: Hooks for ChatGPT integration (useful for other widgets)

### Step 12: Build the Widget Package

**Purpose**: Compile TypeScript source code to JavaScript that the MCP server can import. This generates the `dist/` folder with compiled `.js` files, `.d.ts` type definitions, and source maps.

```bash
cd packages/widgets/headphones-widget
npm run build
```

**Expected output**:
```
tsc
# No output = successful compilation
# Creates dist/ folder with:
#   - Compiled .js files
#   - Type declaration .d.ts files
#   - Source maps .js.map files
```

**What happens**:
1. TypeScript compiler reads `tsconfig.json`
2. Compiles all `src/**/*.ts` and `src/**/*.tsx` files
3. Outputs to `dist/` folder
4. Generates type declarations for TypeScript consumers
5. MCP server imports from `dist/index.js`

---

## 5. Building Helper Utilities

Instead of using a proprietary framework, we'll create simple helper functions that generate MCP metadata. This makes the code easier to understand and maintain.

### Overview

In this section, we'll build three essential utility modules that form the foundation of our MCP server:

1. **Type Definitions (`types.ts`)**: TypeScript interfaces that define the contracts between components
   - `WidgetContext`: The data structure passed to widgets during registration
   - `WidgetMetadata`: Configuration for how widgets render in ChatGPT
   - `WidgetConfig`: Basic widget identification and description
   - `WidgetPackage`: The structure every widget package must export

2. **Metadata Helpers (`helpers.ts`)**: Functions that create MCP-compliant metadata objects
   - `createResourceMeta()`: Generates metadata for resource registration (HTML templates)
   - `createWidgetMeta()`: Generates metadata for tool registration (links tools to widgets)
   - `getBaseURL()`: Determines the correct base URL for development vs. production

3. **Widget Loader (`loadWidgets.ts`)**: Dynamic widget registration system
   - `loadWidgets()`: Reads widget configuration and registers all enabled widgets
   - Handles environment-specific filtering (development vs. production)
   - Provides error isolation (one broken widget doesn't crash the server)

These utilities eliminate the need for complex frameworks while maintaining clean, type-safe code. Let's build each one step by step.

### Step 1: Define TypeScript Types

**Purpose**: Create TypeScript interfaces that provide compile-time safety and clear contracts between the MCP server and widget packages. These types ensure that widgets and the server communicate correctly and make it obvious what data flows where.

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

**Purpose**: Build simple utility functions that generate MCP-compliant metadata objects. These functions encapsulate the OpenAI-specific metadata format, making it easy to register resources and tools without memorizing the exact field names and structure.

Create `packages/mcp/src/lib/helpers.ts`:

```typescript
import { WidgetMetadata } from "./types";
```

#### Function 1: `createResourceMeta()`

**Purpose**: Generates metadata for registering HTML resources (widget templates) with the MCP server. This tells ChatGPT what the widget displays and how it should be rendered (with or without a border).

**When to use**: Call this when registering a resource with `server.registerResource()`. The metadata controls the widget's appearance and provides context to ChatGPT about what the widget shows.

```typescript
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
```

#### Function 2: `createWidgetMeta()`

**Purpose**: Generates metadata for registering tools with the MCP server. This links a tool to its widget template and configures the status messages users see while the tool executes.

**When to use**: Call this when registering a tool with `server.registerTool()` and when returning tool results. The metadata connects the tool's output to the correct widget template and provides user-friendly status messages.

```typescript
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
```

#### Function 3: `getBaseURL()`

**Purpose**: Determines the correct base URL for the application based on the environment. In development, this ensures widgets can fetch their HTML from localhost. In production, it adapts to the deployment platform (Vercel, etc.).

**When to use**: Call this when you need to construct absolute URLs for fetching widget HTML or other resources. The MCP server uses this to fetch widget templates during registration.

```typescript
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

**Summary**: These three helper functions abstract away the OpenAI metadata format, making your code cleaner and more maintainable. Instead of remembering field names like `"openai/outputTemplate"`, you just call `createWidgetMeta()` with your widget configuration.

### Step 3: Create Widget Loader

**Purpose**: Build a dynamic widget registration system that reads widget configuration and automatically registers all enabled widgets with the MCP server. This eliminates the need to manually register widgets in the server code - just add them to the configuration file.

**Key features**:
- **Environment filtering**: Only loads production-ready widgets in production
- **Error isolation**: If one widget fails to register, others continue loading
- **Logging**: Provides detailed feedback about the registration process
- **Dynamic context**: Each widget receives its own basePath for HTML serving

Create `packages/mcp/src/lib/loadWidgets.ts`:

```typescript
import { WidgetContext } from "./types";
import config from "../../mcp.config";

const WIDGET_REGISTRY = config.widgets;
```

#### Function: `loadWidgets()`

**Purpose**: Orchestrates the widget registration process. This function reads the widget registry from `mcp.config.ts`, filters based on environment, and calls each widget's `registerWidget()` function.

**How it works**:
1. Reads `WIDGET_REGISTRY` from configuration
2. Filters widgets based on `enabled` flag and environment (development vs. production)
3. For each enabled widget, creates a widget-specific context with its basePath
4. Calls the widget's `registerWidget()` function to register tools and resources
5. Handles errors gracefully so one broken widget doesn't crash the server

```typescript
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

**Benefits of this approach**:
- **Scalable**: Add new widgets by updating configuration, not code
- **Maintainable**: Clear separation between widget packages and server logic
- **Robust**: Error handling prevents one broken widget from affecting others
- **Flexible**: Environment-based filtering for development vs. production

---

## 6. Building the MCP Server

Now we'll create the Next.js server that exposes the MCP endpoint and serves widget HTML.

### Overview

In this section, we'll build the MCP server using Next.js App Router. This server has three main responsibilities:

1. **MCP Endpoint (`/mcp`)**: HTTP route that handles JSON-RPC requests from ChatGPT
2. **Widget HTML Serving**: Next.js pages that render widget HTML for ChatGPT iframes
3. **Widget Registry**: Configuration system that dynamically loads enabled widgets

The architecture consists of:
- **Next.js API Route**: Handles MCP protocol requests and responses
- **Widget Configuration**: Central registry (`mcp.config.ts`) listing all widgets
- **Widget Preview Pages**: Standalone pages for testing widgets during development
- **Critical Configuration**: Settings that ensure widgets render correctly in ChatGPT

**Key features**:
- **Dynamic widget loading**: Widgets are loaded from configuration, not hardcoded
- **Development-friendly**: Preview pages let you test widgets without ChatGPT
- **Production-ready**: Proper configuration for deployment to Vercel or other platforms
- **Type-safe**: Full TypeScript integration with widget packages

### Step 1: Initialize Next.js App

**Purpose**: Create a Next.js 15 application with App Router, TypeScript, and Tailwind CSS. This provides the foundation for both the MCP endpoint and widget preview pages.

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

**Purpose**: Add the required npm packages for MCP protocol handling, widget integration, and TypeScript support.

```bash
npm install mcp-handler headphones-widget
npm install @modelcontextprotocol/sdk
```

**Package breakdown**:
- **`mcp-handler`**: Utility library that simplifies creating MCP servers with Next.js by handling JSON-RPC protocol details
- **`headphones-widget`**: Your locally-built widget package (from npm workspaces)
- **`@modelcontextprotocol/sdk`**: Official MCP SDK with types and utilities

### Step 3: Configure Next.js (CRITICAL FOR WIDGET RENDERING)

**Purpose**: Configure Next.js with the critical `assetPrefix` setting that makes JavaScript assets load correctly in ChatGPT's sandboxed iframes. Without this configuration, widgets will appear as blank pages in ChatGPT.

**Why this is critical**: When ChatGPT loads your widget HTML in an iframe, relative script paths like `/_next/static/chunks/main.js` fail because browsers resolve them relative to `chatgpt.com`, not your server. The `assetPrefix` makes all asset URLs absolute, so they load correctly even in iframes.

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

**Configuration breakdown**:
- **`assetPrefix`**: Converts relative URLs to absolute in development (`http://localhost:3000/_next/...`)
- **`output: "standalone"`**: Optimizes for Docker and serverless deployments
- **`transpilePackages`**: Tells Next.js to compile the widget package (required for local packages)

**How it works**:
```typescript
// Without assetPrefix (fails in ChatGPT):
<script src="/_next/static/chunks/main.js"></script>
// Browser resolves: https://chatgpt.com/_next/static/chunks/main.js ❌

// With assetPrefix (works in ChatGPT):
<script src="http://localhost:3000/_next/static/chunks/main.js"></script>
// Browser resolves: http://localhost:3000/_next/static/chunks/main.js ✅
```

### Step 4: Create MCP Widget Registry


**Purpose**: Build a centralized configuration file that declares all available widgets. This registry enables dynamic widget loading - add a new widget by updating this config file, no server code changes needed.
`packages/mcp/mcp.config.ts`

**Registry structure**:
- **Widget ID** (e.g., `"headphones"`): Unique identifier for the widget
- **`package`**: The imported widget package with `config` and `registerWidget`
- **`mcp.enabled`**: Toggle to enable/disable the widget
- **`mcp.production`**: Whether to include in production builds
- **`mcp.basePath`**: URL path where widget HTML is served (e.g., `/widgets/headphones`)

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



**Scalability**: To add more widgets, simply import and add to the registry:
```typescript
widgets: {
  headphones: { /* ... */ },
  speakers: {  // New widget
    package: speakersWidgetPackage,
    mcp: { enabled: true, production: true, basePath: "/widgets/speakers" }
  }
}
```

### Step 5: Create MCP Endpoint

**Purpose**: Build the HTTP endpoint that ChatGPT communicates with. This route handles JSON-RPC requests, dynamically loads widgets from the registry, and returns tool results and widget HTML.
`packages/mcp/src/app/mcp/route.ts`

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

**Request flow**:
1. **Handler creation**: `createMcpHandler()` sets up JSON-RPC request handling
2. **Server initialization**: Creates MCP server instance with widget context
3. **Widget loading**: Calls `loadWidgets()` to register all enabled widgets from config
4. **Request processing**: Handles incoming requests (tool calls, resource reads, etc.)
5. **Response**: Returns JSON-RPC formatted responses to ChatGPT

**Key components**:
- **`logger`**: Console-based logging for debugging
- **`getHtml()`**: Fetches widget HTML from Next.js pages (e.g., `/widgets/headphones`)
- **Exports**: Both `GET` and `POST` handlers (ChatGPT uses POST, GET for health checks)

### Step 6: Create Widget Preview Page

**Purpose**: Build a standalone page that renders the widget. This enables testing and viewing the widget during development to verify it loads correctly.

Create `packages/mcp/src/app/widgets/headphones/page.tsx`:

```typescript
"use client";

import HeadphonesWidget from "headphones-widget/component";

/**
 * Headphones Widget Page
 * Renders the headphones widget component
 */
export default function HeadphonesWidgetPage() {
    return <HeadphonesWidget />;
}
```

**What this page does**:
- **Direct rendering**: Imports and renders the widget component directly
- **Client-side**: Uses `"use client"` directive for React client components
- **Simple import**: Imports from `headphones-widget/component` export path

**Benefits of preview pages**:
- **Fast iteration**: Test widget changes without MCP protocol overhead
- **Visual debugging**: See styling and layout issues immediately
- **Component testing**: Verify React components render correctly

**Access**: Visit `http://localhost:3000/widgets/headphones` while dev server is running

**Note**: The widget component handles its own data fetching from `window.openai.toolOutput` when running in ChatGPT, or can show a loading/empty state when accessed directly.

### Step 7: Create Homepage

`packages/mcp/src/app/widgets/headphones/page.tsx`

**Purpose**: Build an informative landing page that explains the MCP server, provides links to widget previews, and documents the available endpoints.

```typescript
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
            {/* Default Home Page Content */}
        </div>
    );
}
```

### Step 8: Start the Development Server

**Purpose**: Launch the Next.js development server to test the MCP endpoint and widget preview pages locally.

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

**Verification checklist:**

1. **Homepage test**
   - Visit: `http://localhost:3000`
   - Expected: Informative landing page with links to endpoints and documentation

2. **Widget preview test**
   - Visit: `http://localhost:3000/widgets/headphones`
   - Expected: Rendered widget showing all 6 headphones with styling

3. **MCP endpoint test**
   - Visit: `http://localhost:3000/mcp`
   - Expected: JSON error about invalid request (normal - endpoint expects POST with JSON-RPC)

4. **Console logs**
   - Look for: Widget loading messages in terminal
   - Expected: "Loading widgets from registry...", "Successfully registered widget..."

**Next steps**: With the server running, you're ready to test with MCPJam Inspector (Section 7) or connect to ChatGPT (Section 9).

---

## 7. Testing with MCPJam Inspector

MCPJam Inspector is a local testing tool that simulates how ChatGPT interacts with your MCP server.

### Overview

Before deploying to ChatGPT, test your MCP server locally with MCPJam Inspector. This tool provides:

- **Visual playground**: Chat interface that calls your MCP tools
- **Message debugging**: View raw JSON-RPC requests and responses
- **Server connection**: Test multiple MCP servers simultaneously
- **Free AI models**: Test without needing ChatGPT Plus
- **Widget preview**: See how widgets render in an environment similar to ChatGPT

**Testing workflow**:
1. Set up playground configuration
2. Launch Inspector and connect to your MCP server
3. Test widget functionality with natural language prompts
4. Debug with browser DevTools and Messages tab
5. Verify widget styling and interactivity

**Why test locally first?**
- Faster iteration (no deployment required)
- Better debugging (access to console logs and network tab)
- Free testing (no ChatGPT Plus needed)
- Catch issues before production deployment

### Step 1: Set Up Playground Package

**Purpose**: Create a minimal package with MCPJam Inspector configuration and a launch script.

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

**Purpose**: Define the MCP server connection details so Inspector knows where to send requests.

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

**Configuration fields**:
- **`mcpServers`**: Object containing all MCP servers you want to test
- **`"TechGear"`**: Display name for this server (shown in Inspector UI)
- **`url`**: Full URL to your MCP endpoint
- **`type`**: Transport type (`"http"` for HTTP servers, `"stdio"` for command-line tools)

### Step 3: Launch Inspector

**Purpose**: Start both the MCP server and MCPJam Inspector to begin testing.

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

**Purpose**: Establish connection between Inspector and your MCP server to enable tool discovery.

**Steps**:
1. Open Inspector in your browser (automatically opens)
2. Navigate to **Servers** tab in the left sidebar
3. Find "TechGear" in the list
4. Click **Connect** button
5. Wait for green checkmark ✅ indicating successful connection

**What happens during connection**:
- Inspector sends `tools/list` request to your server
- Inspector sends `resources/list` request to discover widgets
- Your server responds with available tools and resources
- Inspector displays discovered capabilities

**Troubleshooting**:
- **Connection failed**: Ensure MCP server is running (`npm run dev` in Terminal 1)
- **No tools listed**: Check server logs for widget registration errors
- **Timeout**: Verify URL in `mcp.config.json` matches your server

### Step 5: Test in Playground

**Purpose**: Verify that widgets render correctly and respond to natural language queries.

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

**Purpose**: Use browser DevTools to verify that data is flowing correctly from the MCP server to the widget.

**Steps**:
1. Open browser DevTools (press F12)
2. Switch to **Console** tab
3. Look for widget-related logs

**Expected console output:**
```javascript
[HeadphonesWidget] window.openai available: {toolOutput: {...}}
[useWidgetProps] window.openai found: {toolOutput: {...}}
[useWidgetProps] Setting toolOutput: {headphones: [...], summary: "..."}
```

**Visual verification checklist:**
- ✅ Cards have rounded corners and shadows
- ✅ Gradient headers (blue to purple)
- ✅ Hover effects work on cards and buttons
- ✅ Badges are colored correctly (blue, green, purple)
- ✅ Layout is responsive and centered
- ✅ Fonts and spacing look polished

**Common issues**:
- **No logs**: Widget JavaScript not loading (check asset prefix)
- **Loading forever**: Data not reaching widget (check `useSyncExternalStore`)
- **Broken styling**: Tailwind CSS not loaded or conflicting styles

### Step 7: Debug with Messages Tab

**Purpose**: Examine raw JSON-RPC messages to understand the protocol communication and debug issues.

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

**What to look for in messages**:
- **Tool call arguments**: Verify AI is passing correct filter values
- **Tool response structure**: Check `structuredContent` contains expected data
- **Resource URI**: Confirm matches your widget's `templateUri`
- **Metadata fields**: Verify all `_meta` fields are present
- **MIME type**: Must be `text/html+skybridge`

### Testing Summary

Once MCPJam Inspector successfully renders your widget:

✅ **MCP protocol working**: Server correctly handles JSON-RPC requests  
✅ **Widget registration working**: Tools and resources registered properly  
✅ **Data flow working**: `structuredContent` reaches `window.openai.toolOutput`  
✅ **UI working**: React component renders with correct styling  
✅ **Ready for ChatGPT**: Widget should work the same way in real ChatGPT  

**Next steps**: Deploy your MCP server (Vercel, ngrok, etc.) and connect it to ChatGPT (Section 9).

---


## 8. Critical Configuration and Troubleshooting

This section covers the essential configurations for widget rendering and provides solutions to common issues.

### Overview

Widgets require specific configurations to render correctly in ChatGPT's sandboxed iframe environment. Missing any of these configurations will cause widgets to fail in different ways (blank page, frozen loading, JSON display, etc.).

**Critical requirements**:
1. **Asset Prefix Configuration**: Making JavaScript files load with absolute URLs
2. **Event-Driven Reactivity**: Using React 18's `useSyncExternalStore` instead of polling
3. **MIME Type Specification**: Using `text/html+skybridge` for widget templates
4. **Complete Metadata**: Including `_meta` fields in resources, tools, and responses
5. **Simplified Response Format**: Using `structuredContent` at root level (not in nested array)

**Troubleshooting approach**:
1. Check browser console for errors
2. Verify MCP server logs for registration issues
3. Test widget preview page first (`/widgets/headphones`)
4. Use MCPJam Messages tab to inspect protocol communication
5. Verify all five critical configurations using the checklist below

---

### Critical Configuration 1: Asset Prefix

**Why it's required**: When ChatGPT loads your widget HTML in an iframe, script tags with relative paths like `<script src="/_next/static/chunks/webpack.js">` fail because the browser resolves them relative to `chatgpt.com`, not your server.

**Configuration** (already in `next.config.ts`):
```typescript
function getAssetPrefix(): string {
    if (process.env.NODE_ENV === "development") {
        const port = process.env.PORT || 3000;
        return `http://localhost:${port}`;  // Absolute URLs in development
    }
    return "";  // Relative paths in production
}

const nextConfig: NextConfig = {
    assetPrefix: getAssetPrefix(),  // CRITICAL
    // ...
};
```

**How it works:**
```typescript
// Without assetPrefix (fails in ChatGPT):
<script src="/_next/static/chunks/webpack.js"></script>
// Browser resolves: https://chatgpt.com/_next/static/chunks/webpack.js ❌

// With assetPrefix (works in ChatGPT):
<script src="http://localhost:3000/_next/static/chunks/webpack.js"></script>
// Browser resolves: http://localhost:3000/_next/static/chunks/webpack.js ✅
```

---

### Critical Configuration 2: Event-Driven Reactivity

**Why it's required**: Old implementations used `setInterval` polling to check for `window.openai.toolOutput`. This has timing issues - the component might check before ChatGPT injects the data, or React might not re-render even when the data changes.

**Configuration** (already in `useOpenAI.ts`):
```typescript
// CORRECT ✅ - Event-driven approach
useSyncExternalStore(
    (onChange) => {
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

// WRONG ❌ - Polling approach (don't use)
useEffect(() => {
    const intervalId = setInterval(() => {
        if (window.openai?.toolOutput) {
            setProps(window.openai.toolOutput);
        }
    }, 1000);
    return () => clearInterval(intervalId);
}, []);
```

**Benefits:**
- ✅ Immediate reactivity (no delay)
- ✅ No CPU waste from polling
- ✅ Follows React 18+ best practices
- ✅ Matches OpenAI's official examples

---

### Critical Configuration 3: MIME Type

**Why it's required**: ChatGPT requires the specific MIME type `text/html+skybridge` to recognize HTML content as a widget template. Using standard `text/html` causes ChatGPT to treat it as regular content, not a widget.

**Configuration** (in `register.ts`):
```typescript
// CORRECT ✅
server.registerResource(
    "headphones-widget",
    headphonesWidgetMetadata.templateUri,
    {
        mimeType: "text/html+skybridge",  // Must include +skybridge
        // ...
    },
    async (uri: URL) => ({
        contents: [
            {
                mimeType: "text/html+skybridge",  // Must match above
                text: `<html>${html}</html>`,
                // ...
            },
        ],
    })
);

// WRONG ❌
mimeType: "text/html"  // Missing +skybridge suffix
```

---

### Critical Configuration 4: Complete Metadata

**Why it's required**: ChatGPT uses `_meta` fields to understand that a tool should display a widget and which widget template to use. Missing metadata breaks the connection between the tool and its widget.

**Configuration** (in `register.ts`, three places):

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

---

### Critical Configuration 5: Simplified Response Format

**Why it's required**: Older MCP documentation showed a nested array format. The current implementation uses a simpler format with `structuredContent` at the root level.

**Configuration** (in `register.ts`):
```typescript
// CORRECT ✅
return {
    content: [{ type: "text", text: summary }],
    structuredContent: result,  // At root level
    _meta: createWidgetMeta(headphonesWidgetMetadata),
};

// DEPRECATED ❌ (don't use)
return {
    content: [
        {
            type: "text",
            text: summary,
            _meta: {
                openai: {
                    widgets: [  // Nested array format is deprecated
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

**Why this works:**
- The tool's `_meta["openai/outputTemplate"]` already links to the widget
- ChatGPT knows which widget to render from the tool metadata
- The `structuredContent` at root level is automatically injected into `window.openai.toolOutput`

---

### Troubleshooting Guide

#### Problem 1: Widget Shows Blank Page

**Symptoms:**
- Widget iframe loads but shows nothing
- Console error: `Uncaught SyntaxError: Unexpected token '<'`
- Network tab shows 404 for `/_next/static/chunks/...`

**Diagnosis:** Asset prefix configuration missing or incorrect

**Solution:**

1. Verify `assetPrefix` in `next.config.ts`:
```bash
# Check if asset URLs are absolute
curl -s http://localhost:3000/widgets/headphones | grep -o 'src="[^"]*"' | head -3
```

2. **Expected output:**
```
src="http://localhost:3000/_next/static/chunks/webpack.js"
src="http://localhost:3000/_next/static/chunks/main.js"
```

3. **If you see relative paths**, restart the server:
```bash
# Ctrl+C to stop server, then:
npm run dev
```

---

#### Problem 2: Widget Shows Loading Forever

**Symptoms:**
- Widget loads but shows "Loading headphones..." forever
- No console logs from `useWidgetProps`
- `window.openai.toolOutput` is undefined or not updating

**Diagnosis:** Data not reaching the widget (reactivity issue)

**Solution:**

1. **Check browser console:**
```javascript
// In browser console:
window.openai
// Should show: {toolOutput: {...}, maxHeight: number}
```

2. **Verify event-driven implementation:**
```bash
# In widget package:
grep -n "useSyncExternalStore" src/hooks/useOpenAI.ts
```
Should show the `useSyncExternalStore` implementation, not polling

3. **Rebuild widget if necessary:**
```bash
cd packages/widgets/headphones-widget
npm run build
cd ../../mcp
# Restart server: Ctrl+C then npm run dev
```

---

#### Problem 3: Widget Shows JSON Instead of HTML

**Symptoms:**
- Widget area shows raw JSON text
- No HTML is rendered
- Console may show MIME type warnings

**Diagnosis:** MIME type missing `+skybridge` suffix

**Solution:**

Check `register.ts` for correct MIME type:
```typescript
// Both places must have +skybridge:
mimeType: "text/html+skybridge"  // ✅ Correct
```

After fixing, rebuild and restart:
```bash
cd packages/widgets/headphones-widget
npm run build
cd ../../mcp
npm run dev
```

---

#### Problem 4: Widget Shows But Data Doesn't Update

**Symptoms:**
- Widget renders with fallback/default data
- Doesn't update when tool is called
- May see correct data in network tab but not in widget

**Diagnosis:** Tool response missing metadata or using wrong format

**Solution:**

Verify tool response structure in `register.ts`:
```typescript
return {
    content: [{ type: "text", text: summary }],
    structuredContent: result,  // ✅ Must be at root level
    _meta: createWidgetMeta(headphonesWidgetMetadata),  // ✅ Must include _meta
};
```

---

#### Problem 5: Tool Not Being Called

**Symptoms:**
- You ask about headphones but tool isn't invoked
- ChatGPT responds in text only
- No widget appears

**Diagnosis:** Tool description isn't clear or lacks examples

**Solution:**

Update `prompts.ts` with explicit examples:
```typescript
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
- style: in-ear, on-ear, over-ear, or all`
```

Be explicit about when to use the tool and provide diverse example queries.

---

### Configuration Checklist

Before testing your widget, verify all five critical configurations:

- [ ] **Asset prefix** configured in `next.config.ts` (returns absolute URLs in development)
- [ ] **Event-driven reactivity** using `useSyncExternalStore` in widget hook
- [ ] **MIME type** is `text/html+skybridge` in both resource descriptor and contents
- [ ] **Complete metadata** in resource registration, tool registration, and tool response
- [ ] **Simplified response format** with `structuredContent` at root level (not in nested array)

**Quick verification:**
```bash
# Verify absolute URLs
curl -s http://localhost:3000/widgets/headphones | grep -o 'src="[^"]*"' | head -3
# Should show: src="http://localhost:3000/_next/static/..." ✅
# NOT: src="/_next/static/..." ❌

# Verify event-driven implementation
grep -n "useSyncExternalStore" packages/widgets/headphones-widget/src/hooks/useOpenAI.ts

# Verify MIME type
grep -n "text/html+skybridge" packages/widgets/headphones-widget/src/register.ts
```

---

## 9. Testing with ChatGPT

Once everything works in MCPJam Inspector, test with real ChatGPT.

### Overview

This section guides you through connecting your MCP server to ChatGPT for real-world testing. The process involves:

1. **Expose your server**: Make localhost accessible via HTTPS (ngrok or deployment)
2. **Enable Developer Mode**: Activate ChatGPT's MCP connector features (requires ChatGPT Plus)
3. **Add MCP Connector**: Register your server URL in ChatGPT settings
4. **Test end-to-end**: Verify widgets render correctly in actual ChatGPT conversations
5. **Monitor server**: Watch logs to debug any issues

**Prerequisites**:
- ✅ Widget works in MCPJam Inspector (Section 8)
- ✅ All critical configurations verified (Section 7)
- ✅ ChatGPT Plus subscription (required for MCP connectors)
- ✅ Server accessible via HTTPS URL

**Testing workflow**:
1. Expose server via ngrok or deploy to Vercel
2. Configure ChatGPT with your MCP endpoint URL
3. Test with natural language prompts
4. Verify widget rendering and interactivity
5. Monitor server logs for errors

### Step 1: Expose Your Server

**Purpose**: Make your local development server accessible over the internet with HTTPS, which ChatGPT requires for security.

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

**Purpose**: Activate ChatGPT's experimental MCP connector features, which allow connecting to custom MCP servers.

**Steps**:
1. Open ChatGPT (requires ChatGPT Plus subscription)
2. Navigate to **Settings** → **Beta Features**
3. Toggle **Developer Mode** to enabled

**Note**: This feature is in beta and may change. Check OpenAI's documentation for current availability.

### Step 3: Add MCP Connector

**Purpose**: Register your MCP server URL in ChatGPT so it can discover and call your widgets.

**Steps**:
1. In ChatGPT, open **Settings** → **Apps & Connectors**
2. Click **Add Connector** button
3. Fill in connector details:
   - **Name**: `TechGear` (display name)
   - **URL**: `https://your-ngrok-url.ngrok.io/mcp` (must include `/mcp` path)
   - **Type**: `HTTP`
4. Click **Save**
5. Wait for connection verification (green checkmark)

**Troubleshooting**:
- **Connection failed**: Verify URL is accessible and includes `/mcp` path
- **Invalid response**: Check server logs for errors during connection
- **Timeout**: Ensure server is running and firewall allows connections

### Step 4: Test in ChatGPT

**Purpose**: Verify end-to-end functionality with real ChatGPT conversations.

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

**Purpose**: Track incoming requests and debug any issues that occur during ChatGPT interaction.

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

## 10. Key Learnings and Best Practices

### Overview

This section summarizes the key lessons learned during development and provides best practices for building MCP apps. Use this as a reference guide when:
- Starting new widget projects
- Troubleshooting existing widgets
- Optimizing your development workflow
- Scaling to multiple widgets

**What's covered**:
- **Architecture lessons**: Patterns that worked well for this project
- **Critical configurations**: Must-have settings for widget rendering
- **Development workflow**: Efficient process for building and testing
- **Debugging tips**: Tools and techniques for troubleshooting
- **Common mistakes**: Pitfalls to avoid
- **Scaling guidance**: How to add more widgets efficiently

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

