import React from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { ChevronLeft, Calendar, User, BookOpen, ArrowRight } from 'lucide-react';
import { useGetArticleById, useGetAllArticles } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Article } from '../backend';

const ARTICLE_IMAGES = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80',
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

export default function ArticleDetail() {
  const { id } = useParams({ from: '/article/$id' });
  const navigate = useNavigate();
  const { data: article, isLoading } = useGetArticleById(id);
  const { data: allArticles } = useGetAllArticles();

  const relatedArticles = allArticles?.filter(a => a.id !== id).slice(0, 3) || [];
  const articleIndex = allArticles?.findIndex(a => a.id === id) || 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Skeleton className="h-72 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="font-semibold mb-2">Article not found</p>
        <Button className="rounded-pill mt-2" onClick={() => navigate({ to: '/articles' })}>
          Browse Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate({ to: '/articles' })}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Articles
      </button>

      {/* Hero Image */}
      <div className="pharma-card overflow-hidden mb-8">
        <img
          src={getArticleImage(article, articleIndex)}
          alt={article.title}
          className="w-full h-64 md:h-96 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = ARTICLE_IMAGES[0];
          }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Article Content */}
        <article className="lg:col-span-2">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-4 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {formatDate(article.date)}
            </span>
          </div>

          {/* Excerpt */}
          <p className="text-base text-muted-foreground italic mb-6 leading-relaxed border-l-4 border-primary pl-4">
            {article.excerpt}
          </p>

          {/* Content */}
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
            {article.content.split('\n').map((paragraph, i) => (
              paragraph.trim() ? (
                <p key={i} className="mb-4 text-sm leading-relaxed text-foreground/90">
                  {paragraph}
                </p>
              ) : null
            ))}
          </div>
        </article>

        {/* Related Articles Sidebar */}
        <aside>
          <div className="sticky top-24">
            <h3 className="font-display font-bold text-lg mb-4">Related Articles</h3>
            <div className="space-y-4">
              {relatedArticles.map((related, i) => (
                <Link
                  key={related.id}
                  to="/article/$id"
                  params={{ id: related.id }}
                  className="pharma-card group hover:shadow-card-hover transition-all overflow-hidden flex gap-3 p-3"
                >
                  <img
                    src={getArticleImage(related, i + 1)}
                    alt={related.title}
                    className="w-16 h-16 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ARTICLE_IMAGES[i % ARTICLE_IMAGES.length];
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {related.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{related.author}</p>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to="/articles"
              className="flex items-center gap-2 text-sm text-primary font-semibold mt-4 hover:gap-3 transition-all"
            >
              View All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
