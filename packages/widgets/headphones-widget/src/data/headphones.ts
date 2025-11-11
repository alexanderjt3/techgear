import { Headphone } from "../semantic/contracts";

/**
 * Hardcoded headphones data
 */
export const HEADPHONES: Headphone[] = [
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

/**
 * Filter headphones based on criteria
 */
export function filterHeadphones(
    priceBracket?: string,
    activity?: string,
    style?: string
): Headphone[] {
    return HEADPHONES.filter((headphone) => {
        const priceMatch =
            !priceBracket ||
            priceBracket === "all" ||
            headphone.priceBracket === priceBracket;
        const activityMatch =
            !activity || activity === "all" || headphone.activity === activity;
        const styleMatch =
            !style || style === "all" || headphone.style === style;

        return priceMatch && activityMatch && styleMatch;
    });
}

