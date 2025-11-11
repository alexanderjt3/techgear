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

