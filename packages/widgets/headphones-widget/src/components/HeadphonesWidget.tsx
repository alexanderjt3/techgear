"use client";

import { useEffect, useMemo, useState } from "react";
import { useWidgetProps } from "../hooks/useOpenAI";

export type Headphone = {
    id: string;
    name: string;
    priceBracket: "budget" | "midrange" | "premium";
    activity: "commuting" | "gaming" | "studio" | "fitness";
    style: "in-ear" | "on-ear" | "over-ear";
    price: string;
    description: string;
    ctaUrl: string;
    imageUrl?: string;
};

const HEADPHONES: Headphone[] = [
    {
        id: "arc-commuter",
        name: "ArcSound Metro ANC",
        priceBracket: "budget",
        activity: "commuting",
        style: "over-ear",
        price: "$99",
        description:
            "Lightweight ANC cans with USB-C fast charging and 28-hour battery life.",
        ctaUrl: "https://example.com/arcsound-metro",
    },
    {
        id: "pulse-lite",
        name: "Pulse Lite Sport",
        priceBracket: "budget",
        activity: "fitness",
        style: "in-ear",
        price: "$79",
        description:
            "IPX7 buds with secure wing tips and an energetic EQ for cardio workouts.",
        ctaUrl: "https://example.com/pulse-lite",
    },
    {
        id: "soniq-pro",
        name: "Soniq Pro Studio",
        priceBracket: "premium",
        activity: "studio",
        style: "over-ear",
        price: "$349",
        description:
            "Closed-back studio monitors tuned for accurate mixing and long sessions.",
        ctaUrl: "https://example.com/soniq-pro",
    },
    {
        id: "lumen-air",
        name: "Lumen Air Max",
        priceBracket: "premium",
        activity: "commuting",
        style: "in-ear",
        price: "$279",
        description:
            "Adaptive transparency with wind reduction for commuters on busy streets.",
        ctaUrl: "https://example.com/lumen-air",
    },
    {
        id: "nova-gx",
        name: "Nova GX Wireless",
        priceBracket: "midrange",
        activity: "gaming",
        style: "over-ear",
        price: "$179",
        description:
            "Low-latency 2.4GHz wireless with spatial audio tuned for FPS titles.",
        ctaUrl: "https://example.com/nova-gx",
    },
    {
        id: "auris-flow",
        name: "Auris Flow",
        priceBracket: "midrange",
        activity: "fitness",
        style: "on-ear",
        price: "$149",
        description:
            "Sweat-resistant on-ears with breathable pads and multipoint Bluetooth.",
        ctaUrl: "https://example.com/auris-flow",
    },
];

type FilterValue =
    | "all"
    | Headphone["priceBracket"]
    | Headphone["activity"]
    | Headphone["style"];

const priceOptions: { label: string; value: FilterValue }[] = [
    { label: "All prices", value: "all" },
    { label: "Budget", value: "budget" },
    { label: "Midrange", value: "midrange" },
    { label: "Premium", value: "premium" },
];

const activityOptions: { label: string; value: FilterValue }[] = [
    { label: "Any activity", value: "all" },
    { label: "Commuting", value: "commuting" },
    { label: "Fitness", value: "fitness" },
    { label: "Gaming", value: "gaming" },
    { label: "Studio", value: "studio" },
];

const styleOptions: { label: string; value: FilterValue }[] = [
    { label: "Any style", value: "all" },
    { label: "In-ear", value: "in-ear" },
    { label: "On-ear", value: "on-ear" },
    { label: "Over-ear", value: "over-ear" },
];

export type HeadphoneCarouselProps = {
    dataset?: Headphone[];
    summary?: string;
};

type ToolOutput = {
    headphones?: Headphone[];
    summary?: string;
};

export default function HeadphonesWidget({
    dataset,
    summary,
}: HeadphoneCarouselProps = {}) {
    const [price, setPrice] = useState<FilterValue>("all");
    const [activity, setActivity] = useState<FilterValue>("all");
    const [style, setStyle] = useState<FilterValue>("all");

    // Try to get data from OpenAI context (when running in ChatGPT)
    const toolOutput = useWidgetProps<ToolOutput>();
    
    // Use MCP data if available, otherwise use props
    const mcpData = toolOutput?.headphones || dataset;
    const mcpSummary = toolOutput?.summary || summary;

    // Determine if we're using MCP data (already filtered server-side)
    // or fallback data (needs client-side filtering)
    const isUsingMcpData = mcpData && mcpData.length > 0;

    const headphones = useMemo(() => {
        if (!mcpData || mcpData.length === 0) {
            console.log("[Carousel] No MCP data, using fallback HEADPHONES");
            return HEADPHONES;
        }

        console.log("[Carousel] Using MCP data:", mcpData);
        return mcpData.map((item, index) => ({
            ...item,
            id: item.id || `headphone-${index}`,
            priceBracket: normalizePrice(item.priceBracket),
            activity: normalizeActivity(item.activity),
            style: normalizeStyle(item.style),
        }));
    }, [mcpData]);

    // Only apply client-side filtering when using fallback data
    // MCP data is already filtered server-side
    const filtered = useMemo(() => {
        if (isUsingMcpData) {
            console.log(
                "[Carousel] MCP data filtered count:",
                headphones.length,
                "items:",
                headphones
            );
            return headphones; // MCP data is already filtered, show as-is
        }

        const result = headphones.filter((item) => {
            const priceMatch = price === "all" || item.priceBracket === price;
            const activityMatch =
                activity === "all" || item.activity === activity;
            const styleMatch = style === "all" || item.style === style;
            return priceMatch && activityMatch && styleMatch;
        });
        console.log("[Carousel] Client-side filtered count:", result.length);
        return result;
    }, [headphones, price, activity, style, isUsingMcpData]);

    // Log when filtered data changes (outside of render)
    useEffect(() => {
        console.log("[Carousel] Rendering with filtered.length:", filtered.length);
        filtered.forEach((headphone, index) => {
            console.log("[Carousel] Rendering card", index, ":", headphone);
        });
    }, [filtered]);

    return (
        <section className="flex w-full max-w-5xl flex-col gap-8 rounded-3xl border border-zinc-200 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                    Find your next headphones
                </h1>
                <p className="text-base text-zinc-600 dark:text-zinc-400">
                    {isUsingMcpData
                        ? "Here are your personalized recommendations based on your preferences."
                        : "Narrow the catalog by price range, listening situation, and preferred wear style."}
                </p>
                {mcpSummary ? (
                    <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
                        {mcpSummary}
                    </p>
                ) : null}
            </header>

            {/* Only show filter controls when using fallback data (not from MCP) */}
            {!isUsingMcpData && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FilterSelect
                        label="Price range"
                        value={price}
                        onChange={setPrice}
                        options={priceOptions}
                    />
                    <FilterSelect
                        label="Activity"
                        value={activity}
                        onChange={setActivity}
                        options={activityOptions}
                    />
                    <FilterSelect
                        label="Style"
                        value={style}
                        onChange={setStyle}
                        options={styleOptions}
                    />
                </div>
            )}

            <div className="flex flex-col gap-4">
                {filtered.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((headphone) => (
                            <HeadphoneCard
                                key={headphone.id}
                                headphone={headphone}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

type FilterSelectProps = {
    label: string;
    value: FilterValue;
    onChange: (value: FilterValue) => void;
    options: { label: string; value: FilterValue }[];
};

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
    return (
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
            <select
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm transition hover:border-zinc-300 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value as FilterValue)
                }
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function HeadphoneCard({ headphone }: { headphone: Headphone }) {
    return (
        <article className="flex h-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {headphone.name}
                </h2>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {headphone.price}
                </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {headphone.description}
            </p>
            <dl className="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Detail label="Price" value={capitalize(headphone.priceBracket)} />
                <Detail label="Activity" value={capitalize(headphone.activity)} />
                <Detail label="Style" value={formatStyle(headphone.style)} />
            </dl>
            <a
                href={headphone.ctaUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
                View on Amazon
            </a>
        </article>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1 rounded-lg bg-zinc-100 p-2 text-left dark:bg-zinc-800/60">
            <span className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {label}
            </span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {value}
            </span>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-100/60 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
            <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">
                No headphones fit those filters yet.
            </span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Loosen a filter or ask the TechGear MCP tool for a broader
                recommendation set.
            </p>
        </div>
    );
}

function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatStyle(style: Headphone["style"]) {
    return style === "in-ear"
        ? "In-ear"
        : style === "on-ear"
          ? "On-ear"
          : "Over-ear";
}

function normalizePrice(
    value: Headphone["priceBracket"] | string | undefined
): Headphone["priceBracket"] {
    if (value === "budget" || value === "midrange" || value === "premium")
        return value;
    return "midrange";
}

function normalizeActivity(
    value: Headphone["activity"] | string | undefined
): Headphone["activity"] {
    if (
        value === "commuting" ||
        value === "gaming" ||
        value === "studio" ||
        value === "fitness"
    )
        return value;
    return "commuting";
}

function normalizeStyle(
    value: Headphone["style"] | string | undefined
): Headphone["style"] {
    if (value === "in-ear" || value === "on-ear" || value === "over-ear")
        return value;
    return "over-ear";
}

