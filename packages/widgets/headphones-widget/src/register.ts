import {
    WidgetPackage,
    WidgetContext,
} from "./types";
import { createWidgetMeta, createResourceMeta } from "./helpers";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { headphonesWidgetConfig, headphonesWidgetMetadata } from "./config";
import {
    FindHeadphonesToolInputContract,
    FindHeadphonesToolOutputContract,
    FindHeadphonesToolInput,
    FindHeadphonesToolOutput,
} from "./semantic/contracts";
import { headphonesWidgetPrompts } from "./semantic/prompts";
import { filterHeadphones } from "./data/headphones";

/**
 * Register the headphones widget with the MCP server
 */
async function registerWidget(context: WidgetContext): Promise<void> {
    const { server, logger, getHtml, basePath } = context;

    logger.info(`Registering headphones widget at ${basePath}`);

    // Fetch the HTML for the widget
    const html = await getHtml(basePath);

    // Register the resource (widget UI)
    // The assetPrefix in next.config.ts ensures scripts load with absolute URLs
    server.registerResource(
        "headphones-widget",
        headphonesWidgetMetadata.templateUri,
        {
            title: headphonesWidgetPrompts.resourceTitle,
            description: headphonesWidgetPrompts.resourceDescription,
            mimeType: "text/html+skybridge",
            _meta: createResourceMeta(
                headphonesWidgetPrompts.widgetDescription,
                headphonesWidgetMetadata.prefersBorder
            ),
        },
        async (uri: URL) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: "text/html+skybridge",
                    text: `<html>${html}</html>`,
                    _meta: createResourceMeta(
                        headphonesWidgetPrompts.widgetDescription,
                        headphonesWidgetMetadata.prefersBorder
                    ),
                },
            ],
        })
    );

    // Register the tool
    server.registerTool(
        "find_headphones",
        {
            title: headphonesWidgetPrompts.toolTitle,
            description: headphonesWidgetPrompts.toolDescription,
            inputSchema: FindHeadphonesToolInputContract.shape,
            outputSchema: FindHeadphonesToolOutputContract.shape,
            _meta: createWidgetMeta(headphonesWidgetMetadata),
        },
        async (
            input: FindHeadphonesToolInput
        ): Promise<CallToolResult> => {
            const { priceBracket, activity, style } = input;

            // Filter headphones based on input criteria
            const headphones = filterHeadphones(priceBracket, activity, style);

            // Create a summary
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

            return {
                content: [
                    {
                        type: "text",
                        text: summary,
                    },
                ],
                structuredContent: result,
                _meta: createWidgetMeta(headphonesWidgetMetadata),
            };
        }
    );

    logger.info("Headphones widget registered successfully");
}

/**
 * Headphones Widget Package
 * Exports the widget configuration and registration function
 */
export const headphonesWidgetPackage: WidgetPackage = {
    config: headphonesWidgetConfig,
    registerWidget,
};

