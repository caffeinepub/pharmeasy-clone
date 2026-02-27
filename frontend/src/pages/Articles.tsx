import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, BookOpen, ArrowRight, Calendar, User } from 'lucide-react';
import { useGetAllArticles } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import type { Article } from '../backend';

const ARTICLE_IMAGES = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
];

function getArticleImage(article: Article, index: number): string {
  if (article.imageUrl && !article.imageUrl.includes('example.com')) {
    return article.imageUrl;
  }
  return ARTICLE_IMAGES[index % ARTICLE_IMAGES.length];
}

function formatDate(time: bigint): string {
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

export default function Articles() {
  const { data: articles, isLoading } = useGetAllArticles();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = articles?.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.author.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          <BookOpen className="w-4 h-4" /> Health Articles
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">Stay Informed, Stay Healthy</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Expert health tips, medical insights, and wellness guides from certified doctors.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pharma-card">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          {/* Featured Article */}
          {filtered.length > 0 && !searchTerm && (
            <Link
              to="/article/$id"
              params={{ id: filtered[0].id }}
              className="pharma-card group hover:shadow-card-hover transition-all mb-6 grid md:grid-cols-2 overflow-hidden"
            >
              <div className="overflow-hidden">
                <img
                  src={getArticleImage(filtered[0], 0)}
                  alt={filtered[0].title}
                  className="w-full h-56 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ARTICLE_IMAGES[0];
                  }}
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
                  Featured
                </span>
                <h2 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">
                  {filtered[0].title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{filtered[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {filtered[0].author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(filtered[0].date)}</span>
                  </div>
                  <span className="text-primary text-sm font-semibold flex items-center gap-1">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Rest of articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchTerm ? filtered : filtered.slice(1)).map((article, i) => (
              <Link
                key={article.id}
                to="/article/$id"
                params={{ id: article.id }}
                className="pharma-card group hover:shadow-card-hover transition-all overflow-hidden"
              >
                <div className="overflow-hidden">
                  <img
                    src={getArticleImage(article, searchTerm ? i : i + 1)}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ARTICLE_IMAGES[i % ARTICLE_IMAGES.length];
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.author}</span>
                    <span className="text-primary font-semibold flex items-center gap-1">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-foreground mb-1">No articles found</p>
          <p className="text-sm text-muted-foreground">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
