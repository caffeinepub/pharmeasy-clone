import React, { useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchProducts, useGetAllCategories } from '../hooks/useQueries';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';

export default function MedicineSearch() {
  const searchParams = useSearch({ from: '/medicines' });
  const initialQuery = (searchParams as Record<string, string>).q || '';
  const initialCategory = (searchParams as Record<string, string>).category || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [requiresPrescription, setRequiresPrescription] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const { data: categories } = useGetAllCategories();

  const { data: products, isLoading } = useSearchProducts(
    debouncedSearch,
    category || null,
    priceRange[0] > 0 ? BigInt(priceRange[0]) : null,
    priceRange[1] < 2000 ? BigInt(priceRange[1]) : null,
    null,
    requiresPrescription,
    sortBy
  );

  useEffect(() => {
    setSearchTerm(initialQuery);
    setCategory(initialCategory);
  }, [initialQuery, initialCategory]);

  const clearFilters = () => {
    setCategory('');
    setPriceRange([0, 2000]);
    setRequiresPrescription(null);
    setSortBy(null);
  };

  const hasActiveFilters = !!(category || priceRange[0] > 0 || priceRange[1] < 2000 || requiresPrescription !== null);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => setCategory('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'}`}
          >
            All Categories
          </button>
          {categories?.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Price Range</h4>
        <Slider
          min={0}
          max={2000}
          step={50}
          value={priceRange}
          onValueChange={(val) => setPriceRange(val as [number, number])}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Prescription */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Prescription</h4>
        <div className="space-y-2">
          {[
            { label: 'All', value: null },
            { label: 'Requires Prescription', value: true },
            { label: 'OTC (No Prescription)', value: false },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setRequiresPrescription(opt.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${requiresPrescription === opt.value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" className="w-full rounded-pill" onClick={clearFilters}>
          <X className="w-3.5 h-3.5 mr-1.5" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search medicines, health products..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm('')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {/* Sort */}
          <Select value={sortBy || 'default'} onValueChange={v => setSortBy(v === 'default' ? null : v)}>
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="priceLowHigh">Price: Low to High</SelectItem>
              <SelectItem value="priceHighLow">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filter */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden rounded-xl gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="pharma-card p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Searching...' : `${products?.length || 0} products found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="pharma-card p-3">
                  <Skeleton className="h-40 w-full rounded-xl mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-8 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-semibold text-foreground mb-1">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-4 rounded-pill" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
