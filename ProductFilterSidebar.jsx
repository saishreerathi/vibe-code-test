import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Zap,
  Shirt,
  Footprints,
  Home as HomeIcon,
  BookOpen,
  Star,
  RotateCcw,
  PackageSearch,
  SlidersHorizontal,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { id: "Electronics", label: "Electronics", icon: Zap },
  { id: "Apparel", label: "Apparel", icon: Shirt },
  { id: "Footwear", label: "Footwear", icon: Footprints },
  { id: "Home", label: "Home", icon: HomeIcon },
  { id: "Books", label: "Books", icon: BookOpen },
];

const PRICE_MIN = 0;
const PRICE_MAX = 1300;

const PRODUCTS = [
  // Electronics
  { id: 1, name: "Wireless Earbuds Pro", category: "Electronics", price: 149, rating: 4.5, seed: "earbuds-1" },
  { id: 2, name: "4K Action Camera", category: "Electronics", price: 329, rating: 4.0, seed: "camera-2" },
  { id: 3, name: "Smart Watch Series 6", category: "Electronics", price: 259, rating: 4.5, seed: "watch-3" },
  { id: 4, name: "Bluetooth Speaker Mini", category: "Electronics", price: 79, rating: 3.5, seed: "speaker-4" },
  { id: 5, name: "Mechanical Keyboard TKL", category: "Electronics", price: 129, rating: 4.0, seed: "keyboard-5" },
  { id: 6, name: "Portable SSD 1TB", category: "Electronics", price: 99, rating: 5.0, seed: "ssd-6" },
  // Apparel
  { id: 7, name: "Merino Wool Sweater", category: "Apparel", price: 89, rating: 4.5, seed: "sweater-7" },
  { id: 8, name: "Raw Denim Jacket", category: "Apparel", price: 145, rating: 4.0, seed: "jacket-8" },
  { id: 9, name: "Linen Button-Up Shirt", category: "Apparel", price: 59, rating: 3.5, seed: "shirt-9" },
  { id: 10, name: "Quilted Puffer Vest", category: "Apparel", price: 110, rating: 4.0, seed: "vest-10" },
  { id: 11, name: "Heavyweight Graphic Tee", category: "Apparel", price: 29, rating: 3.0, seed: "tee-11" },
  { id: 12, name: "Wool Overcoat", category: "Apparel", price: 320, rating: 5.0, seed: "coat-12" },
  // Footwear
  { id: 13, name: "Trail Running Shoes", category: "Footwear", price: 119, rating: 4.5, seed: "trail-13" },
  { id: 14, name: "Leather Chelsea Boots", category: "Footwear", price: 195, rating: 4.5, seed: "chelsea-14" },
  { id: 15, name: "Canvas Low-Top Sneakers", category: "Footwear", price: 65, rating: 3.5, seed: "canvas-15" },
  { id: 16, name: "Waterproof Hiking Boots", category: "Footwear", price: 175, rating: 4.0, seed: "hiking-16" },
  { id: 17, name: "Slide Sandals", category: "Footwear", price: 35, rating: 3.0, seed: "slide-17" },
  { id: 18, name: "Suede Penny Loafers", category: "Footwear", price: 139, rating: 4.0, seed: "loafer-18" },
  // Home
  { id: 19, name: "Ceramic Pour-Over Set", category: "Home", price: 54, rating: 4.5, seed: "pourover-19" },
  { id: 20, name: "Linen Bedding Set", category: "Home", price: 165, rating: 4.5, seed: "bedding-20" },
  { id: 21, name: "Enameled Cast Iron Skillet", category: "Home", price: 89, rating: 5.0, seed: "skillet-21" },
  { id: 22, name: "Articulating Table Lamp", category: "Home", price: 75, rating: 4.0, seed: "lamp-22" },
  { id: 23, name: "Wool Throw Blanket", category: "Home", price: 68, rating: 4.0, seed: "throw-23" },
  { id: 24, name: "Hand-Blown Glass Vase Set", category: "Home", price: 47, rating: 3.5, seed: "vase-24" },
  // Books
  { id: 25, name: "The Design of Everyday Things", category: "Books", price: 18, rating: 4.5, seed: "book-25" },
  { id: 26, name: "Atomic Habits", category: "Books", price: 16, rating: 5.0, seed: "book-26" },
  { id: 27, name: "Dune", category: "Books", price: 14, rating: 4.5, seed: "book-27" },
  { id: 28, name: "A Brief History of Time", category: "Books", price: 15, rating: 4.0, seed: "book-28" },
  { id: 29, name: "The Silent Patient", category: "Books", price: 13, rating: 4.0, seed: "book-29" },
  { id: 30, name: "Sapiens", category: "Books", price: 20, rating: 4.5, seed: "book-30" },
  { id: 31, name: "Noise-Cancelling Headphones", category: "Electronics", price: 249, rating: 4.0, seed: "headphones-31" },
  { id: 32, name: "Ultralight Rain Shell", category: "Apparel", price: 210, rating: 3.5, seed: "shell-32" },
];

const IMG = (seed) => `https://picsum.photos/seed/${seed}/480/360`;

/* ------------------------------------------------------------------ */
/*  SMALL HELPERS                                                      */
/* ------------------------------------------------------------------ */

function StarRow({ value, size = 14 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fillPct =
      value >= i ? 100 : value >= i - 1 ? Math.round((value - (i - 1)) * 100) : 0;
    stars.push(
      <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
        <Star size={size} className="absolute inset-0 text-[#D8D3C5]" strokeWidth={1.75} />
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${fillPct}%` }}
        >
          <Star size={size} className="text-[#C1673D] fill-[#C1673D]" strokeWidth={1.75} />
        </span>
      </span>
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

/* ------------------------------------------------------------------ */
/*  SIDEBAR SUB-COMPONENTS                                             */
/* ------------------------------------------------------------------ */

function SidebarSection({ index, title, children }) {
  return (
    <div className="border-b border-[#E4E0D6] py-6 first:pt-0 last:border-b-0">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-mono text-[11px] text-[#A6A196] tracking-widest">
          {index}
        </span>
        <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-[#191B1F]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function CategoryFilter({ selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const active = selected.includes(cat.id);
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onToggle(cat.id)}
            aria-pressed={active}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#29565C] focus-visible:ring-offset-1 ${
              active
                ? "bg-[#29565C] border-[#29565C] text-[#F7F5EF]"
                : "bg-transparent border-[#D8D3C5] text-[#4A4842] hover:border-[#29565C] hover:text-[#29565C]"
            }`}
          >
            <Icon size={13} strokeWidth={2} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

function PriceRangeSlider({ min, max, value, onChange }) {
  const [minVal, maxVal] = value;
  const range = max - min;
  const leftPct = ((minVal - min) / range) * 100;
  const rightPct = ((maxVal - min) / range) * 100;

  const handleMin = (e) => {
    const v = Math.min(Number(e.target.value), maxVal - 1);
    onChange([v, maxVal]);
  };
  const handleMax = (e) => {
    const v = Math.max(Number(e.target.value), minVal + 1);
    onChange([minVal, v]);
  };

  return (
    <div>
      <style>{`
        .fn-range { -webkit-appearance: none; appearance: none; position: absolute; width: 100%; height: 4px; background: transparent; pointer-events: none; margin: 0; top: 0; }
        .fn-range::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; height: 16px; width: 16px; border-radius: 999px; background: #FAF8F3; border: 2.5px solid #29565C; cursor: pointer; margin-top: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
        .fn-range::-moz-range-thumb { pointer-events: auto; height: 16px; width: 16px; border-radius: 999px; background: #FAF8F3; border: 2.5px solid #29565C; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
        .fn-range::-webkit-slider-runnable-track { -webkit-appearance: none; height: 4px; background: transparent; }
        .fn-range::-moz-range-track { height: 4px; background: transparent; }
      `}</style>
      <div className="relative h-4 mb-1">
        <div className="absolute top-0 left-0 right-0 h-1 rounded-full bg-[#E4E0D6] mt-1.5" />
        <div
          className="absolute h-1 rounded-full bg-[#29565C] mt-1.5"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMin}
          className="fn-range"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMax}
          className="fn-range"
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="rounded-md border border-[#E4E0D6] bg-white px-2.5 py-1">
          <span className="font-mono text-[12px] text-[#191B1F]">${minVal}</span>
        </div>
        <span className="font-mono text-[11px] text-[#A6A196]">to</span>
        <div className="rounded-md border border-[#E4E0D6] bg-white px-2.5 py-1">
          <span className="font-mono text-[12px] text-[#191B1F]">${maxVal}</span>
        </div>
      </div>
    </div>
  );
}

function RatingFilter({ selected, onSelect }) {
  return (
    <div className="flex flex-col gap-1.5">
      {[5, 4, 3, 2, 1].map((r) => {
        const active = selected === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onSelect(active ? 0 : r)}
            aria-pressed={active}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#29565C] ${
              active ? "bg-[#EFEAE0]" : "hover:bg-[#F1EEE6]"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                active ? "border-[#29565C]" : "border-[#D8D3C5]"
              }`}
            >
              {active && <span className="h-1.5 w-1.5 rounded-full bg-[#29565C]" />}
            </span>
            <StarRow value={r} size={13} />
            <span className="font-mono text-[11.5px] text-[#6B6963]">&amp; up</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT GRID                                                       */
/* ------------------------------------------------------------------ */

function ProductCard({ product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-[#E4E0D6] bg-white transition-shadow duration-200 hover:shadow-[0_8px_24px_-8px_rgba(25,27,31,0.18)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F1EEE6]">
        <img
          src={IMG(product.seed)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#191B1F]/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#F7F5EF]">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="font-display text-[14.5px] font-semibold leading-snug text-[#191B1F]">
          {product.name}
        </h4>
        <div className="flex items-center gap-1.5">
          <StarRow value={product.rating} />
          <span className="font-mono text-[11px] text-[#8B8A85]">{product.rating.toFixed(1)}</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-mono text-[16px] font-semibold text-[#29565C]">
            ${product.price}
          </span>
          <button className="rounded-full border border-[#191B1F] px-3 py-1 font-mono text-[10.5px] uppercase tracking-wide text-[#191B1F] transition-colors hover:bg-[#191B1F] hover:text-[#F7F5EF]">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D8D3C5] bg-[#F1EEE6]/60 px-6 py-20 text-center">
      <PackageSearch size={40} strokeWidth={1.5} className="mb-4 text-[#A6A196]" />
      <h3 className="font-display text-lg font-semibold text-[#191B1F]">
        No items match your criteria
      </h3>
      <p className="mt-1.5 max-w-xs text-[13px] text-[#6B6963]">
        Try widening the price range, clearing a category, or lowering the minimum rating.
      </p>
      <button
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#29565C] px-5 py-2.5 font-mono text-[12px] uppercase tracking-wide text-[#F7F5EF] transition-colors hover:bg-[#1F4448]"
      >
        <RotateCcw size={14} />
        Reset Filters
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  APP                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [minRating, setMinRating] = useState(0);

  const toggleCategory = useCallback((id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategories([]);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setMinRating(0);
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const categoryOk =
        selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const priceOk = p.price >= priceRange[0] && p.price <= priceRange[1];
      const ratingOk = minRating === 0 || p.rating >= minRating;
      return categoryOk && priceOk && ratingOk;
    });
  }, [selectedCategories, priceRange, minRating]);

  const isDefault =
    selectedCategories.length === 0 &&
    priceRange[0] === PRICE_MIN &&
    priceRange[1] === PRICE_MAX &&
    minRating === 0;

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#191B1F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <header className="border-b border-[#E4E0D6] bg-[#FAF8F3]/90 px-6 py-5 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#A6A196]">
              Catalog
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight">FIELDNOTE</h1>
          </div>
          <span className="font-mono text-[11px] text-[#6B6963]">
            {filteredProducts.length} / {PRODUCTS.length} items
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[280px]">
            <div className="rounded-xl border border-[#E4E0D6] bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#29565C]" />
                  <span className="font-display text-[14px] font-semibold">Filters</span>
                </div>
                {!isDefault && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wide text-[#C1673D] hover:text-[#9C532F]"
                  >
                    <RotateCcw size={11} />
                    Reset
                  </button>
                )}
              </div>

              <SidebarSection index="01" title="Category">
                <CategoryFilter selected={selectedCategories} onToggle={toggleCategory} />
              </SidebarSection>

              <SidebarSection index="02" title="Price Range">
                <PriceRangeSlider
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  value={priceRange}
                  onChange={setPriceRange}
                />
              </SidebarSection>

              <SidebarSection index="03" title="Minimum Rating">
                <RatingFilter selected={minRating} onSelect={setMinRating} />
              </SidebarSection>
            </div>
          </aside>

          {/* Product grid */}
          <section className="min-w-0 flex-1">
            {filteredProducts.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
