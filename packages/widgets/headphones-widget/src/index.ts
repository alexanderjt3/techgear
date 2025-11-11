export { headphonesWidgetPackage } from "./register";
export { headphonesWidgetConfig, headphonesWidgetMetadata } from "./config";
export type {
    FindHeadphonesToolInput,
    FindHeadphonesToolOutput,
    Headphone,
} from "./semantic/contracts";
export type {
    WidgetContext,
    WidgetPackage,
    WidgetConfig,
    WidgetMetadata,
    Logger,
} from "./types";
export { useWidgetProps, useMaxHeight, useIsChatGptApp } from "./hooks/useOpenAI";

