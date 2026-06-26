---
title: "How to Format Articles"
subtitle: "A complete guide to ERA's extended Markdown format"
date: "2025-11-23"
authors:
  - name: "ERA Maintainers"
tags:
  - "meta"
  - "documentation"
  - "tutorial"
abstract: >
  Learn how to write articles for ERA using our extended Markdown format.
  This guide covers everything from basic formatting to advanced features
  like multi-language code blocks, mathematical notation, and sidenotes.
status: "published"
featured: true
---

## Introduction

ERA articles are more than just text. Our extended Markdown format lets you
share machine learning and artificial life research with rich formatting,
mathematical notation, code examples, and structured figures.

What makes ERA articles special:

- **Multi-framework code**: Show implementations in PyTorch, MLX, and JAX side-by-side, making your content accessible regardless of what hardware readers use
- **Mathematical notation**: Express algorithms and equations clearly with KaTeX
- **Sidenotes**: Add context without interrupting the flow of your argument
- **Responsive design**: Articles look great on desktop, tablet, and mobile

This guide walks through each feature, explaining what it does, when to use it, and how to write the Markdown syntax.

:::sidenote
If you're ready to submit an article, see our companion guide: [How to Submit Articles](/resources/how-to-submit-articles).
:::

## Quick Start

Every article begins with a YAML frontmatter block followed by Markdown content:

```markdown
---
title: "Your Article Title"
subtitle: "A brief description"
date: "2025-11-23"
authors:
  - name: "Your Name"
    affiliation: "Your Institution"
tags:
  - "tutorial"
abstract: >
  A 2-3 sentence summary of your article.
status: "draft"
---

## Introduction

Your content here...
```

Save this as a `.md` file in `src/content/articles/` and you're ready to start writing.

## Frontmatter

The frontmatter block at the top of each article contains metadata that powers search, filtering, and display throughout the site. Getting this right helps readers discover your work and gives proper attribution to all contributors.

### Required Fields

| Field | Description |
|-------|-------------|
| `title` | The main title displayed at the top of your article |
| `date` | Publication date in YYYY-MM-DD format |
| `authors` | List of contributors (see Author Object below) |
| `tags` | Array of topic keywords for categorization |
| `abstract` | A 2-3 sentence summary shown in article listings |

### Optional Fields

| Field | Description |
|-------|-------------|
| `subtitle` | A tagline or brief description below the title |
| `status` | One of `draft`, `published`, or `peer-reviewed` |
| `featured` | Set to `true` to highlight on the homepage |
| `thumbnail` | Path to a preview image for article cards |
| `bibliography` | Reserved for future BibTeX citation support |

### Author Object

Each author entry can include several fields for proper attribution and linking:

```yaml
authors:
  - name: "Jane Doe"                    # Required
    affiliation: "University Name"      # Optional - shown below name
    url: "https://janedoe.com"          # Optional - makes name clickable
    twitter: "janedoe"                  # Optional
    orcid: "0000-0001-2345-6789"        # Optional - academic identifier
    email: "jane@example.com"           # Optional
```

The `affiliation` appears beneath the author's name in the byline. If you provide a `url`, the author's name becomes a link to their website or profile.

## Headings and Structure

Headings create the skeleton of your article. They establish hierarchy for readers and automatically generate the table of contents in the sidebar.

Use `##` (h2) for main sections—these are the primary navigation points:

```markdown
## Introduction

## Background

## Methods

## Results

## Discussion
```

Use `###` (h3) for subsections within a main section:

```markdown
## Methods

### Data Collection

### Model Architecture

### Training Procedure
```

The table of contents shows all h2 headings, with h3 subheadings appearing when you scroll into that section. This keeps navigation clean while still providing access to subsections when relevant.

:::sidenote
Avoid skipping heading levels (e.g., jumping from ## to ####). This can confuse both readers and assistive technologies.
:::

## Text Formatting

Standard Markdown formatting works as expected:

| Syntax | Result |
|--------|--------|
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `~~strikethrough~~` | ~~strikethrough~~ |
| `` `inline code` `` | `inline code` |
| `[link](url)` | [link](https://example.com) |

### Lists

Unordered lists use `-` or `*`:

```markdown
- First item
- Second item
  - Nested item
```

Ordered lists use numbers:

```markdown
1. First step
2. Second step
3. Third step
```

### Blockquotes

Use `>` for quotations or callouts:

```markdown
> The best way to predict the future is to invent it.
> — Alan Kay
```

> The best way to predict the future is to invent it.
> — Alan Kay

## Code Blocks

Code is central to ERA articles. We provide three ways to display code, each suited to different purposes.

### Single Code Blocks

For straightforward examples in one language, use standard fenced code blocks with a language identifier:

````markdown
```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```
````

This renders with syntax highlighting:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

### Multi-Language Code Tabs

When you want to show the same concept implemented in multiple frameworks, use the `:::codetabs` directive. This creates a tabbed interface where readers can switch between implementations.

This matters because your readers use different tools:
- **PyTorch** users often have NVIDIA GPUs
- **MLX** users are on Apple Silicon Macs
- **JAX** users may be working with TPUs or prefer its functional style

By providing all three, you make your content accessible to everyone.

````markdown
:::codetabs
```python {title="PyTorch"}
import torch
x = torch.randn(3, 3)
print(x.sum())
```

```python {title="MLX"}
import mlx.core as mx
x = mx.random.normal((3, 3))
print(x.sum())
```

```python {title="JAX"}
import jax.numpy as jnp
import jax.random as jr
key = jr.PRNGKey(0)
x = jr.normal(key, (3, 3))
print(x.sum())
```
:::
````

This renders as:

:::codetabs
```python {title="PyTorch"}
import torch
x = torch.randn(3, 3)
print(x.sum())
```

```python {title="MLX"}
import mlx.core as mx
x = mx.random.normal((3, 3))
print(x.sum())
```

```python {title="JAX"}
import jax.numpy as jnp
import jax.random as jr
key = jr.PRNGKey(0)
x = jr.normal(key, (3, 3))
print(x.sum())
```
:::

The reader's framework preference is saved, so they'll see their preferred framework first when they visit other articles.

### Expandable Code Blocks

For complete scripts or lengthy code that would interrupt the reading flow, use the `:::details` directive. This creates a collapsible section that readers can expand when they want the full implementation.

````markdown
:::details{title="Complete Training Script"}
```python
import torch
import torch.nn as nn

class Model(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Linear(256, 10)
        )

    def forward(self, x):
        return self.layers(x)

# ... more code
```
:::
````

:::details{title="Example: Complete Training Script"}
```python
import torch
import torch.nn as nn
import torch.optim as optim

class Model(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Linear(256, 10)
        )

    def forward(self, x):
        return self.layers(x)

def train(model, data_loader, epochs=10):
    optimizer = optim.Adam(model.parameters())
    criterion = nn.CrossEntropyLoss()

    for epoch in range(epochs):
        for batch_x, batch_y in data_loader:
            optimizer.zero_grad()
            output = model(batch_x)
            loss = criterion(output, batch_y)
            loss.backward()
            optimizer.step()

if __name__ == "__main__":
    model = Model()
    # train(model, data_loader)
```
:::

## Mathematical Notation

ERA uses KaTeX for rendering mathematical notation. This is essential for expressing algorithms, loss functions, and theoretical concepts clearly.

### Inline Math

Wrap expressions in single dollar signs for inline math that flows with your text:

```markdown
The learning rate $\alpha$ controls step size, while $\lambda$ sets regularization strength.
```

Renders as: The learning rate $\alpha$ controls step size, while $\lambda$ sets regularization strength.

### Block Math

Use double dollar signs for display equations that deserve their own line:

```markdown
$$
\mathcal{L}(\theta) = \frac{1}{N} \sum_{i=1}^{N} \left( y_i - f_\theta(x_i) \right)^2 + \lambda \|\theta\|_2^2
$$
```

Renders as:

$$
\mathcal{L}(\theta) = \frac{1}{N} \sum_{i=1}^{N} \left( y_i - f_\theta(x_i) \right)^2 + \lambda \|\theta\|_2^2
$$

:::sidenote
KaTeX supports most LaTeX math commands. For a full reference, see the [KaTeX documentation](https://katex.org/docs/supported.html).
:::

## Sidenotes

Sidenotes let you add context, definitions, or tangential information without breaking the reader's flow through your main argument. On desktop, they appear in the margin. On mobile, they render as highlighted inline blocks.

Use sidenotes for:
- Definitions of technical terms
- Historical context or background
- Links to related resources
- Caveats or edge cases
- Interesting asides

```markdown
The model uses attention mechanisms to weigh input relevance.

:::sidenote
Attention was introduced in "Attention Is All You Need" (Vaswani et al., 2017)
and has since become foundational to modern NLP.
:::

This allows the network to focus on relevant parts of the input.
```

:::sidenote
Sidenotes are inspired by the typography of Edward Tufte's books, which use margin notes extensively to keep the main text clean while providing rich supplementary information.
:::

## Footnotes

Footnotes are better suited for citations, sources, and detailed technical explanations that readers might want to verify. They appear at the bottom of the article with numbered references.

```markdown
This result was first demonstrated in 2020[^1].

[^1]: Mordvintsev et al., "Growing Neural Cellular Automata", Distill, 2020.
```

The `[^1]` creates a superscript link, and the footnote definition can appear anywhere in your document—it will be collected and displayed at the end.

**When to use sidenotes vs footnotes:**
- **Sidenotes**: Context that enhances understanding while reading
- **Footnotes**: References and citations readers might want to look up later

## Images and Figures

Visualizations are crucial for communicating research. ERA supports images with captions and multiple layout options.

### Basic Image

```markdown
![Description of the image](/articles/your-slug/diagram.png)
```

### Image with Caption

```markdown
![Neural network architecture](/articles/your-slug/architecture.png)
{caption="Figure 1: The encoder-decoder architecture used in our experiments."}
```

### Layout Classes

Control how wide your images display:

| Class | Behavior |
|-------|----------|
| `.l-body` | Default text width (~680px) |
| `.l-page` | Wider, extends into margins |
| `.l-screen` | Full viewport width |

```markdown
![Wide visualization](/articles/your-slug/results.png)
{.l-page caption="Figure 2: Training curves across all experiments."}
```

Use `.l-page` for detailed diagrams that benefit from more space. Use `.l-screen` sparingly for hero images or very wide visualizations.

## Tables

Tables use standard GitHub Flavored Markdown syntax:

```markdown
| Model | Accuracy | Parameters |
|-------|----------|------------|
| Small | 92.3% | 1.2M |
| Medium | 95.1% | 12M |
| Large | 97.8% | 120M |
```

| Model | Accuracy | Parameters |
|-------|----------|------------|
| Small | 92.3% | 1.2M |
| Medium | 95.1% | 12M |
| Large | 97.8% | 120M |

For complex data, consider whether a visualization might communicate the information more effectively.

## Citations Coming Soon

BibTeX-powered citations are planned, but not yet enabled in the article
pipeline. For now, use ordinary Markdown links and footnotes for references:

```markdown
Neural Cellular Automata demonstrate remarkable regenerative properties.[^1]

[^1]: Mordvintsev et al., "Growing Neural Cellular Automata", Distill, 2020.
```

## Interactive Articles Coming Soon

Runnable examples, Python web runtimes, and notebook-style articles are also
planned but not currently supported in published articles. For now, include
tested static code blocks and link to external notebooks or repositories when
readers need runnable artifacts.

If you have an article idea that needs interactivity, a Python runtime, a
particular package, or another authoring feature, open a GitHub issue in the
ERA website repository. Issues are the best place to discuss feature requests
before investing time in a format the current site does not yet support.

## Next Steps

Now that you know how to format articles, you're ready to contribute:

1. **Read the submission guide**: [How to Submit Articles](/resources/how-to-submit-articles) walks through the complete process from fork to pull request
2. **Look at examples**: Browse existing articles to see these features in action
3. **Start writing**: Create your article and test it locally before submitting

We look forward to your contributions!
