"use client";

import { useSyncExternalStore } from "react";

/**
 * OpenAI global event type for subscribing to changes
 * ChatGPT fires this event when it updates window.openai properties
 */
const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";

/**
 * Hook to subscribe to a specific OpenAI global value.
 * Uses React's useSyncExternalStore for efficient reactivity.
 * 
 * Based on: https://github.com/openai/openai-apps-sdk-examples/tree/main/src
 */
function useOpenAIGlobal<K extends keyof any>(key: K): any {
    return useSyncExternalStore(
        (onChange) => {
            if (typeof window === "undefined") {
                return () => {};
            }

            const handleSetGlobal = (event: CustomEvent) => {
                const globals = event.detail?.globals || {};
                const value = globals[key];
                if (value === undefined) {
                    return;
                }
                onChange();
            };

            window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal as EventListener, {
                passive: true,
            });

            return () => {
                window.removeEventListener(
                    SET_GLOBALS_EVENT_TYPE,
                    handleSetGlobal as EventListener
                );
            };
        },
        () =>
            typeof window !== "undefined" && (window as any).openai
                ? (window as any).openai[key] ?? null
                : null,
        () => null
    );
}

/**
 * Hook to get widget props (tool output) from ChatGPT.
 * In ChatGPT, this provides access to tool output data.
 * 
 * @param defaultState - Default value if tool output is not available
 * @returns The tool output props or the default fallback
 */
export function useWidgetProps<T>(defaultState?: T | (() => T)): T | null {
    const toolOutput = useOpenAIGlobal("toolOutput") as T | null;

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
        () => () => {},  // No subscription needed for this check
        () => typeof window !== "undefined" && "openai" in window,
        () => false
    );
}

