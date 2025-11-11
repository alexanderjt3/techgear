import { createMcpHandler } from "mcp-handler";
import { loadWidgets } from "@/lib/loadWidgets";
import { WidgetContext } from "headphones-widget";
import { getBaseURL } from "@/lib/helpers";

/**
 * MCP Handler - Gateway for all widgets
 * Dynamically loads and registers widgets based on configuration
 */
const handler = createMcpHandler(async (server) => {
    const context: Omit<WidgetContext, "basePath"> = {
        server,
        logger: {
            info: console.info.bind(console),
            error: console.error.bind(console),
            warn: console.warn.bind(console),
            debug: console.debug.bind(console),
        },
        getHtml: async (path: string) => {
            const baseURL = getBaseURL();
            const result = await fetch(`${baseURL}${path}`, {
                cache: "no-store",
            });
            return await result.text();
        },
    };

    // Load all enabled widgets from configuration
    await loadWidgets(context);
});

export const GET = handler;
export const POST = handler;

