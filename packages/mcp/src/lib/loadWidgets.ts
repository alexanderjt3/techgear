import { WidgetContext } from "headphones-widget";
import config from "../../mcp.config";

const WIDGET_REGISTRY = config.widgets;

/**
 * Load and register all enabled widgets
 * Filters based on NODE_ENV:
 * - production: only widgets with production: true
 * - development/other: all enabled widgets
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

            // In production, only include production widgets
            if (isProduction && !entry.mcp.production) return false;

            return true;
        }
    );

    logger.info(
        `Found ${enabledWidgets.length} ${isProduction ? "production" : "enabled"} widgets: ${enabledWidgets.map(([id]) => id).join(", ")}`
    );

    for (const [widgetId, entry] of enabledWidgets) {
        try {
            const { package: widgetPackage, mcp } = entry;

            logger.info(
                `Registering widget: ${widgetPackage.config.name} (${widgetId})`
            );

            // Create context with MCP-specific basePath
            const widgetContext: WidgetContext = {
                ...context,
                basePath: mcp.basePath,
            };

            await widgetPackage.registerWidget(widgetContext);
            logger.info(
                `Successfully registered widget: ${widgetPackage.config.name}`
            );
        } catch (error) {
            logger.error(
                `Failed to register widget ${widgetId}: ${error instanceof Error ? error.message : String(error)}`
            );
            // Continue with other widgets even if one fails
        }
    }

    logger.info("Widget loading complete");
}

