export interface DifficultyBreakdown {
  easy: number;
  medium: number;
  hard: number;
}

export interface OptimizationStrategy {
  strategyName: string;
  totalItems: number;
  counts: DifficultyBreakdown;
  finalPercentages: string;
  notes: string;
}

export interface OptimizeRequest {
  easyAvailable: number;
  mediumAvailable: number;
  hardAvailable: number;
  totalTarget: number;
  desiredEasyPct: number;
  desiredMediumPct: number;
  desiredHardPct: number;
}

export interface OptimizeResponse {
  strategies: OptimizationStrategy[];
  meta: {
    desiredPercentages: { easy: number; medium: number; hard: number };
    available: DifficultyBreakdown;
    totalTarget: number;
    sumAvailable: number;
  };
}
