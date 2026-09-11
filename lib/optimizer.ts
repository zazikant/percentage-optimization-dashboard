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

function deviation(
  counts: DifficultyBreakdown,
  total: number,
  desired: { easy: number; medium: number; hard: number },
): number {
  if (total === 0) return Infinity;
  const pe = (counts.easy / total) * 100;
  const pm = (counts.medium / total) * 100;
  const ph = (counts.hard / total) * 100;
  return (
    Math.abs(pe - desired.easy) +
    Math.abs(pm - desired.medium) +
    Math.abs(ph - desired.hard)
  );
}

interface Split {
  counts: DifficultyBreakdown;
  total: number;
  pct: { easy: number; medium: number; hard: number };
}

function enumerateSplits(
  T: number,
  available: DifficultyBreakdown,
  opts: {
    requireIntegerPct: boolean;
    requireCleanPct?: boolean;
    forceEasyCount?: number;
  },
): Split[] {
  const result: Split[] = [];
  const easyMax =
    opts.forceEasyCount !== undefined
      ? Math.min(available.easy, T, opts.forceEasyCount)
      : Math.min(available.easy, T);
  const easyMin =
    opts.forceEasyCount !== undefined ? Math.min(easyMax, opts.forceEasyCount) : 0;

  for (let e = easyMin; e <= easyMax; e++) {
    if (opts.requireIntegerPct && (e * 100) % T !== 0) continue;
    const remaining1 = T - e;
    const mediumMax = Math.min(available.medium, remaining1);
    for (let m = 0; m <= mediumMax; m++) {
      const h = remaining1 - m;
      if (h < 0 || h > available.hard) continue;
      if (opts.requireIntegerPct) {
        if ((m * 100) % T !== 0) continue;
        if ((h * 100) % T !== 0) continue;
      }
      const pe = (e * 100) / T;
      const pm = (m * 100) / T;
      const ph = (h * 100) / T;
      if (opts.requireCleanPct === true) {
        if (pe % 5 !== 0 || pm % 5 !== 0 || ph % 5 !== 0) continue;
      }
      result.push({
        counts: { easy: e, medium: m, hard: h },
        total: T,
        pct: { easy: pe, medium: pm, hard: ph },
      });
    }
  }
  return result;
}

function pickBest(
  splits: Split[],
  desired: { easy: number; medium: number; hard: number },
): Split | null {
  if (splits.length === 0) return null;
  const EPSILON = 1e-6;
  let best = splits[0];
  let bestErr = deviation(best.counts, best.total, desired);
  for (let i = 1; i < splits.length; i++) {
    const err = deviation(splits[i].counts, splits[i].total, desired);
    if (err + EPSILON < bestErr) {
      best = splits[i];
      bestErr = err;
    }
  }
  return best;
}

function findLargestTWithSplit(
  cap: number,
  available: DifficultyBreakdown,
  desired: { easy: number; medium: number; hard: number },
  opts: {
    requireIntegerPct: boolean;
    requireCleanPct?: boolean;
    forceEasyCount?: number;
  },
): Split | null {
  const minT =
    opts.forceEasyCount !== undefined ? opts.forceEasyCount : 1;
  for (let t = cap; t >= minT; t--) {
    const splits = enumerateSplits(t, available, opts);
    if (splits.length > 0) {
      const best = pickBest(splits, desired);
      if (best) return best;
    }
  }
  return null;
}

function strategy(
  name: string,
  counts: DifficultyBreakdown,
): OptimizationStrategy {
  return {
    strategyName: name,
    totalItems: sumCounts(counts),
    counts,
    finalPercentages: formatPercentages(counts),
  };
}

export function optimize(req: OptimizeRequest): OptimizationStrategy[] {
  const available: DifficultyBreakdown = {
    easy: clampNonNegativeInt(req.easyAvailable),
    medium: clampNonNegativeInt(req.mediumAvailable),
    hard: clampNonNegativeInt(req.hardAvailable),
  };
  const sumAvailable = sumCounts(available);
  const totalTarget = sumAvailable;

  const desiredRaw = {
    easy: clampNonNegativeInt(req.desiredEasyPct),
    medium: clampNonNegativeInt(req.desiredMediumPct),
    hard: clampNonNegativeInt(req.desiredHardPct),
  };
  const desiredSum = desiredRaw.easy + desiredRaw.medium + desiredRaw.hard;

  const natural =
    sumAvailable > 0
      ? {
          easy: (available.easy / sumAvailable) * 100,
          medium: (available.medium / sumAvailable) * 100,
          hard: (available.hard / sumAvailable) * 100,
        }
      : { easy: 0, medium: 0, hard: 0 };

  const desired =
    desiredSum === 0
      ? natural
      : {
          easy: (desiredRaw.easy / desiredSum) * 100,
          medium: (desiredRaw.medium / desiredSum) * 100,
          hard: (desiredRaw.hard / desiredSum) * 100,
        };

  const cap = Math.max(1, totalTarget);

  const opt1Counts: DifficultyBreakdown =
    sumAvailable > 0 ? { ...available } : { ...ZERO_COUNTS };

  const opt2 = findLargestTWithSplit(cap, available, desired, {
    requireIntegerPct: true,
  });
  const opt2Counts: DifficultyBreakdown = opt2
    ? { ...opt2.counts }
    : { ...ZERO_COUNTS };

  let opt3Counts: DifficultyBreakdown = { ...ZERO_COUNTS };
  if (available.easy > 0) {
    const opt3 = findLargestTWithSplit(cap, available, desired, {
      requireIntegerPct: true,
      forceEasyCount: available.easy,
    });
    if (opt3) {
      opt3Counts = { ...opt3.counts };
    } else {
      const mhRatio =
        desired.medium + desired.hard > 0
          ? desired.medium / (desired.medium + desired.hard)
          : available.medium / Math.max(1, available.medium + available.hard);
      const remaining3 = Math.max(
        0,
        cap - available.easy,
      );
      const m3 = Math.min(
        available.medium,
        Math.round(remaining3 * mhRatio),
      );
      const h3 = Math.max(0, Math.min(available.hard, remaining3 - m3));
      opt3Counts = { easy: available.easy, medium: m3, hard: h3 };
    }
  }

  const opt4 = findLargestTWithSplit(cap, available, desired, {
    requireIntegerPct: true,
    requireCleanPct: true,
  });
  const opt4Counts: DifficultyBreakdown = opt4
    ? { ...opt4.counts }
    : { ...ZERO_COUNTS };

  return [
    strategy("Option 1: Keep All Items", opt1Counts),
    strategy("Option 2: Perfect Fit (Max Items)", opt2Counts),
    strategy("Option 3: Alternative Perfect Fit", opt3Counts),
    strategy("Option 4: Clean Round Numbers", opt4Counts),
  ];
}

export function getTotalTarget(req: OptimizeRequest): number {
  return (
    clampNonNegativeInt(req.easyAvailable) +
    clampNonNegativeInt(req.mediumAvailable) +
    clampNonNegativeInt(req.hardAvailable)
  );
}
