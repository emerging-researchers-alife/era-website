#!/usr/bin/env bun
/**
 * Article processing script for ERA.
 *
 * Scans src/content/articles/ for Markdown files, processes them through
 * the unified pipeline, and generates:
 * 1. src/content/registry.ts - metadata for list views
 * 2. dist/articles/*.json - full article content for individual pages
 *
 * Usage:
 *   bun run scripts/process-articles.ts
 *   bun run scripts/process-articles.ts --include-drafts
 */

import { Glob } from 'bun';
import matter from 'gray-matter';
import type { Root as HastRoot } from 'hast';

import { validateFrontmatter } from './lib/validators';
import { createPipeline, createHastPipeline } from './lib/pipeline';
import {
  calculateWordCount,
  calculateReadingTime,
  extractTableOfContents,
  slugify,
} from './lib/utils';
import type { ArticleMetadata, Article, TableOfContentsItem } from '../src/content/types';

// Configuration
const ARTICLES_DIR = 'src/content/articles';
const OUTPUT_DIR = '.build/articles'; // Temp location, copied to dist by build.ts
const REGISTRY_PATH = 'src/content/registry.ts';

// CLI flags
const includeDrafts = process.argv.includes('--include-drafts');

interface ProcessResult {
  slug: string;
  metadata: ArticleMetadata;
  full: Article;
}

interface ProcessingStats {
  success: string[];
  errors: Array<{ file: string; error: string }>;
  skipped: string[];
}

/**
 * Main entry point.
 */
async function main() {
  console.log('\n📝 Processing articles...\n');

  const stats: ProcessingStats = {
    success: [],
    errors: [],
    skipped: [],
  };

  // Ensure output directory exists
  await Bun.$`mkdir -p ${OUTPUT_DIR}`.quiet();

  // Find all .md files (exclude templates starting with _)
  const glob = new Glob('*.md');
  const files = [...glob.scanSync(ARTICLES_DIR)].filter((f) => !f.startsWith('_'));

  if (files.length === 0) {
    console.log('📭 No articles found to process.\n');
    await generateRegistry({});
    return;
  }

  console.log(`📚 Found ${files.length} article(s)\n`);

  // Process each file
  const articles: Record<string, ArticleMetadata> = {};

  for (const file of files) {
    try {
      const result = await processArticle(file);

      // Skip drafts unless --include-drafts flag is set
      if (result.metadata.status === 'draft' && !includeDrafts) {
        stats.skipped.push(file);
        console.log(`  ⏭️  ${file} (draft)`);
        continue;
      }

      articles[result.slug] = result.metadata;

      // Write full article content to dist
      await Bun.write(
        `${OUTPUT_DIR}/${result.slug}.json`,
        JSON.stringify(result.full, null, 2)
      );

      stats.success.push(file);
      console.log(`  ✅ ${file} → ${result.slug}.json`);
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      stats.errors.push({ file, error });
      console.error(`  ❌ ${file}: ${error}`);
    }
  }

  // Generate registry
  await generateRegistry(articles);

  // Print summary
  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Processed: ${stats.success.length}`);
  if (stats.skipped.length > 0) {
    console.log(`   ⏭️  Skipped:   ${stats.skipped.length} (drafts)`);
  }
  if (stats.errors.length > 0) {
    console.log(`   ❌ Errors:    ${stats.errors.length}`);
  }
  console.log('');

  // Exit with error if any failures
  if (stats.errors.length > 0) {
    console.error('❌ Processing completed with errors.\n');
    process.exit(1);
  }

  console.log('✅ Processing completed successfully.\n');
}

/**
 * Process a single article file.
 */
async function processArticle(filename: string): Promise<ProcessResult> {
  const filepath = `${ARTICLES_DIR}/${filename}`;
  const raw = await Bun.file(filepath).text();
  const slug = slugify(filename);

  // Parse frontmatter
  const { data, content } = matter(raw);

  // Validate frontmatter
  const frontmatter = validateFrontmatter(data, filename);

  // Calculate metadata
  const wordCount = calculateWordCount(content);
  const readingTime = calculateReadingTime(wordCount);

  // Process through HAST pipeline to extract TOC
  const hastPipeline = createHastPipeline();
  const hastResult = await hastPipeline.run(hastPipeline.parse(content));
  const tableOfContents = extractTableOfContents(hastResult as HastRoot);

  // Process through full pipeline for HTML output
  const htmlPipeline = createPipeline();
  const htmlResult = await htmlPipeline.process(content);
  const html = String(htmlResult);

  const metadata: ArticleMetadata = {
    ...frontmatter,
    slug,
    wordCount,
    readingTime,
  };

  const full: Article = {
    ...metadata,
    content: html,
    tableOfContents,
  };

  return { slug, metadata, full };
}

/**
 * Generate the registry.ts file with article metadata.
 */
async function generateRegistry(articles: Record<string, ArticleMetadata>) {
  const articlesJson = JSON.stringify(articles, null, 2)
    // Indent the JSON properly within the file
    .split('\n')
    .join('\n');

  const code = `/**
 * Article metadata registry.
 *
 * AUTO-GENERATED by scripts/process-articles.ts
 * Do not edit manually - changes will be overwritten.
 *
 * @generated
 */

import type { ArticleMetadata } from './types';

/**
 * All published articles indexed by slug.
 */
export const articles: Record<string, ArticleMetadata> = ${articlesJson};

/**
 * Articles sorted by date (newest first).
 */
export const articlesByDate: ArticleMetadata[] = Object.values(articles).sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

/**
 * Featured articles for homepage display.
 */
export const featuredArticles: ArticleMetadata[] = articlesByDate.filter(
  (article) => article.featured
);

/**
 * Get all unique tags from articles.
 */
export const allTags: string[] = [
  ...new Set(articlesByDate.flatMap((article) => article.tags)),
].sort();

/**
 * Get article count.
 */
export const articleCount = Object.keys(articles).length;
`;

  await Bun.write(REGISTRY_PATH, code);
  console.log(`\n📦 Generated ${REGISTRY_PATH}`);
}

// Run
main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
