import { Router, type IRouter } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getAuth } from "@clerk/express";
import { GoogleGenAI, Type } from "@google/genai";
import { eq } from "drizzle-orm";
import { getDb, sharedVerdictsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const AnalyzeIdeaInputSchema = z.object({
  idea: z
    .string({ required_error: "Idea is required" })
    .trim()
    .min(10, "Idea must be at least 10 characters long.")
    .max(500, "Idea cannot exceed 500 characters."),
  roastMode: z.boolean().optional().default(false),
});

const VerdictOutputSchema = z.object({
  score: z.number().min(0).max(10),
  scoreReason: z.string().min(5),
  targetUser: z.string().min(5),
  biggestRisk: z.string().min(5),
  competitors: z.array(z.string()).min(2).max(3),
  tenXSuggestion: z.string().min(5),
});

export type VerdictOutput = z.infer<typeof VerdictOutputSchema>;

const STANDARD_SYSTEM_INSTRUCTION = `You are an elite, brutally honest startup and venture reviewer (in the style of a discerning Y Combinator partner).
Your sole purpose is to evaluate the build-worthiness of startup ideas.
You cut through founder delusions, hype, and generic praise with razor-sharp critique, rigorous scrutiny, and tactical clarity.

Evaluation Guidelines:
1. "score": A float or integer from 0.0 to 10.0 reflecting realistic build-worthiness and venture/market potential. Be demanding: mediocre ideas should get 3-5, bad ideas 0-3, truly compelling wedges 7-9.
2. "scoreReason": Exactly one concise, punchy sentence explaining the rationale behind the score.
3. "targetUser": A sharply defined, specific niche or persona with an urgent, hair-on-fire problem. NEVER use "everyone", "general public", "any company", or broad vague segments.
4. "biggestRisk": The single fatal flaw, distribution trap, platform dependency, or adoption barrier that is most likely to kill this startup.
5. "competitors": An array of exactly 2 to 3 real-world competitors, existing incumbents, or current workarounds (e.g. "Excel / Notion", "Specific Tool Name").
6. "tenXSuggestion": Exactly one sharp, actionable wedge or unlock that would make this solution 10x better and give it an unfair advantage.

Output Rules:
- Return strictly valid JSON adhering to the provided schema.
- No markdown wrappers, no formatting outside the JSON object, no fluff or cheerleading.`;

const ROAST_SYSTEM_INSTRUCTION = `You are a notoriously witty, sharp-tongued, and delightfully savage venture reviewer (in the style of an exasperated senior VC partner who has seen 10,000 pitch decks and has zero patience for founder delusions).
Your goal is to ROAST THE IDEA with surgical precision, memorable wit, and uncompromising truth.

Tone Rules:
- Roast the IDEA, not the founder personally. Never be abusive, hateful, or derogatory.
- Be hilarious yet deeply insightful, cutting, and analytically sound.
- Every roast must point to a legitimate market flaw, adoption friction, or founder blind spot.
- Use razor-sharp, memorable one-liners (e.g., "Your biggest problem isn't the competition. It's that nobody has a reason to switch", "A solution desperately in search of a problem").
- Deliver tough love: explain why it currently fails unit economics, distribution, or differentiation, but give a genuinely brilliant unlock in tenXSuggestion.

Evaluation Guidelines:
1. "score": A float or integer from 0.0 to 10.0 reflecting ruthless build-worthiness.
2. "scoreReason": Exactly one witty, stinging, and memorable one-liner capturing the core flaw of the idea.
3. "targetUser": The painfully narrow or reluctant persona who might actually touch this, or who the founder is falsely imagining. Never say "everyone".
4. "biggestRisk": The fatal reality check that will inevitably crush the idea if built as described.
5. "competitors": An array of 2 to 3 real-world competitors or brutal incumbent realities (e.g. "Google Docs and inertia", "A free Zapier template").
6. "tenXSuggestion": One sharp, high-leverage pivot that could actually resurrect this idea into a 10x business.

Output Rules:
- Return strictly valid JSON adhering to the provided schema.
- No markdown wrappers, no formatting outside the JSON object.`;

router.post("/analyze", async (req, res) => {
  try {
    // 1. Verify Clerk authentication
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({
        error: "Unauthorized. Please sign in to analyze your idea.",
      });
    }

    // 2. Validate input
    const parseResult = AnalyzeIdeaInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.errors.map((e) => e.message).join(", ");
      return res.status(400).json({ error: issues });
    }

    const { idea, roastMode } = parseResult.data;

    // 3. Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("GEMINI_API_KEY is not configured in backend environment.");
      return res.status(500).json({
        error: "AI service configuration error. Please contact support.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // 4. Select prompt instructions based on mode
    const systemInstruction = roastMode ? ROAST_SYSTEM_INSTRUCTION : STANDARD_SYSTEM_INSTRUCTION;
    const userPrompt = roastMode
      ? `Brutally roast this startup idea with surgical wit and give your verdict:\n\n"${idea}"`
      : `Interrogate this startup idea and generate your brutal verdict:\n\n"${idea}"`;

    // 5. Call Gemini with structured schema
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Build-worthiness score from 0.0 to 10.0",
            },
            scoreReason: {
              type: Type.STRING,
              description: "One-line honest reasoning for the score",
            },
            targetUser: {
              type: Type.STRING,
              description: "Specific target customer persona (never 'everyone')",
            },
            biggestRisk: {
              type: Type.STRING,
              description: "The single biggest failure point or market risk",
            },
            competitors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 2 to 3 real-world competitors or existing alternatives",
            },
            tenXSuggestion: {
              type: Type.STRING,
              description: "One sharp, actionable improvement to make it 10x better",
            },
          },
          required: [
            "score",
            "scoreReason",
            "targetUser",
            "biggestRisk",
            "competitors",
            "tenXSuggestion",
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      logger.error("Gemini returned empty response text.");
      return res.status(502).json({
        error: "Received an empty analysis from the AI service. Please try again.",
      });
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch (parseErr) {
      logger.error({ rawText, parseErr }, "Failed to parse Gemini JSON output.");
      return res.status(502).json({
        error: "Invalid response format received from AI model. Please retry.",
      });
    }

    const validatedVerdict = VerdictOutputSchema.safeParse(parsedJson);
    if (!validatedVerdict.success) {
      // If competitor count is slightly off (e.g. 4 or 1), normalize it gracefully
      if (typeof parsedJson === "object" && parsedJson !== null) {
        const p = parsedJson as Record<string, any>;
        const competitors = Array.isArray(p.competitors) && p.competitors.length >= 2
          ? p.competitors.slice(0, 3)
          : ["Existing Manual Processes", "Generic Spreadsheets"];
        const fixedVerdict = {
          score: typeof p.score === "number" ? Math.min(10, Math.max(0, p.score)) : 5.0,
          scoreReason: String(p.scoreReason || "Evaluation complete."),
          targetUser: String(p.targetUser || "Early niche adopters."),
          biggestRisk: String(p.biggestRisk || "Customer acquisition and distribution friction."),
          competitors,
          tenXSuggestion: String(p.tenXSuggestion || "Narrow down to an indispensable workflow."),
        };
        return res.json({ ...fixedVerdict, roastMode });
      }
      return res.status(502).json({
        error: "The verdict could not be structured properly. Please try again.",
      });
    }

    return res.json({ ...validatedVerdict.data, roastMode });
  } catch (err: any) {
    logger.error({ err: err?.message || err }, "Error in /api/verdict/analyze");
    return res.status(500).json({
      error: "An unexpected error occurred while analyzing your idea. Please try again.",
    });
  }
});

const ShareVerdictInputSchema = z.object({
  idea: z
    .string({ required_error: "Idea is required" })
    .trim()
    .min(10, "Idea must be at least 10 characters long.")
    .max(500, "Idea cannot exceed 500 characters."),
  verdict: z.object({
    score: z.number().min(0).max(10),
    scoreReason: z.string().min(1).max(500),
    targetUser: z.string().min(1).max(500),
    biggestRisk: z.string().min(1).max(500),
    competitors: z.array(z.string().min(1).max(200)).min(1).max(10),
    tenXSuggestion: z.string().min(1).max(500),
  }),
  roastMode: z.boolean().optional().default(false),
});

/**
 * POST /api/verdict/share
 * Protected endpoint to generate a shareable link for an existing verdict.
 * Does NOT re-invoke Gemini.
 */
router.post("/share", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({
        error: "Unauthorized. Please sign in to share a verdict.",
      });
    }

    const parseResult = ShareVerdictInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.errors.map((e) => e.message).join(", ");
      return res.status(400).json({ error: issues });
    }

    const { idea, verdict, roastMode } = parseResult.data;

    // Generate clean, unpredictable, URL-safe 10-char share ID
    const shareId = randomBytes(8).toString("base64url");

    const db = getDb();
    await db.insert(sharedVerdictsTable).values({
      id: shareId,
      idea,
      score: verdict.score,
      scoreReason: verdict.scoreReason,
      targetUser: verdict.targetUser,
      biggestRisk: verdict.biggestRisk,
      competitors: verdict.competitors,
      tenXSuggestion: verdict.tenXSuggestion,
      roastMode,
    });

    return res.status(201).json({
      shareId,
      url: `/share/${shareId}`,
    });
  } catch (err: any) {
    logger.error({ err: err?.message || err }, "Error in POST /api/verdict/share");
    if (err?.message?.includes("DATABASE_URL")) {
      return res.status(503).json({
        error: "Database storage is currently unavailable. Please verify DATABASE_URL is configured.",
      });
    }
    return res.status(500).json({
      error: "Failed to create shareable link. Please try again.",
    });
  }
});

/**
 * GET /api/verdict/share/:shareId
 * Public endpoint to read a shared verdict without authentication.
 * Returns only sanitized verdict content (no Clerk user data, no tokens).
 */
router.get("/share/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    if (!shareId || typeof shareId !== "string" || shareId.length > 64) {
      return res.status(400).json({ error: "Invalid share ID format." });
    }

    const db = getDb();
    const records = await db
      .select({
        id: sharedVerdictsTable.id,
        idea: sharedVerdictsTable.idea,
        score: sharedVerdictsTable.score,
        scoreReason: sharedVerdictsTable.scoreReason,
        targetUser: sharedVerdictsTable.targetUser,
        biggestRisk: sharedVerdictsTable.biggestRisk,
        competitors: sharedVerdictsTable.competitors,
        tenXSuggestion: sharedVerdictsTable.tenXSuggestion,
        roastMode: sharedVerdictsTable.roastMode,
        createdAt: sharedVerdictsTable.createdAt,
      })
      .from(sharedVerdictsTable)
      .where(eq(sharedVerdictsTable.id, shareId))
      .limit(1);

    if (!records || records.length === 0) {
      return res.status(404).json({ error: "Verdict not found." });
    }

    return res.json(records[0]);
  } catch (err: any) {
    logger.error({ err: err?.message || err }, "Error in GET /api/verdict/share/:shareId");
    if (err?.message?.includes("DATABASE_URL")) {
      return res.status(503).json({
        error: "Database storage is currently unavailable. Please verify DATABASE_URL is configured.",
      });
    }
    return res.status(500).json({
      error: "An error occurred while retrieving the shared verdict.",
    });
  }
});

export default router;
