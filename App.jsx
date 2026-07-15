import React, { useState, useMemo, useCallback } from "react";
import {
  Cpu,
  Shirt,
  Footprints,
  Home as HomeIcon,
  BookOpen,
  RotateCcw,
  SlidersHorizontal,
  PackageX,
  Tag,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";

/* ============================================================================
   DESIGN TOKENS
   Palette: paper #F6F5F1 · ink #23262B · deep teal #0E5C56 (primary/actions)
            amber #E2A63B (price/rating accent) · line #E4E1D8
   Type: "Fraunces" (display, used sparingly for the app title) + "Manrope"
         (UI body/labels) + "IBM Plex Mono" (prices/counts, tabular data)
   ============================================================================ */

const FONT_IMPORTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
`;

/* ----------------------------------------------------------------------------
   1. DATA LAYER  — single source of truth for product inventory + filter config.
      (Open/Closed: adding a category or product never touches component code.)
---------------------------------------------------------------------------- */

const CATEGORY_CONFIG = [
  { id: "Electronics", icon: Cpu, swatch: "#0E5C56" },
  { id: "Apparel", icon: Shirt, swatch: "#B5563C" },
  { id: "Footwear", icon: Footprints, swatch: "#8A6D3B" },
  { id: "Home", icon: HomeIcon, swatch: "#5B6B8C" },
  { id: "Books", icon: BookOpen, swatch: "#7A5C8E" },
];

const PRICE_BOUNDS = { min: 0, max: 500 };

const PRODUCTS = [
  // Electronics
  { id: 1, name: "Wireless Earbuds Pro", category: "Electronics", price: 89, rating: 4.5 },
  { id: 2, name: "4K Action Camera", category: "Electronics", price: 249, rating: 4.2 },
  { id: 3, name: "Smart Fitness Band", category: "Electronics", price: 59, rating: 3.8 },
  { id: 4, name: "Mechanical Keyboard", category: "Electronics", price: 129, rating: 4.7 },
  { id: 5, name: "Portable SSD 1TB", category: "Electronics", price: 99, rating: 4.6 },
  { id: 6, name: "Noise Cancelling Headphones", category: "Electronics", price: 199, rating: 4.4 },
  { id: 7, name: "Budget Bluetooth Speaker", category: "Electronics", price: 25, rating: 3.1 },
  // Apparel
  { id: 8, name: "Cotton Crew T-Shirt", category: "Apparel", price: 18, rating: 4.0 },
  { id: 9, name: "Denim Jacket", category: "Apparel", price: 65, rating: 4.3 },
  { id: 10, name: "Wool Blend Sweater", category: "Apparel", price: 72, rating: 4.1 },
  { id: 11, name: "Linen Summer Shirt", category: "Apparel", price: 38, rating: 3.9 },
  { id: 12, name: "Puffer Vest", category: "Apparel", price: 84, rating: 4.5 },
  { id: 13, name: "Graphic Hoodie", category: "Apparel", price: 45, rating: 3.6 },
  { id: 14, name: "Clearance Tank Top", category: "Apparel", price: 9, rating: 2.4 },
  // Footwear
  { id: 15, name: "Running Sneakers", category: "Footwear", price: 95, rating: 4.6 },
  { id: 16, name: "Leather Chelsea Boots", category: "Footwear", price: 145, rating: 4.4 },
  { id: 17, name: "Canvas Slip-Ons", category: "Footwear", price: 42, rating: 3.7 },
  { id: 18, name: "Trail Hiking Shoes", category: "Footwear", price: 110, rating: 4.8 },
  { id: 19, name: "Classic Leather Loafers", category: "Footwear", price: 88, rating: 4.0 },
  { id: 20, name: "High-Top Sneakers", category: "Footwear", price: 68, rating: 3.4 },
  { id: 21, name: "Discount Flip-Flops", category: "Footwear", price: 12, rating: 2.8 },
  // Home
  { id: 22, name: "Ceramic Table Lamp", category: "Home", price: 54, rating: 4.2 },
  { id: 23, name: "Memory Foam Pillow", category: "Home", price: 29, rating: 4.0 },
  { id: 24, name: "Non-Stick Cookware Set", category: "Home", price: 119, rating: 4.5 },
  { id: 25, name: "Aroma Diffuser", category: "Home", price: 34, rating: 3.9 },
  { id: 26, name: "Cotton Bedsheet Set", category: "Home", price: 47, rating: 4.3 },
  { id: 27, name: "Minimalist Wall Clock", category: "Home", price: 22, rating: 3.5 },
  { id: 28, name: "Budget Storage Bin", category: "Home", price: 8, rating: 2.6 },
  // Books
  { id: 29, name: "The Silent Orchard", category: "Books", price: 16, rating: 4.4 },
  { id: 30, name: "Atomic Focus Guide", category: "Books", price: 14, rating: 4.7 },
  { id: 31, name: "Modern Web Design", category: "Books", price: 32, rating: 4.1 },
  { id: 32, name: "The Mind's Compass", category: "Books", price: 12, rating: 3.8 },
  { id: 33, name: "Culinary Journeys", category: "Books", price: 24, rating: 4.0 },
  { id: 34, name: "A History of Ideas", category: "Books", price: 19, rating: 3.3 },
];

/* ----------------------------------------------------------------------------
   2. FILTER STRATEGY LAYER (Single Responsibility + Dependency Inversion)
      Pure predicate functions know nothing about React or the UI; the hook
      composes them. Swapping/adding a filter rule never touches components.
---------------------------------------------------------------------------- */

const matchesCategory = (product, selectedCategories) =>
  selectedCategories.length === 0 || selectedCategories.includes(product.category);

const matchesPrice = (product, [lo, hi]) => product.price >= lo && product.price <= hi;

const matchesRating = (product, minRating) => minRating === 0 || product.rating >= minRating;

const DEFAULT_FILTERS = {
  categories: [],
  priceRange: [PRICE_BOUNDS.min, PRICE_BOUNDS.max],
  minRating: 0,
};

function useProductFilters(products, initialFilters = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState(initialFilters);

  const toggleCategory = useCallback((categoryId) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(categoryId);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== categoryId)
          : [...prev.categories, categoryId],
      };
    });
  }, []);

  const setPriceRange = useCallback((range) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
  }, []);

  const setMinRating = useCallback((rating) => {
    setFilters((prev) => ({ ...prev, minRating: prev.minRating === rating ? 0 : rating }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          matchesCategory(p, filters.categories) &&
          matchesPrice(p, filters.priceRange) &&
          matchesRating(p, filters.minRating)
      ),
    [products, filters]
  );

  // Category counts respect price + rating filters, but not the category
  // filter itself, so users can see what toggling a box would add.
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const cat of CATEGORY_CONFIG) {
      counts[cat.id] = products.filter(
        (p) =>
          p.category === cat.id &&
          matchesPrice(p, filters.priceRange) &&
          matchesRating(p, filters.minRating)
      ).length;
    }
    return counts;
  }, [products, filters.priceRange, filters.minRating]);

  const isDefault =
    filters.categories.length === 0 &&
    filters.priceRange[0] === PRICE_BOUNDS.min &&
    filters.priceRange[1] === PRICE_BOUNDS.max &&
    filters.minRating === 0;

  return {
    filters,
    filteredProducts,
    categoryCounts,
    toggleCategory,
    setPriceRange,
    setMinRating,
    resetFilters,
    isDefault,
  };
}

/* ----------------------------------------------------------------------------
   2b. CART LAYER (Single Responsibility)
       Cart state is entirely independent of filter state — adding an item
       never touches filters, and changing filters never touches the cart.
---------------------------------------------------------------------------- */

function useCart() {
  const [cart, setCart] = useState({}); // { [productId]: quantity }

  const addToCart = useCallback((productId) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  }, []);

  const incrementItem = useCallback((productId) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  }, []);

  const decrementItem = useCallback((productId) => {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[productId] ?? 0) - 1;
      if (qty <= 0) {
        delete next[productId];
      } else {
        next[productId] = qty;
      }
      return next;
    });
  }, []);

  const totalItems = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    [cart]
  );

  return { cart, addToCart, incrementItem, decrementItem, totalItems };
}

/* ----------------------------------------------------------------------------
   3. PRESENTATIONAL COMPONENTS (each owns one job — Interface Segregation)
---------------------------------------------------------------------------- */

function StarIcon({ color, size = 13, half = false }) {
  const clipId = `star-half-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {half && (
        <clipPath id={clipId}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      )}
      <path
        d="M12 2.5l2.95 6.28 6.8.66-5.13 4.86 1.45 6.98L12 17.9l-6.07 3.38 1.45-6.98L2.25 9.44l6.8-.66L12 2.5z"
        fill={color}
        clipPath={half ? `url(#${clipId})` : undefined}
      />
    </svg>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div className="border-b border-[#E4E1D8] pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#8A8676] mb-3.5 font-['Manrope']">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CategoryFilter({ selected, counts, onToggle }) {
  return (
    <ul className="space-y-1">
      {CATEGORY_CONFIG.map(({ id, icon: Icon, swatch }) => {
        const checked = selected.includes(id);
        const count = counts[id] ?? 0;
        return (
          <li key={id}>
            <label
              className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${
                checked ? "bg-[#0E5C56]/[0.07]" : "hover:bg-black/[0.03]"
              } ${count === 0 && !checked ? "opacity-40" : ""}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(id)}
                className="peer sr-only"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-all ${
                  checked ? "border-transparent" : "border-[#C9C5B8] bg-white"
                }`}
                style={checked ? { backgroundColor: swatch } : {}}
              >
                {checked && (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-white stroke-[2.4]">
                    <path d="M2.5 6.2 5 8.7 9.5 3.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <Icon size={15} strokeWidth={2} style={{ color: swatch }} className="shrink-0" />
              <span className="text-[13.5px] font-medium text-[#23262B] font-['Manrope'] flex-1">
                {id}
              </span>
              <span className="text-[11px] font-['IBM_Plex_Mono'] text-[#9C9787] tabular-nums">
                {count}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function PriceRangeSlider({ range, bounds, onChange }) {
  const [lo, hi] = range;
  const MIN_GAP = 5;

  const handleLoChange = (e) => {
    const value = Math.min(Number(e.target.value), hi - MIN_GAP);
    onChange([value, hi]);
  };
  const handleHiChange = (e) => {
    const value = Math.max(Number(e.target.value), lo + MIN_GAP);
    onChange([lo, value]);
  };

  const loPct = ((lo - bounds.min) / (bounds.max - bounds.min)) * 100;
  const hiPct = ((hi - bounds.min) / (bounds.max - bounds.min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-[#9C9787] font-['Manrope'] font-semibold">Min</span>
          <span className="text-[15px] font-['IBM_Plex_Mono'] text-[#23262B] tabular-nums">${lo}</span>
        </div>
        <div className="h-px w-4 bg-[#C9C5B8]" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wide text-[#9C9787] font-['Manrope'] font-semibold">Max</span>
          <span className="text-[15px] font-['IBM_Plex_Mono'] text-[#23262B] tabular-nums">${hi}</span>
        </div>
      </div>

      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-[#E4E1D8]" />
        <div
          className="absolute h-[3px] rounded-full bg-[#E2A63B]"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={lo}
          onChange={handleLoChange}
          className="dual-range"
          style={{ zIndex: lo > bounds.max - 30 ? 5 : 3 }}
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={hi}
          onChange={handleHiChange}
          className="dual-range"
          style={{ zIndex: 4 }}
          aria-label="Maximum price"
        />
      </div>
    </div>
  );
}

function RatingFilter({ selected, onSelect }) {
  return (
    <div className="space-y-1">
      {[5, 4, 3, 2, 1].map((stars) => {
        const checked = selected === stars;
        return (
          <label
            key={stars}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors ${
              checked ? "bg-[#E2A63B]/[0.12]" : "hover:bg-black/[0.03]"
            }`}
          >
            <input
              type="radio"
              name="minRating"
              checked={checked}
              onClick={() => onSelect(stars)}
              onChange={() => {}}
              className="sr-only"
            />
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                checked ? "border-[#E2A63B]" : "border-[#AFA994]"
              }`}
            >
              {checked && <span className="h-2 w-2 rounded-full bg-[#E2A63B]" />}
            </span>
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} size={13} color={i < stars ? "#E2A63B" : "#DEDACD"} />
              ))}
            </span>
            <span className="text-[12.5px] font-['Manrope'] text-[#6B6759] font-medium">& up</span>
          </label>
        );
      })}
    </div>
  );
}

function StarRating({ value }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;
          return (
            <span key={i} className="relative flex">
              <StarIcon size={13} color="#DEDACD" />
              {(filled || half) && (
                <span className="absolute inset-0">
                  <StarIcon size={13} color="#E2A63B" half={half} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className="text-[11.5px] font-['IBM_Plex_Mono'] text-[#8A8676] tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

function ProductCard({ product, quantity, onAdd, onIncrement, onDecrement }) {
  const catConfig = CATEGORY_CONFIG.find((c) => c.id === product.category);
  const Icon = catConfig?.icon ?? Tag;
  const swatch = catConfig?.swatch ?? "#8A8676";
  const inCart = quantity > 0;

  return (
    <div className="group rounded-2xl bg-white border border-[#E4E1D8] overflow-hidden transition-all hover:shadow-[0_8px_24px_-8px_rgba(35,38,43,0.16)] hover:-translate-y-0.5">
      <div
        className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(140deg, ${swatch}14, ${swatch}2A)` }}
      >
        <Icon size={38} strokeWidth={1.4} style={{ color: swatch }} />
        <span
          className="absolute top-2.5 left-2.5 text-[10px] font-semibold font-['Manrope'] tracking-wide px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: swatch }}
        >
          {product.category}
        </span>
      </div>
      <div className="p-3.5">
        <h4 className="text-[13.5px] font-semibold text-[#23262B] font-['Manrope'] leading-snug mb-1.5 line-clamp-2 min-h-[2.4em]">
          {product.name}
        </h4>
        <div className="flex items-center justify-between mt-2 mb-3">
          <span className="text-[16px] font-['IBM_Plex_Mono'] font-medium text-[#0E5C56] tabular-nums">
            ${product.price}
          </span>
          <StarRating value={product.rating} />
        </div>

        {inCart ? (
          <div className="flex items-center justify-between rounded-full border border-[#0E5C56]/30 bg-[#0E5C56]/[0.06] px-1 py-1">
            <button
              onClick={() => onDecrement(product.id)}
              aria-label="Remove one"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[#E4E1D8] text-[#23262B] hover:border-[#0E5C56] transition-colors"
            >
              <Minus size={13} strokeWidth={2.4} />
            </button>
            <span className="text-[13px] font-['IBM_Plex_Mono'] font-medium text-[#0E5C56] tabular-nums">
              {quantity} in cart
            </span>
            <button
              onClick={() => onIncrement(product.id)}
              aria-label="Add one more"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[#E4E1D8] text-[#23262B] hover:border-[#0E5C56] transition-colors"
            >
              <Plus size={13} strokeWidth={2.4} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(product.id)}
            className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#23262B] text-white text-[12.5px] font-semibold font-['Manrope'] py-2 hover:bg-[#0E5C56] transition-colors"
          >
            <ShoppingCart size={14} strokeWidth={2.2} />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border border-dashed border-[#D8D4C7] bg-white/60">
      <div className="h-14 w-14 rounded-full bg-[#F0EEE5] flex items-center justify-center mb-4">
        <PackageX size={26} strokeWidth={1.6} className="text-[#9C9787]" />
      </div>
      <p className="text-[15px] font-semibold font-['Manrope'] text-[#23262B] mb-1.5">
        No items match your criteria
      </p>
      <p className="text-[13px] text-[#8A8676] font-['Manrope'] mb-5 max-w-[280px]">
        Try widening the price range, clearing a category, or lowering the minimum rating.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-full bg-[#0E5C56] text-white text-[13px] font-semibold font-['Manrope'] px-4 py-2 hover:bg-[#0B4A45] transition-colors"
      >
        <RotateCcw size={14} strokeWidth={2.2} />
        Reset Filters
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   4. LAYOUT / COMPOSITION ROOT
      App wires the hook's output into presentational components. It contains
      no filtering logic of its own — that lives entirely in useProductFilters.
---------------------------------------------------------------------------- */

export default function ProductFilterApp() {
  const {
    filters,
    filteredProducts,
    categoryCounts,
    toggleCategory,
    setPriceRange,
    setMinRating,
    resetFilters,
    isDefault,
  } = useProductFilters(PRODUCTS);

  const { cart, addToCart, incrementItem, decrementItem, totalItems } = useCart();

  return (
    <div className="min-h-screen bg-[#F6F5F1]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        ${FONT_IMPORTS}
        .dual-range {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          background: transparent;
          appearance: none;
          -webkit-appearance: none;
          pointer-events: none;
        }
        .dual-range::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          pointer-events: auto;
          height: 16px;
          width: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2.5px solid #0E5C56;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
          cursor: pointer;
          margin-top: 0;
        }
        .dual-range::-moz-range-thumb {
          pointer-events: auto;
          height: 16px;
          width: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2.5px solid #0E5C56;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
          cursor: pointer;
        }
        .dual-range::-webkit-slider-runnable-track { background: transparent; }
        .dual-range::-moz-range-track { background: transparent; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <header className="border-b border-[#E4E1D8] bg-[#F6F5F1]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <h1
            className="text-[20px] sm:text-[22px] text-[#23262B] tracking-tight"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            Marketplace
          </h1>
          <div className="flex items-center gap-3.5">
            <span className="text-[12.5px] font-['IBM_Plex_Mono'] text-[#8A8676] tabular-nums">
              {filteredProducts.length} of {PRODUCTS.length} items
            </span>
            <div className="relative flex items-center justify-center h-9 w-9 rounded-full bg-white border border-[#E4E1D8]">
              <ShoppingCart size={16} strokeWidth={2} className="text-[#23262B]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-[18px] px-1 flex items-center justify-center rounded-full bg-[#B5563C] text-white text-[10px] font-bold font-['IBM_Plex_Mono'] leading-none">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[272px_1fr] gap-6 lg:gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[76px]">
            <div className="rounded-2xl border border-[#E4E1D8] bg-white p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} strokeWidth={2.2} className="text-[#23262B]" />
                  <span className="text-[13.5px] font-bold font-['Manrope'] text-[#23262B]">Filters</span>
                </div>
                {!isDefault && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-[11.5px] font-semibold font-['Manrope'] text-[#0E5C56] hover:text-[#0B4A45] transition-colors"
                  >
                    <RotateCcw size={11.5} strokeWidth={2.4} />
                    Reset
                  </button>
                )}
              </div>

              <SidebarSection title="Category">
                <CategoryFilter selected={filters.categories} counts={categoryCounts} onToggle={toggleCategory} />
              </SidebarSection>

              <SidebarSection title="Price Range">
                <PriceRangeSlider range={filters.priceRange} bounds={PRICE_BOUNDS} onChange={setPriceRange} />
              </SidebarSection>

              <SidebarSection title="Minimum Rating">
                <RatingFilter selected={filters.minRating} onSelect={setMinRating} />
              </SidebarSection>
            </div>
          </aside>

          {/* Product grid */}
          <section>
            {filteredProducts.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={cart[product.id] ?? 0}
                    onAdd={addToCart}
                    onIncrement={incrementItem}
                    onDecrement={decrementItem}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
