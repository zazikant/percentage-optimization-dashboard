import type { OptimizationStrategy } from "@/lib/types";

interface ComparisonTableProps {
  strategies: OptimizationStrategy[];
  desiredPercentages: { easy: number; medium: number; hard: number };
  available: { easy: number; medium: number; hard: number };
  totalTarget: number;
}

function sumCounts(c: { easy: number; medium: number; hard: number }): number {
  return c.easy + c.medium + c.hard;
}

export default function ComparisonTable({
  strategies,
  desiredPercentages,
  available,
  totalTarget,
}: ComparisonTableProps) {
  const sumAvailable = sumCounts(available);

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Comparison of best options
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Four strategies computed from your inputs. Every row satisfies
            easy + medium + hard = total items and percentages sum to exactly 100.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-right text-xs">
          <Stat label="Target" value={String(totalTarget)} />
          <Stat label="Available" value={String(sumAvailable)} />
          <Stat label="Desired" value={`${desiredPercentages.easy}/${desiredPercentages.medium}/${desiredPercentages.hard}`} />
        </dl>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-300">
            <tr>
              <Th>Strategy</Th>
              <Th align="center">Total items</Th>
              <Th align="center">
                <span className="inline-flex items-center gap-1">
                  <Dot className="bg-easy" /> Easy
                </span>
              </Th>
              <Th align="center">
                <span className="inline-flex items-center gap-1">
                  <Dot className="bg-medium" /> Medium
                </span>
              </Th>
              <Th align="center">
                <span className="inline-flex items-center gap-1">
                  <Dot className="bg-hard" /> Hard
                </span>
              </Th>
              <Th>Final percentages</Th>
              <Th>Notes</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {strategies.map((s, idx) => {
              const sum = sumCounts(s.counts);
              const valid =
                sum === s.totalItems && sum > 0;
              return (
                <tr
                  key={s.strategyName}
                  className={
                    idx % 2 === 0
                      ? "bg-white dark:bg-slate-900"
                      : "bg-slate-50/50 dark:bg-slate-900/50"
                  }
                >
                  <Td>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {s.strategyName}
                    </span>
                  </Td>
                  <Td align="center">
                    <span className="font-semibold">{s.totalItems}</span>
                  </Td>
                  <Td align="center">
                    <Count value={s.counts.easy} max={available.easy} />
                  </Td>
                  <Td align="center">
                    <Count value={s.counts.medium} max={available.medium} />
                  </Td>
                  <Td align="center">
                    <Count value={s.counts.hard} max={available.hard} />
                  </Td>
                  <Td>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {s.finalPercentages}
                    </span>
                  </Td>
                  <Td>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {s.notes}
                    </p>
                    {!valid ? (
                      <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        No feasible distribution under these inputs.
                      </p>
                    ) : null}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-semibold ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <td className={`px-4 py-3 ${align === "center" ? "text-center" : "text-left"}`}>
      {children}
    </td>
  );
}

function Count({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span
      className={
        over
          ? "font-semibold text-amber-600 dark:text-amber-400"
          : "font-semibold text-slate-800 dark:text-slate-200"
      }
    >
      {value}
    </span>
  );
}

function Dot({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 rounded-full ${className}`}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </dd>
    </div>
  );
}
