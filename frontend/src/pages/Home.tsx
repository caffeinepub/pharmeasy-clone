import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ChevronLeft, ChevronRight, ArrowRight, Pill, TestTube2,
  Heart, Leaf, Baby, ShieldCheck, Stethoscope, Zap
} from 'lucide-react';
import { useSearchProducts, useGetAllArticles, useSeedData } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

const HERO_SLIDES = [
  {
    id: 1,
    image: '/assets/generated/hero-banner.dim_1200x400.png',
    title: 'Your Health, Delivered',
    subtitle: 'Get medicines & health products at your doorstep',
    cta: 'Shop Now',
    ctaLink: '/medicines' as const,
    badge: 'Up to 25% OFF',
  },
  {
    id: 2,
    image: '/assets/generated/jd-health-packages-banner.dim_1200x400.png',
    title: 'Book Lab Tests at Home',
    subtitle: 'Certified labs, accurate results, 60% off on all packages',
    cta: 'Book Now',
    ctaLink: '/lab-tests' as const,
    badge: '60% OFF Lab Tests',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80',
    title: 'Expert Health Articles',
    subtitle: 'Stay informed with tips from certified doctors',
    cta: 'Read Articles',
    ctaLink: '/articles' as const,
    badge: 'Free Health Tips',
  },
];

const CATEGORIES = [
  { name: 'Medicines', icon: Pill, color: 'bg-primary/10 text-primary', to: '/medicines' as const, search: { q: '', category: '' } },
  { name: 'Lab Tests', icon: TestTube2, color: 'bg-pharma-blue/10 text-pharma-blue', to: '/lab-tests' as const },
  { name: 'Vitamins', icon: Zap, color: 'bg-pharma-orange/10 text-pharma-orange', to: '/medicines' as const, search: { q: '', category: 'Supplements' } },
  { name: 'Personal Care', icon: Heart, color: 'bg-pink-100 text-pink-600', to: '/medicines' as const, search: { q: '', category: 'Personal Care' } },
  { name: 'Ayurveda', icon: Leaf, color: 'bg-emerald-100 text-emerald-600', to: '/medicines' as const, search: { q: '', category: '' } },
  { name: 'Baby Care', icon: Baby, color: 'bg-purple-100 text-purple-600', to: '/medicines' as const, search: { q: '', category: "Children's Health" } },
  { name: 'Diabetes', icon: ShieldCheck, color: 'bg-red-100 text-red-600', to: '/medicines' as const, search: { q: '', category: 'Diabetes Care' } },
  { name: 'Devices', icon: Stethoscope, color: 'bg-cyan-100 text-cyan-600', to: '/medicines' as const, search: { q: '', category: 'Medical Devices' } },
];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { identity } = useInternetIdentity();
  const seedData = useSeedData();

  const { data: featuredProducts, isLoading: productsLoading } = useSearchProducts('', null, null, null, null, null, null);
  const { data: articles, isLoading: articlesLoading } = useGetAllArticles();

  // Auto-cycle hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSeedData = async () => {
    try {
      await seedData.mutateAsync();
    } catch (err) {
      console.error('Seed failed:', err);
    }
  };

  const handleHeroClick = (slide: typeof HERO_SLIDES[0]) => {
    if (slide.ctaLink === '/medicines') {
      navigate({ to: '/medicines', search: { q: '', category: '' } });
    } else if (slide.ctaLink === '/lab-tests') {
      navigate({ to: '/lab-tests' });
    } else if (slide.ctaLink === '/articles') {
      navigate({ to: '/articles' });
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Carousel */}
      <section className="relative overflow-hidden bg-pharma-surface">
        <div className="relative h-56 md:h-80 lg:h-96">
          {HERO_SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                  <span className="inline-block bg-pharma-orange text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {s.badge}
                  </span>
                  <h1 className="text-2xl md:text-4xl font-display font-bold text-white mb-2 max-w-md">
                    {s.title}
                  </h1>
                  <p className="text-white/80 text-sm md:text-base mb-4 max-w-sm">{s.subtitle}</p>
                  <Button
                    className="rounded-pill font-semibold bg-white text-primary hover:bg-white/90"
                    onClick={() => handleHeroClick(s)}
                  >
                    {s.cta} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Controls */}
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-all"
            onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-all"
            onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`rounded-full transition-all ${i === currentSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Seed Data Banner (for admin) */}
      {identity && featuredProducts?.length === 0 && (
        <div className="bg-pharma-orange/10 border-b border-pharma-orange/20 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="text-sm text-foreground">
              No products found. Seed sample data to get started.
            </p>
            <Button
              size="sm"
              className="rounded-pill"
              onClick={handleSeedData}
              disabled={seedData.isPending}
            >
              {seedData.isPending ? 'Seeding...' : 'Seed Data'}
            </Button>
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="font-display font-bold text-xl text-foreground mb-5">Shop by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={cat.to}
                search={'search' in cat ? cat.search : undefined}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:shadow-card transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-center text-foreground leading-tight">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Offer Banners */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary/15 to-pharma-green-light/30 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Flat 20% OFF</p>
              <p className="text-xs text-muted-foreground">On all prescription medicines</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-pharma-blue/10 to-blue-50 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-pharma-blue/20 rounded-xl flex items-center justify-center shrink-0">
              <TestTube2 className="w-6 h-6 text-pharma-blue" />
            </div>
            <div>
              <p className="font-bold text-foreground">60% OFF Lab Tests</p>
              <p className="text-xs text-muted-foreground">All packages & individual tests</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-pharma-orange/10 to-orange-50 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-pharma-orange/20 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-pharma-orange" />
            </div>
            <div>
              <p className="font-bold text-foreground">100% Genuine</p>
              <p className="text-xs text-muted-foreground">Certified & verified products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-foreground">Featured Products</h2>
          <Link to="/medicines" search={{ q: '', category: '' }} className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="pharma-card p-3">
                <Skeleton className="h-44 w-full rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredProducts.slice(0, 10).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No products available yet.</p>
          </div>
        )}
      </section>

      {/* Health Articles */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-foreground">Health Articles</h2>
          <Link to="/articles" className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="pharma-card p-4">
                <Skeleton className="h-40 w-full rounded-xl mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.slice(0, 3).map(article => (
              <Link key={article.id} to="/article/$id" params={{ id: article.id }} className="pharma-card group hover:shadow-card-hover transition-all">
                <div className="overflow-hidden">
                  <img
                    src={article.imageUrl && !article.imageUrl.includes('example.com')
                      ? article.imageUrl
                      : 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80'
                    }
                    alt={article.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{article.author}</span>
                    <span className="text-xs text-primary font-semibold flex items-center gap-1">
                      Read More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No articles available yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
