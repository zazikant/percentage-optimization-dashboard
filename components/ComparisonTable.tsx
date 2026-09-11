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
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-black">
            Comparison of best options
          </h2>
          <p className="mt-1 text-xs text-black/70">
            Four strategies computed from your inputs. Every row satisfies
            easy + medium + hard = total items and percentages sum to exactly 100.
          </p>
        </div>
        <dl className="flex gap-6 text-right">
          <Stat label="Target" value={String(totalTarget)} />
          <Stat label="Available" value={String(sumAvailable)} />
          <Stat
            label="Desired"
            value={`${desiredPercentages.easy}/${desiredPercentages.medium}/${desiredPercentages.hard}`}
          />
        </dl>
      </header>

      <div className="overflow-x-auto border border-black bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black text-xs uppercase tracking-wide text-white">
            <tr>
              <Th>Strategy</Th>
              <Th align="center">Total items</Th>
              <Th align="center">Easy</Th>
              <Th align="center">Medium</Th>
              <Th align="center">Hard</Th>
              <Th>Final percentages</Th>
              <Th>Notes</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/20">
            {strategies.map((s) => {
              const sum = sumCounts(s.counts);
              const valid = sum === s.totalItems && sum > 0;
              return (
                <tr key={s.strategyName} className="bg-white">
                  <Td>
                    <span className="font-bold uppercase tracking-wide text-black">
                      {s.strategyName}
                    </span>
                  </Td>
                  <Td align="center">
                    <span className="text-lg font-bold text-black">
                      {s.totalItems}
                    </span>
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
                    <span className="font-mono text-base font-bold text-black">
                      {s.finalPercentages}
                    </span>
                  </Td>
                  <Td>
                    <p className="text-xs text-black">{s.notes}</p>
                    {!valid ? (
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-black">
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
      className={`px-4 py-3 font-bold uppercase tracking-wide ${
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
    <td className={`px-4 py-4 ${align === "center" ? "text-center" : "text-left"}`}>
      {children}
    </td>
  );
}

function Count({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span
      className={
        "text-base font-bold " + (over ? "underline decoration-2 underline-offset-4" : "")
      }
    >
      {value}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black bg-white px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-black">
        {label}
      </dt>
      <dd className="text-base font-bold text-black">{value}</dd>
    </div>
  );
}
