"""Keep downloadable scripts identical to the complete scripts shown in the article."""
from pathlib import Path
import re
import sys
source = Path('src/content/articles/getting-started-with-ncas.md').read_text()
for label, slug in [('PyTorch', 'pytorch'), ('MLX', 'mlx'), ('JAX', 'jax')]:
    match = re.search(r':::details\{title="Complete '+label+r' Script"\}\n```python\n(.*?)\n```', source, re.S)
    assert match, label
    script = match[1] + '\n'
    compile(script, slug, 'exec')
    destination = Path(f'public/articles/nca/nca_{slug}.py')
    if '--check' in sys.argv:
        assert destination.read_text() == script, f'{destination} differs from article; regenerate it'
    else:
        destination.write_text(script)
print('NCA downloadable scripts match the article.')
