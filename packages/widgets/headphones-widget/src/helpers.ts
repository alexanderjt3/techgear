import { WidgetMetadata } from "./types";

/**
 * Create metadata for MCP resource registration
 * Simplified version without framework dependencies
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
 * Simplified version without framework dependencies
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

