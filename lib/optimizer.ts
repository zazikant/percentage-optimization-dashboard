import type {
  DifficultyBreakdown,
  OptimizationStrategy,
  OptimizeRequest,
} from "./types";

const ZERO_COUNTS: DifficultyBreakdown = { easy: 0, medium: 0, hard: 0 };

function clampNonNegativeInt(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function sumCounts(c: DifficultyBreakdown): number {
  return c.easy + c.medium + c.hard;
}

function formatPercentages(c: DifficultyBreakdown): string {
  if (sumCounts(c) === 0) return "0% / 0% / 0%";
  const total = sumCounts(c);
  const e = Math.round((c.easy / total) * 100);
  const m = Math.round((c.medium / total) * 100);
  const h = 100 - e - m;
  return `${e}% / ${m}% / ${h}%`;
}

function withinAvailability(c: DifficultyBreakdown, a: DifficultyBreakdown): boolean {
  return (
    c.easy <= a.easy && c.medium <= a.medium && c.hard <= a.hard
  );
}

function pickLowerTotal(
  pct: { easy: number; medium: number; hard: number },
  available: DifficultyBreakdown,
  cap: number,
): { total: number; counts: DifficultyBreakdown } | null {
  for (let t = cap; t >= 1; t--) {
    const e = (t * pct.easy) / 100;
    const m = (t * pct.medium) / 100;
    const h = (t * pct.hard) / 100;
    if (
      Number.isInteger(e) &&
      Number.isInteger(m) &&
      Number.isInteger(h)
    ) {
      const counts = { easy: e, medium: m, hard: h };
      if (withinAvailability(counts, available)) {
        return { total: t, counts };
      }
    }
  }
  return null;
}

function roundToMultiple(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function strategy(
  name: string,
  counts: DifficultyBreakdown,
  notes: string,
): OptimizationStrategy {
  const total = sumCounts(counts);
  return {
    strategyName: name,
    totalItems: total,
    counts,
    finalPercentages: formatPercentages(counts),
    notes,
  };
}

export function optimize(req: OptimizeRequest): OptimizationStrategy[] {
  const available: DifficultyBreakdown = {
    easy: clampNonNegativeInt(req.easyAvailable),
    medium: clampNonNegativeInt(req.mediumAvailable),
    hard: clampNonNegativeInt(req.hardAvailable),
  };
  const sumAvailable = sumCounts(available);
  const totalTarget = clampNonNegativeInt(req.totalTarget);

  const desiredRaw = {
    easy: clampNonNegativeInt(req.desiredEasyPct),
    medium: clampNonNegativeInt(req.desiredMediumPct),
    hard: clampNonNegativeInt(req.desiredHardPct),
  };
  const desiredSum = desiredRaw.easy + desiredRaw.medium + desiredRaw.hard;
  const desired =
    desiredSum === 0
      ? { easy: 34, medium: 54, hard: 12 }
      : {
          easy: (desiredRaw.easy / desiredSum) * 100,
          medium: (desiredRaw.medium / desiredSum) * 100,
          hard: (desiredRaw.hard / desiredSum) * 100,
        };

  const cap = Math.max(1, Math.min(sumAvailable, totalTarget || sumAvailable));

  // ---- Option 1: Keep All Items ----
  const opt1Counts: DifficultyBreakdown =
    sumAvailable > 0 ? { ...available } : { ...ZERO_COUNTS };

  // ---- Option 2: Perfect Fit (Max Items) ----
  let opt2Counts: DifficultyBreakdown = { ...ZERO_COUNTS };
  let opt2Total = 0;
  const perfect = pickLowerTotal(desired, available, cap);
  if (perfect) {
    opt2Counts = perfect.counts;
    opt2Total = perfect.total;
  } else {
    const approxCap = cap;
    let best: { total: number; counts: DifficultyBreakdown; err: number } | null = null;
    for (let t = approxCap; t >= 1; t--) {
      const ce = Math.round((t * desired.easy) / 100);
      const cm = Math.round((t * desired.medium) / 100);
      const ch = t - ce - cm;
      if (ch < 0) continue;
      const counts = { easy: ce, medium: cm, hard: ch };
      if (!withinAvailability(counts, available)) continue;
      const err =
        Math.abs(ce / t - desired.easy / 100) +
        Math.abs(cm / t - desired.medium / 100) +
        Math.abs(ch / t - desired.hard / 100);
      if (!best || err < best.err) {
        best = { total: t, counts, err };
      }
    }
    if (best) {
      opt2Counts = best.counts;
      opt2Total = best.total;
    }
  }

  // ---- Option 3: Alternative Fit (Prioritize Easy) ----
  let opt3Counts: DifficultyBreakdown = { ...ZERO_COUNTS };
  const easyUsed3 = Math.min(available.easy, cap);
  const remaining3 = Math.max(0, cap - easyUsed3);
  const medHardTotal3 = available.medium + available.hard;
  if (medHardTotal3 > 0 && remaining3 > 0) {
    const medShare =
      desired.medium + desired.hard > 0
        ? desired.medium / (desired.medium + desired.hard)
        : available.medium / medHardTotal3;
    let med = Math.min(available.medium, Math.round(remaining3 * medShare));
    let hard = remaining3 - med;
    if (hard > available.hard) {
      hard = available.hard;
      med = remaining3 - hard;
    }
    if (med < 0) med = 0;
    if (hard < 0) hard = 0;
    opt3Counts = { easy: easyUsed3, medium: med, hard };
  } else {
    opt3Counts = { easy: easyUsed3, medium: 0, hard: 0 };
  }

  // ---- Option 4: Clean Milestone Numbers ----
  let opt4Counts: DifficultyBreakdown = { ...ZERO_COUNTS };
  const cleanPcts = {
    easy: roundToMultiple(desired.easy, 5),
    medium: roundToMultiple(desired.medium, 5),
    hard: roundToMultiple(desired.hard, 5),
  };
  let cleanSum = cleanPcts.easy + cleanPcts.medium + cleanPcts.hard;
  if (cleanSum !== 100) {
    cleanPcts.hard += 100 - cleanSum;
    cleanSum = 100;
  }
  const clean = pickLowerTotal(cleanPcts, available, cap);
  if (clean) {
    opt4Counts = clean.counts;
  } else {
    const altPcts = {
      easy: roundToMultiple(desired.easy, 10),
      medium: roundToMultiple(desired.medium, 10),
      hard: roundToMultiple(desired.hard, 10),
    };
    let altSum = altPcts.easy + altPcts.medium + altPcts.hard;
    if (altSum !== 100) {
      altPcts.hard += 100 - altSum;
      altSum = 100;
    }
    const alt = pickLowerTotal(altPcts, available, cap);
    if (alt) {
      opt4Counts = alt.counts;
    } else {
      opt4Counts = { ...ZERO_COUNTS };
    }
  }

  const opt1 = strategy(
    "Option 1: Keep All Items",
    opt1Counts,
    sumAvailable > totalTarget && totalTarget > 0
      ? `Best if you cannot drop items. Uses all ${sumAvailable} available; exceeds your target by ${sumAvailable - totalTarget}.`
      : "Best if you cannot drop items. Percentages are rounded to equal 100%.",
  );

  const opt2 = strategy(
    "Option 2: Perfect Fit (Max Items)",
    opt2Counts,
    opt2Total > 0
      ? `Drops ${Math.max(0, sumAvailable - opt2Total)} items and matches desired percentages exactly.`
      : "No integer fit found within available pool.",
  );

  const opt3 = strategy(
    "Option 3: Alternative Fit",
    opt3Counts,
    `Keeps all your easy items (${opt3Counts.easy}). Medium/Hard split follows the desired medium:hard ratio.`,
  );

  const opt4 = strategy(
    "Option 4: Clean Round Numbers",
    opt4Counts,
    sumCounts(opt4Counts) > 0
      ? `Aesthetic milestone percentages (multiples of 5). Closest to your desired split.`
      : "No clean-percent fit found within available pool.",
  );

  return [opt1, opt2, opt3, opt4];
}
