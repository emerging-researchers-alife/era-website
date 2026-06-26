---
title: "How to Submit Articles"
subtitle: "A step-by-step guide to contributing to ERA"
date: "2025-11-23"
authors:
  - name: "ERA Maintainers"
tags:
  - "meta"
  - "documentation"
  - "tutorial"
abstract: >
  Learn how to submit articles to ERA. This guide covers the complete process
  from setting up your development environment to opening a pull request.
status: "published"
featured: true
---

## Introduction

ERA welcomes contributions from researchers, practitioners, and enthusiasts working in machine learning, artificial life, and related fields. Whether you're sharing a tutorial, explaining a paper, or presenting original research, this guide will walk you through the submission process.

Before starting, make sure you're familiar with our formatting guidelines: [How to Format Articles](/resources/how-to-format-articles).

:::sidenote
Not sure if your idea is a good fit? Open an issue on GitHub to discuss it with the community before investing time in writing.
:::

## Prerequisites

You'll need the following tools installed on your computer:

### Git

Git is version control software that tracks changes to your files and enables collaboration. If you don't have it:

- **macOS**: Install via Homebrew with `brew install git` or download from [git-scm.com](https://git-scm.com)
- **Windows**: Download from [git-scm.com](https://git-scm.com) or use WSL
- **Linux**: Install via your package manager (e.g., `apt install git`)

### Bun

Bun is a fast JavaScript runtime that we use for building and previewing articles:

```bash
# macOS, Linux, or WSL
curl -fsSL https://bun.sh/install | bash
```

After installation, restart your terminal and verify with `bun --version`.

### A Text Editor

Any text editor works, but we recommend one with Markdown preview and syntax highlighting:

- [VS Code](https://code.visualstudio.com/) with a Markdown preview extension
- [Zed](https://zed.dev/)
- Any editor with Markdown preview and syntax highlighting

### A GitHub Account

You'll need a GitHub account to push branches and open pull requests. Sign up
at [github.com](https://github.com) if you don't have one.

## Step 1: Get the Repository

Start from the ERA website repository on GitHub:

1. If you have write access, use the main ERA repository.
2. If you are contributing from outside the organization, fork the repository first.
3. Copy the clone URL from GitHub.

## Step 2: Clone the Repository

Download the repository to your computer:

```bash
# Use the clone URL copied from GitHub.
git clone <clone-url>
cd <repository-folder>
```

Install dependencies:

```bash
bun install
```

## Step 3: Create a Branch

Create a new branch for your article. Use a descriptive name:

```bash
git checkout -b article/your-article-slug
```

For example: `article/intro-to-transformers` or `article/nca-regeneration-study`.

## Step 4: Write Your Article

Create your article file in the `src/content/articles/` directory:

```bash
# Create your article file
touch src/content/articles/your-article-slug.md
```

Open the file in your editor and start with the frontmatter:

```markdown
---
title: "Your Article Title"
subtitle: "A brief description"
date: "2025-11-23"
authors:
  - name: "Your Name"
    affiliation: "Your Institution"
    url: "https://yourwebsite.com"
tags:
  - "relevant"
  - "tags"
abstract: >
  A 2-3 sentence summary of what readers will learn.
status: "draft"
---

## Introduction

Start writing your content here...
```

Set `status: "draft"` while writing. Change it to `status: "published"` when you're ready to submit.

:::sidenote
See [How to Format Articles](/resources/how-to-format-articles) for detailed guidance on frontmatter fields, code blocks, math, and other features.
:::

## Step 5: Add Images and Assets

If your article includes images, create a directory for them:

```bash
mkdir -p public/articles/your-article-slug
```

Place your images there and reference them in your article:

```markdown
![Description](/articles/your-article-slug/your-image.png)
{caption="Figure 1: Caption text here."}
```

**Image guidelines:**
- Use descriptive filenames (e.g., `architecture-diagram.png` not `fig1.png`)
- Optimize images for web (compress PNGs, use appropriate dimensions)
- Provide meaningful alt text for accessibility

## Step 6: Test Locally

Process your article and start the development server:

```bash
# Process all articles (generates JSON files)
bun run scripts/process-articles.ts --include-drafts

# Start the development server
bun run dev
```

Open `http://localhost:3001/resources/your-article-slug` in your browser to preview your article.

Check that:
- The page loads without errors
- Code blocks render with syntax highlighting
- Math equations display correctly
- Images appear as expected
- The table of contents works

Make changes to your `.md` file and refresh to see updates.

## Step 7: Commit Your Changes

Once you're satisfied with your article, commit your work:

```bash
# Add your files
git add src/content/articles/your-article-slug.md
git add public/articles/your-article-slug/  # If you have images

# Commit with a descriptive message
git commit -m "Add article: Your Article Title"
```

:::sidenote
You only commit your source files. The article registry and processed JSON are
generated automatically (and gitignored), so there are no build artifacts to add.
:::

## Step 8: Push and Open a Pull Request

Push your branch to GitHub:

```bash
git push -u origin article/your-article-slug
```

Then open a pull request:

1. Go to your fork on GitHub
2. Click **Compare & pull request** (or go to the Pull requests tab)
3. Fill in the PR template:
   - **Title**: "Add article: Your Article Title"
   - **Description**: Brief summary of the article content
   - **Checklist**: Confirm you've completed the quality checks

## Quality Checklist

Before submitting, verify:

### Content
- [ ] Title is clear and descriptive
- [ ] Abstract summarizes the key takeaways
- [ ] Content is well-organized with clear headings
- [ ] Technical claims are accurate
- [ ] Code examples are tested and work

### Formatting
- [ ] Frontmatter is complete (title, date, authors, tags, abstract)
- [ ] All code blocks have language identifiers
- [ ] Math renders correctly (check both inline and block)
- [ ] Images have alt text and captions where appropriate
- [ ] No broken links

### Technical
- [ ] Article builds without errors
- [ ] Page loads without console errors
- [ ] Responsive layout works (check mobile view)

## The Review Process

After you submit a pull request:

1. **Automated checks** run to verify the article builds correctly
2. **Community review**: Maintainers and community members may comment with suggestions
3. **Revision**: Address any feedback by pushing additional commits to your branch
4. **Approval**: Once approved, a maintainer will merge your PR
5. **Publication**: Your article goes live on the site

:::sidenote
Reviews typically focus on technical accuracy, clarity, and formatting. We aim to be constructive and help you improve your article.
:::

### Timeline

- Initial review: Usually within 1-2 weeks
- Simple articles may be merged quickly
- More complex articles may require a few rounds of feedback

### Responding to Feedback

If reviewers request changes:

1. Read the comments carefully
2. Make the requested changes in your local copy
3. Commit and push to your branch
4. Reply to comments indicating you've addressed them

The PR will update automatically with your new commits.

## Getting Help

If you run into issues or have questions:

- **GitHub Issues**: Open an issue in the ERA website repository for technical problems or questions
- **Discussions**: Use GitHub Discussions for general questions about article topics or formatting
- **Community**: Reach out to the ERA community

### Common Issues

**Article not showing up locally?**
- Make sure you ran `bun run scripts/process-articles.ts --include-drafts`
- Check that your file is in `src/content/articles/` with a `.md` extension
- Verify the frontmatter is valid YAML

**Math not rendering?**
- Check for missing dollar signs
- Ensure no extra spaces inside `$...$`
- Use `\\` for line breaks in multi-line equations

**Images not loading?**
- Verify the path matches where you placed the file, for example `/articles/your-article-slug/your-image.png`
- Check the filename case (paths are case-sensitive on some systems)

## What Makes a Good Article

The best ERA articles share some common qualities:

- **Clear purpose**: Readers know what they'll learn within the first few paragraphs
- **Practical examples**: Code that readers can run and experiment with
- **Multi-framework support**: PyTorch, MLX, and JAX implementations where applicable
- **Visual aids**: Diagrams and figures that clarify complex concepts
- **Honest limitations**: Acknowledge what your approach doesn't cover

We're excited to read your contribution!

---

**Ready to start?** Head back to [How to Format Articles](/resources/how-to-format-articles) if you need a refresher on the Markdown syntax, then follow the steps above to submit your work.
