import { NextResponse } from "next/server";
import { getTotalTarget, optimize } from "@/lib/optimizer";
import type {
  DifficultyBreakdown,
  OptimizeRequest,
  OptimizeResponse,
} from "@/lib/types";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function toInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return null;
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }
  if (!body || typeof body !== "object") {
    return badRequest("Request body must be a JSON object.");
  }
  const b = body as Record<string, unknown>;

  const easyAvailable = toInt(b.easyAvailable);
  const mediumAvailable = toInt(b.mediumAvailable);
  const hardAvailable = toInt(b.hardAvailable);
  const desiredEasyPct = toInt(b.desiredEasyPct);
  const desiredMediumPct = toInt(b.desiredMediumPct);
  const desiredHardPct = toInt(b.desiredHardPct);

  if (
    easyAvailable === null ||
    mediumAvailable === null ||
    hardAvailable === null ||
    desiredEasyPct === null ||
    desiredMediumPct === null ||
    desiredHardPct === null
  ) {
    return badRequest(
      "All inputs must be integers: easyAvailable, mediumAvailable, hardAvailable, desiredEasyPct, desiredMediumPct, desiredHardPct.",
    );
  }
  if (
    easyAvailable < 0 ||
    mediumAvailable < 0 ||
    hardAvailable < 0 ||
    desiredEasyPct < 0 ||
    desiredMediumPct < 0 ||
    desiredHardPct < 0
  ) {
    return badRequest("Numeric inputs must be non-negative.");
  }
  if (easyAvailable + mediumAvailable + hardAvailable === 0) {
    return badRequest("Available pool must contain at least one item.");
  }

  const optimizeReq: OptimizeRequest = {
    easyAvailable,
    mediumAvailable,
    hardAvailable,
    desiredEasyPct,
    desiredMediumPct,
    desiredHardPct,
  };

  const strategies = optimize(optimizeReq);
  const totalTarget = getTotalTarget(optimizeReq);
  const available: DifficultyBreakdown = {
    easy: easyAvailable,
    medium: mediumAvailable,
    hard: hardAvailable,
  };
  const desiredSum = desiredEasyPct + desiredMediumPct + desiredHardPct;
  const response: OptimizeResponse = {
    strategies,
    meta: {
      desiredPercentages: {
        easy:
          desiredSum === 0
            ? Math.round((easyAvailable / totalTarget) * 100)
            : Math.round((desiredEasyPct / desiredSum) * 100),
        medium:
          desiredSum === 0
            ? Math.round((mediumAvailable / totalTarget) * 100)
            : Math.round((desiredMediumPct / desiredSum) * 100),
        hard:
          desiredSum === 0
            ? Math.round((hardAvailable / totalTarget) * 100)
            : Math.round((desiredHardPct / desiredSum) * 100),
      },
      available,
      totalTarget,
    },
  };
  return NextResponse.json(response);
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message:
      "POST { easyAvailable, mediumAvailable, hardAvailable, desiredEasyPct, desiredMediumPct, desiredHardPct } to compute 4 distribution strategies.",
  });
}
