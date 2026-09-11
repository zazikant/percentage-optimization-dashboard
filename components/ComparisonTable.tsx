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
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-black">
            Comparison of best options
          </h2>
          <p className="mt-1 text-xs text-black/70">
            easy + medium + hard = totalItems, percentages sum to 100
          </p>
        </div>
        <dl className="flex gap-3 text-right">
          <Stat label="Total" value={String(totalTarget)} />
          <Stat
            label="Available"
            value={`${available.easy}/${available.medium}/${available.hard}`}
          />
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
              <Th align="center">Total</Th>
              <Th align="center">Easy</Th>
              <Th align="center">Medium</Th>
              <Th align="center">Hard</Th>
              <Th>Final %</Th>
              <Th>Valid</Th>
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
                  <Td align="center">{s.counts.easy}</Td>
                  <Td align="center">{s.counts.medium}</Td>
                  <Td align="center">{s.counts.hard}</Td>
                  <Td>
                    <span className="font-mono text-base font-bold text-black">
                      {s.finalPercentages}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={
                        "border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider " +
                        (valid
                          ? "border-black bg-black text-white"
                          : "border-black bg-white text-black")
                      }
                    >
                      {valid ? "OK" : "FAIL"}
                    </span>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black bg-white px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-black">
        {label}
      </dt>
      <dd className="font-mono text-base font-bold text-black">{value}</dd>
    </div>
  );
}
