import { headphonesWidgetPackage, WidgetPackage } from "headphones-widget";

/**
 * Widget registry entry
 */
interface WidgetRegistryEntry {
    package: WidgetPackage;
    mcp: {
        enabled: boolean;
        production: boolean;
        basePath: string;
    };
}

/**
 * MCP configuration structure
 */
interface McpConfig {
    widgets: Record<string, WidgetRegistryEntry>;
}

/**
 * MCP configuration mapping widget IDs to their packages and MCP configuration
 * Add new widgets here as they are created
 */
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

