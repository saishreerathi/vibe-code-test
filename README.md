# FIELDNOTE — E-Commerce Product Multi-Filter Sidebar

A responsive product browsing interface built with **React (Vite)** and **Tailwind CSS**, featuring a sticky multi-filter sidebar and a real-time, instantly-updating product grid. No "Apply" button — every filter change re-renders the catalog immediately.


## Features

- **Category filter** — multi-select checklist (Electronics, Apparel, Footwear, Home, Books)
- **Price range filter** — custom dual-handle slider with synced numeric display
- **Rating filter** — "N stars & up" single-select, click-to-deselect back to "all ratings"
- **Instant filtering** — all three filters combine with AND logic via `useMemo`, no submit step
- **Empty state** — "No items match your criteria" with a one-click Reset Filters button
- **Responsive layout** — sticky sidebar on desktop, single-column stacked layout on mobile
- **32-item mock inventory** spanning all five categories with varying price and rating

## Tech Stack

| Layer      | Choice                          |
|------------|----------------------------------|
| Framework  | React 18 (Vite)                 |
| Styling    | Tailwind CSS                     |
| Icons      | [lucide-react](https://lucide.dev) |
| State      | React Hooks (`useState`, `useMemo`, `useCallback`) — no external state library |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn


## Project Structure

```
src/
├── App.jsx              # Main component: layout, state, filtering logic
├── main.jsx             # Vite entry point
├── index.css            # Tailwind directives
components/ (inlined in App.jsx, split out as needed)
├── SidebarSection        # Section wrapper (label + index)
├── CategoryFilter         # Multi-select category pills
├── PriceRangeSlider       # Dual-handle range slider
├── RatingFilter           # Star-rating radio group
├── ProductCard            # Individual product card
├── EmptyState             # No-results state with reset CTA
```




## Customization

- **Swap the mock data**: replace the `PRODUCTS` array in `App.jsx` with an API call (e.g. inside a `useEffect` + `useState`, or React Query) — the filtering `useMemo` works unchanged against any array shaped like `{ id, name, category, price, rating }`.
- **Add a filter**: add one more predicate inside the `useMemo` filter chain (e.g. `inStockOk`) and a matching sidebar control.
- **Theme**: colors, fonts, and spacing are set via Tailwind utility classes and a small `<style>` block for the slider thumb and font imports — adjust the hex values at the top of `App.jsx` to reskin.

## License

MIT — feel free to use this as a starting point for your own projects.
