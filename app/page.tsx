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
    <main className="mx-auto max-w-6xl bg-white px-6 py-12 sm:px-8 lg:px-10">
      <header className="mb-12 space-y-3 border-b border-black pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-black">
          Difficulty Distribution Optimizer
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
          Percentage Optimization Dashboard
        </h1>
        <p className="max-w-3xl text-sm text-black">
          Tell the dashboard how many questions of each difficulty you have on
          hand, how many you want to administer, and the difficulty mix you
          want. It computes four strategies — Keep All, Perfect Fit, Alternative
          Fit, and Clean Round Numbers — and shows them in one comparison table
          so you can pick the best trade-off.
        </p>
      </header>

      <div className="space-y-10">
        <InputForm
          onResult={handleResult}
          loading={loading}
          setLoading={setLoading}
          onError={setError}
        />

        {error ? (
          <div
            role="alert"
            className="border border-black bg-white p-4 text-sm font-bold uppercase tracking-wide text-black"
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

      <footer className="mt-16 border-t border-black pt-6 text-xs uppercase tracking-widest text-black">
        Built with Next.js 15 + TypeScript + Tailwind CSS. Pure algorithmic
        optimizer — see{" "}
        <code className="border border-black bg-white px-1 py-0.5">lib/optimizer.ts</code>.
      </footer>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-black bg-white p-12 text-center text-sm uppercase tracking-widest text-black">
      Submit the form to see your four distribution strategies.
    </div>
  );
}
