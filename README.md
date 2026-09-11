# Percentage Optimization Dashboard

A Vercel-ready TypeScript web app that helps you distribute a pool of questions across Easy / Medium / Hard difficulty so the final mix matches a desired percentage split.

Given:

- **Available counts** — how many Easy / Medium / Hard questions you have on hand
- **Total target** — how many questions you want to administer
- **Desired %** — your target difficulty mix

…it computes four strategies and shows them side by side in one comparison table.

## The four strategies

| # | Strategy | What it does |
|---|----------|-------------|
| 1 | **Keep All Items** | Use every available question. Percentages are rounded with the largest-remainder method so they sum to exactly 100. |
| 2 | **Perfect Fit (Max Items)** | Drop the minimum number of items needed so the final percentages exactly match the desired split. |
| 3 | **Alternative Fit** | Keep **all** Easy items intact, then distribute the remainder between Medium and Hard following the desired Medium:Hard ratio. |
| 4 | **Clean Round Numbers** | Round the desired percentages to the nearest multiples of 5, then find the largest total that satisfies them. Aesthetic milestone splits. |

Every row satisfies the two invariants:

- `counts.easy + counts.medium + counts.hard === totalItems`
- The three percentages sum to exactly 100.

## Stack

- **Next.js 15** (App Router, React Server Components where possible)
- **TypeScript** (strict mode)
- **Tailwind CSS 3**
- **Pure algorithmic optimizer** — no LLM calls

## API

```
POST /api/optimize
Content-Type: application/json

{
  "easyAvailable":   27,
  "mediumAvailable": 43,
  "hardAvailable":   10,
  "totalTarget":     80,
  "desiredEasyPct":  34,
  "desiredMediumPct":54,
  "desiredHardPct":  12
}
```

Returns:

```json
{
  "strategies": [
    { "strategyName": "...", "totalItems": 80, "counts": {...}, "finalPercentages": "34% / 54% / 12%", "notes": "..." },
    ...
  ],
  "meta": {
    "desiredPercentages": { "easy": 34, "medium": 54, "hard": 12 },
    "available": { "easy": 27, "medium": 43, "hard": 10 },
    "totalTarget": 80,
    "sumAvailable": 80
  }
}
```

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run typecheck
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import it in the [Vercel dashboard](https://vercel.com/new).
3. No environment variables required. The first deploy will be the production app.

## File map

```
app/
  layout.tsx              Root layout + metadata
  page.tsx                Client-side dashboard page
  globals.css             Tailwind + base styles
  api/optimize/route.ts   POST endpoint that runs the optimizer
components/
  InputForm.tsx           7-input form with validation
  ComparisonTable.tsx     Strategy comparison grid
lib/
  types.ts                DifficultyBreakdown, OptimizationStrategy, request/response
  optimizer.ts            Pure-TS 4-strategy optimizer
```

## License

MIT
