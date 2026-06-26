import { Link } from '@tanstack/react-router';
import { SectionHeading } from '../components/ui';
import { ArticlesSection } from '../components/articles';
import { articlesByDate, articleCount } from '../content/registry';
import type { ArticleMetadata } from '../content/types';

// Article type definitions with colors
const ARTICLE_TYPES = {
  tutorial: { label: 'Tutorial', color: 'var(--color-primary)' },
  guide: { label: 'Guide', color: '#7DD3FC' }, // accent blue
  essay: { label: 'Essay', color: '#C4B5FD' }, // accent purple
  explainer: { label: 'Explainer', color: 'var(--color-primary-light)' },
  research: { label: 'Research', color: '#F87171' }, // coral
  interview: { label: 'Interview', color: '#FCD34D' }, // amber
  project: { label: 'Project', color: '#34D399' }, // emerald
  recap: { label: 'Recap', color: '#A78BFA' }, // violet
  opinion: { label: 'Opinion', color: '#FB923C' }, // orange
} as const;

type ArticleType = keyof typeof ARTICLE_TYPES;

// Get the primary type from an article's tags
function getArticleType(article: ArticleMetadata): { label: string; color: string } {
  const typeTag = article.tags.find((tag) => tag in ARTICLE_TYPES) as ArticleType | undefined;
  if (typeTag) {
    return ARTICLE_TYPES[typeTag];
  }
  // Default fallback
  return { label: 'Article', color: 'var(--color-text-muted)' };
}

export default function ResourcesPage() {
  // Get top 6 articles for "Popular Articles" section
  // For now, just use the most recent articles; later this could be based on featured flag or views
  const popularArticles = articlesByDate.slice(0, 6);

  return (
    <div className="container-era section-spacing">
      {/* Page Title */}
      <SectionHeading as="h1">Resources</SectionHeading>

      {/* Intro */}
      <section className="prose-era mb-12">
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.125rem' }}>
          Explore our collection of articles, tutorials, and guides about Artificial Life.
        </p>
      </section>

      {/* Popular Articles - text-focused cards with type badges */}
      {popularArticles.length > 0 && (
        <section className="mb-16">
          <SectionHeading>Popular Articles</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article) => {
              const articleType = getArticleType(article);

              return (
                <Link
                  key={article.slug}
                  to="/resources/$slug"
                  params={{ slug: article.slug }}
                  className="group block p-5 rounded-xl bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5 border-none"
                  data-umami-event="article-click"
                  data-umami-event-slug={article.slug}
                  data-umami-event-type={articleType.label.toLowerCase()}
                  data-umami-event-location="popular-articles"
                >
                  {/* Type badge */}
                  <span
                    className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${articleType.color} 15%, transparent)`,
                      color: articleType.color,
                    }}
                  >
                    {articleType.label}
                  </span>

                  {/* Title */}
                  <h3
                    className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-[var(--color-primary-dark)] transition-colors mb-2"
                    style={{ color: 'var(--color-dark)' }}
                  >
                    {article.title}
                  </h3>

                  {/* Abstract excerpt */}
                  <p
                    className="text-sm line-clamp-2 mb-3"
                    style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
                  >
                    {article.abstract}
                  </p>

                  {/* Reading time */}
                  <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {article.readingTime} min read
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All Articles Section */}
      <section>
        <SectionHeading>
          All Articles
          {articleCount > 0 && (
            <span className="ml-2 text-base font-normal text-[var(--color-text-muted)]">
              ({articleCount})
            </span>
          )}
        </SectionHeading>

        {articleCount > 0 ? (
          <ArticlesSection />
        ) : (
          <div
            className="p-8 rounded-xl text-center"
            style={{
              background: 'var(--color-surface-alt)',
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: 'var(--color-border)',
            }}
          >
            <p
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Articles Coming Soon
            </p>
            <p style={{ color: 'var(--color-text-muted)' }}>
              We're building a collection of educational articles about Artificial Life.
              Check back soon!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
