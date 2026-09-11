"use client";

import { useState } from "react";
import InputForm from "@/components/InputForm";
import ComparisonTable from "@/components/ComparisonTable";
import type { OptimizeResponse } from "@/lib/types";

const EMPTY_RESULT: OptimizeResponse = {
  strategies: [],
  meta: {
    desiredPercentages: { easy: 0, medium: 0, hard: 0 },
    available: { easy: 0, medium: 0, hard: 0 },
    totalTarget: 0,
    sumAvailable: 0,
  },
};

export default function HomePage() {
  const [result, setResult] = useState<OptimizeResponse>(EMPTY_RESULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasResult, setHasResult] = useState(false);

  function handleResult(r: OptimizeResponse) {
    setResult(r);
    setHasResult(true);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Difficulty Distribution Optimizer
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl">
          Percentage Optimization Dashboard
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Tell the dashboard how many questions of each difficulty you have on
          hand, how many you want to administer, and the difficulty mix you
          want. It computes four strategies — Keep All, Perfect Fit, Alternative
          Fit, and Clean Round Numbers — and shows them in one comparison table
          so you can pick the best trade-off.
        </p>
      </header>

      <div className="space-y-8">
        <InputForm
          onResult={handleResult}
          loading={loading}
          setLoading={setLoading}
          onError={setError}
        />

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {error}
          </div>
        ) : null}

        {hasResult ? (
          <ComparisonTable
            strategies={result.strategies}
            desiredPercentages={result.meta.desiredPercentages}
            available={result.meta.available}
            totalTarget={result.meta.totalTarget}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Built with Next.js 15 + TypeScript + Tailwind CSS. Pure algorithmic
        optimizer — see <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">lib/optimizer.ts</code>.
      </footer>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
      Submit the form to see your four distribution strategies.
    </div>
  );
}
