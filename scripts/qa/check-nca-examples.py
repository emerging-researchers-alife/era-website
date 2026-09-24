"""Execute published snippets and full scripts; this is not a training-quality benchmark."""
import ast
import os
from pathlib import Path
import re
import sys
os.environ.setdefault('MPLBACKEND', 'Agg')
import numpy as np

framework = sys.argv[1]
label = {'pytorch': 'PyTorch', 'mlx': 'MLX', 'jax': 'JAX'}[framework]
source = Path('src/content/articles/getting-started-with-ncas.md').read_text()
namespace = {'__name__': 'article_check'}
# Execute each displayed step in order, as a reader would.
for code in re.findall(r'```python \{title="'+label+r'"\}\n(.*?)\n```', source, re.S):
    exec(compile(code, f'article-{framework}', 'exec'), namespace)

for version in ['snippets', 'complete']:
    if version == 'complete':
        namespace = {'__name__': 'article_check'}
        exec(Path(f'public/articles/nca/nca_{framework}.py').read_text(), namespace)
    n = namespace
    # Every channel must retain its own identity; catches incorrect grouped convolutions.
    values = np.arange(16, dtype=np.float32)
    grid = np.broadcast_to(values, (1, 8, 8, 16)).copy()
    if framework == 'pytorch':
        torch = n['torch']; torch.set_num_threads(2)
        grid = torch.tensor(grid).permute(0, 3, 1, 2)
        convert = lambda x: x.detach().cpu().numpy()
    elif framework == 'mlx':
        grid = n['mx'].array(grid); convert = np.array
    else:
        grid = n['jnp'].array(grid); convert = np.array
    perception = convert(n['perceive'](grid, *n['get_sobel_kernels']()))
    assert perception.shape == (1, 8, 8, 48)
    np.testing.assert_allclose(perception[0, 3, 3, ::3], values)
    np.testing.assert_allclose(perception[0, 3, 3, 1::3], 0, atol=1e-6)
    np.testing.assert_allclose(perception[0, 3, 3, 2::3], 0, atol=1e-6)
    model = n['UpdateNetwork']()
    target_path = 'public/articles/nca/target.png'
    if framework == 'jax':
        jax = n['jax']
        if version == 'snippets':
            params = model.init(jax.random.PRNGKey(0), n['jnp'].zeros((1, 64, 64, 48)))
            result = n['train_nca'](params, model, n['load_target'](target_path), steps=1)
        else:
            result = n['train'](model, target_path, steps=1)
        arrays = jax.tree_util.tree_leaves(result)
    else:
        if version == 'snippets':
            n['train_nca'](model, n['load_target'](target_path), steps=1)
        else:
            n['train'](model, target_path, steps=1)
        arrays = list(model.parameters()) if framework == 'pytorch' else [v for _, v in __import__('mlx.utils', fromlist=['tree_flatten']).tree_flatten(model.parameters())]
    assert all(np.isfinite(convert(x)).all() for x in arrays)
    assert np.any(convert(arrays[-1]) != 0), 'Output parameters did not update'
    if version == 'snippets':
        import matplotlib.pyplot as plt
        plt.show = lambda: None
        if framework == 'jax':
            frames = n['visualize_growth'](result, model, n_steps=4)
        else:
            frames = n['visualize_growth'](model, n_steps=4)
        assert len(frames) == 2 and np.isfinite(frames).all()
    print(f'{framework} {version}: perception, gradient update, finite parameters passed', flush=True)
