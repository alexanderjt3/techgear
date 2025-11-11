/**
 * Widget prompts interface
 */
export interface WidgetPrompts {
    toolTitle: string;
    toolDescription: string;
    resourceTitle: string;
    resourceDescription: string;
    widgetDescription: string;
}

/**
 * Prompt engineering metadata for the Headphones widget
 * These strings are carefully crafted for LLM interaction
 */
export const headphonesWidgetPrompts: WidgetPrompts = {
    toolTitle: "Find Headphones",
    toolDescription:
        "Search and display headphones based on price range, activity type, and style preferences. Returns personalized recommendations.",
    resourceTitle: "Headphones Widget",
    resourceDescription: "Interactive headphones recommendation interface",
    widgetDescription:
        "Displays an interactive carousel of headphone recommendations with filters for price, activity, and style",
};

