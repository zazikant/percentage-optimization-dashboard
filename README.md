# Percentage Optimization Dashboard

Vercel-ready Next.js 15 + TypeScript app. Given:

- **Available counts** — easy / medium / hard questions on hand
- **Desired %** — target difficulty mix

It computes four strategies. `totalTarget = easyAvailable + mediumAvailable + hardAvailable` (derived, not input).

## The four strategies

| # | Strategy | Algorithm |
|---|----------|-----------|
| 1 | **Keep All Items** | `counts = available`, percentages rounded to sum 100. |
| 2 | **Perfect Fit (Max Items)** | Largest `T <= sumAvailable` with any integer-percentage split; tie-break by closeness to desired. |
| 3 | **Alternative Perfect Fit** | Same as 2 but `counts.easy = available.easy`. |
| 4 | **Clean Round Numbers** | Same as 2 but percentages must be multiples of 5. |

Every row satisfies `easy + medium + hard === totalItems` and percentages sum to exactly 100.

## API

```
POST /api/optimize
Content-Type: application/json

{
  "easyAvailable":    27,
  "mediumAvailable":  43,
  "hardAvailable":    10,
  "desiredEasyPct":   34,
  "desiredMediumPct": 54,
  "desiredHardPct":   12
}
```

Returns:

```json
{
  "strategies": [
    { "strategyName": "...", "totalItems": 80, "counts": {...}, "finalPercentages": "34% / 54% / 12%" },
    ...
  ],
  "meta": {
    "desiredPercentages": { "easy": 34, "medium": 54, "hard": 12 },
    "available": { "easy": 27, "medium": 43, "hard": 10 },
    "totalTarget": 80
  }
}
```

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
```

## Deploy on Vercel

Import this repo in the Vercel dashboard. No environment variables required.

## File map

```
app/
  layout.tsx
  page.tsx
  globals.css
  api/optimize/route.ts
components/
  InputForm.tsx
  ComparisonTable.tsx
lib/
  types.ts
  optimizer.ts
```
