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
      className="grid grid-cols-1 gap-8 border border-black bg-white p-8 sm:grid-cols-2"
    >
      <Section title="Available pool (counts you have)">
        <Field
          label="Easy available"
          value={form.easyAvailable}
          onChange={(v) => update("easyAvailable", v)}
        />
        <Field
          label="Medium available"
          value={form.mediumAvailable}
          onChange={(v) => update("mediumAvailable", v)}
        />
        <Field
          label="Hard available"
          value={form.hardAvailable}
          onChange={(v) => update("hardAvailable", v)}
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
        />
        <Field
          label="Desired Medium %"
          value={form.desiredMediumPct}
          onChange={(v) => update("desiredMediumPct", v)}
        />
        <Field
          label="Desired Hard %"
          value={form.desiredHardPct}
          onChange={(v) => update("desiredHardPct", v)}
        />
      </Section>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-3 border-t border-black pt-6">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center border border-black bg-black px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Optimizing..." : "Optimize"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center border border-black bg-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-black hover:text-white"
        >
          Reset
        </button>
        <p className="text-xs text-black">
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
    <div className="space-y-4">
      <h2 className="border-b border-black pb-2 text-xs font-bold uppercase tracking-[0.2em] text-black">
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block border border-black bg-white p-3">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-black">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-2xl font-bold text-black outline-none placeholder:text-black/40"
      />
      {hint ? (
        <span className="mt-1 block text-[11px] text-black/70">{hint}</span>
      ) : null}
    </label>
  );
}
