import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Logger interface for widget operations
 */
export interface Logger {
    info: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
}

/**
 * Context provided to each widget during registration
 */
export interface WidgetContext {
    server: McpServer;
    logger: Logger;
    getHtml: (path: string) => Promise<string>;
    basePath: string;
}

/**
 * Widget configuration
 */
export interface WidgetConfig {
    id: string;
    name: string;
}

/**
 * Widget metadata for MCP registration
 */
export interface WidgetMetadata {
    templateUri: string;
    invoking: string;
    invoked: string;
    prefersBorder: boolean;
}

/**
 * Widget package structure
 */
export interface WidgetPackage {
    config: WidgetConfig;
    registerWidget: (context: WidgetContext) => Promise<void>;
}

