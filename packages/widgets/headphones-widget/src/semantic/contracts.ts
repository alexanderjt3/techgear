import z from "zod";

/**
 * Input schema for the Find Headphones tool
 */
export const FindHeadphonesToolInputContract = z.object({
    priceBracket: z
        .enum(["budget", "midrange", "premium", "all"])
        .optional()
        .describe("Price range filter: budget, midrange, premium, or all"),
    activity: z
        .enum(["commuting", "gaming", "studio", "fitness", "all"])
        .optional()
        .describe(
            "Activity filter: commuting, gaming, studio, fitness, or all"
        ),
    style: z
        .enum(["in-ear", "on-ear", "over-ear", "all"])
        .optional()
        .describe("Style filter: in-ear, on-ear, over-ear, or all"),
});

/**
 * Headphone data structure
 */
export const HeadphoneContract = z.object({
    id: z.string(),
    name: z.string(),
    priceBracket: z.enum(["budget", "midrange", "premium"]),
    activity: z.enum(["commuting", "gaming", "studio", "fitness"]),
    style: z.enum(["in-ear", "on-ear", "over-ear"]),
    price: z.string(),
    description: z.string(),
    ctaUrl: z.string(),
    imageUrl: z.string().optional(),
});

/**
 * Output schema for the Find Headphones tool
 */
export const FindHeadphonesToolOutputContract = z.object({
    headphones: z.array(HeadphoneContract),
    summary: z.string().optional().describe("Optional summary of the results"),
});

export type FindHeadphonesToolInput = z.infer<
    typeof FindHeadphonesToolInputContract
>;
export type FindHeadphonesToolOutput = z.infer<
    typeof FindHeadphonesToolOutputContract
>;
export type Headphone = z.infer<typeof HeadphoneContract>;

