"use client";

import { useState } from "react";
import type { OptimizeResponse } from "@/lib/types";

interface FormState {
  easyAvailable: string;
  mediumAvailable: string;
  hardAvailable: string;
  totalTarget: string;
  desiredEasyPct: string;
  desiredMediumPct: string;
  desiredHardPct: string;
}

const DEFAULTS: FormState = {
  easyAvailable: "27",
  mediumAvailable: "43",
  hardAvailable: "10",
  totalTarget: "80",
  desiredEasyPct: "34",
  desiredMediumPct: "54",
  desiredHardPct: "12",
};

interface InputFormProps {
  onResult: (r: OptimizeResponse) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  onError: (msg: string) => void;
}

export default function InputForm({
  onResult,
  loading,
  setLoading,
  onError,
}: InputFormProps) {
  const [form, setForm] = useState<FormState>(DEFAULTS);

  function update(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError("");
    const numeric = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, Number(v)]),
    ) as Record<keyof FormState, number>;

    const sumPct =
      numeric.desiredEasyPct + numeric.desiredMediumPct + numeric.desiredHardPct;
    if (sumPct === 0) {
      onError("Desired percentages cannot all be zero.");
      return;
    }
    if (
      [numeric.easyAvailable, numeric.mediumAvailable, numeric.hardAvailable].some(
        (n) => !Number.isFinite(n) || n < 0,
      )
    ) {
      onError("Available counts must be non-negative integers.");
      return;
    }
    if (!Number.isFinite(numeric.totalTarget) || numeric.totalTarget < 1) {
      onError("Total target must be a positive integer.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(numeric),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? `Request failed with ${res.status}`);
      }
      const data = (await res.json()) as OptimizeResponse;
      onResult(data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm(DEFAULTS);
    onError("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2"
    >
      <Section title="Available pool (counts you have)">
        <Field
          label="Easy available"
          value={form.easyAvailable}
          onChange={(v) => update("easyAvailable", v)}
          accent="easy"
        />
        <Field
          label="Medium available"
          value={form.mediumAvailable}
          onChange={(v) => update("mediumAvailable", v)}
          accent="medium"
        />
        <Field
          label="Hard available"
          value={form.hardAvailable}
          onChange={(v) => update("hardAvailable", v)}
          accent="hard"
        />
      </Section>

      <Section title="Target distribution">
        <Field
          label="Total questions to administer"
          value={form.totalTarget}
          onChange={(v) => update("totalTarget", v)}
          hint="Cap on items used. Strategies never exceed this."
        />
        <Field
          label="Desired Easy %"
          value={form.desiredEasyPct}
          onChange={(v) => update("desiredEasyPct", v)}
          accent="easy"
        />
        <Field
          label="Desired Medium %"
          value={form.desiredMediumPct}
          onChange={(v) => update("desiredMediumPct", v)}
          accent="medium"
        />
        <Field
          label="Desired Hard %"
          value={form.desiredHardPct}
          onChange={(v) => update("desiredHardPct", v)}
          accent="hard"
        />
      </Section>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {loading ? "Optimizing..." : "Optimize"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Reset
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          All math runs in pure TypeScript. Nothing is sent to an LLM.
        </p>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  accent?: "easy" | "medium" | "hard";
}) {
  const accentBar = {
    easy: "before:bg-easy",
    medium: "before:bg-medium",
    hard: "before:bg-hard",
  }[accent ?? "easy"];

  return (
    <label
      className={`relative block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950 ${
        accent ? `before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r ${accentBar}` : ""
      }`}
    >
      <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
      />
      {hint ? (
        <span className="block text-[11px] text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
