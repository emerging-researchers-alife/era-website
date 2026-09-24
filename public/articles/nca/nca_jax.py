"""
Neural Cellular Automata - JAX/Flax Implementation
Run: python nca_jax.py
"""
import jax
import jax.numpy as jnp
from jax import lax
from flax import linen as nn
import optax
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# ============ Cell State ============
def create_seed(size=64, channels=16):
    grid = jnp.zeros((1, size, size, channels))
    center = size // 2
    return grid.at[0, center, center, 3:].set(1.0)

# ============ Perception ============
def get_sobel_kernels():
    sobel_x = jnp.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=jnp.float32) / 8.0
    sobel_y = sobel_x.T
    identity = jnp.array([[0, 0, 0], [0, 1, 0], [0, 0, 0]], dtype=jnp.float32)
    return sobel_x, sobel_y, identity

def perceive(grid, sobel_x, sobel_y, identity):
    """Use explicit NHWC/HWIO layouts and one convolution group per channel."""
    channels = grid.shape[-1]
    filters = jnp.stack([identity, sobel_x, sobel_y], axis=-1)[:, :, None, :]
    filters = jnp.tile(filters, (1, 1, 1, channels))
    return lax.conv_general_dilated(
        grid, filters, (1, 1), 'SAME',
        dimension_numbers=('NHWC', 'HWIO', 'NHWC'),
        feature_group_count=channels,
    )
# ============ Update Network ============
class UpdateNetwork(nn.Module):
    channels: int = 16
    hidden: int = 128

    @nn.compact
    def __call__(self, x):
        x = nn.Dense(self.hidden)(x)
        x = nn.relu(x)
        return nn.Dense(self.channels, kernel_init=nn.initializers.zeros, bias_init=nn.initializers.zeros)(x)

# ============ Step Function ============
def alive_mask(grid, threshold=0.1):
    alpha = grid[..., 3:4]
    alive = lax.reduce_window(alpha, -jnp.inf, lax.max, (1, 3, 3, 1), (1, 1, 1, 1), 'SAME')
    return (alive > threshold).astype(jnp.float32)

def step(grid, params, model, sobel_x, sobel_y, identity, key, update_prob=0.5):
    perception = perceive(grid, sobel_x, sobel_y, identity)
    delta = model.apply(params, perception)
    key, subkey = jax.random.split(key)
    mask = (jax.random.uniform(subkey, (1, grid.shape[1], grid.shape[2], 1)) < update_prob).astype(jnp.float32)
    pre_alive = alive_mask(grid)
    grid = grid + delta * mask
    return grid * pre_alive * alive_mask(grid), key

# ============ Training ============
def load_target(path, size=40):
    img = Image.open(path).convert('RGBA').resize((size, size), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    target = jnp.array(arr)
    rgb = target[..., :3] * target[..., 3:4]
    return jnp.expand_dims(jnp.concatenate([rgb, target[..., 3:4]], axis=-1), 0)

def train(model, target_path, steps=2000, lr=2e-3):
    key = jax.random.PRNGKey(42)
    key, init_key = jax.random.split(key)

    params = model.init(init_key, jnp.zeros((1, 64, 64, 48)))
    optimizer = optax.adam(lr)
    opt_state = optimizer.init(params)
    sobel_x, sobel_y, identity = get_sobel_kernels()
    target = load_target(target_path)
    pad = (64 - target.shape[1]) // 2
    target_padded = jnp.pad(target, [(0, 0), (pad, pad), (pad, pad), (0, 0)])

    @jax.jit
    def train_step(params, opt_state, key):
        key, subkey, steps_key = jax.random.split(key, 3)
        n_steps = jax.random.randint(steps_key, (), 64, 96)

        def loss_fn(params):
            grid = create_seed()
            k = subkey
            def advance(carry, index):
                grid, k = carry
                candidate, k = step(grid, params, model, sobel_x, sobel_y, identity, k)
                return (jnp.where(index < n_steps, candidate, grid), k), None
            (grid, k), _ = lax.scan(advance, (grid, k), jnp.arange(96))
            return jnp.mean((grid[..., :4] - target_padded) ** 2)

        loss, grads = jax.value_and_grad(loss_fn)(params)
        grads = jax.tree_util.tree_map(lambda g: g / (jnp.linalg.norm(g) + 1e-8), grads)
        updates, opt_state = optimizer.update(grads, opt_state, params)
        params = optax.apply_updates(params, updates)
        return params, opt_state, loss, key

    for i in range(steps):
        params, opt_state, loss, key = train_step(params, opt_state, key)
        if i % 100 == 0:
            print(f"Step {i}: loss = {loss:.6f}")
    return params

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--target', default='target.png')
    parser.add_argument('--steps', type=int, default=2000)
    args = parser.parse_args()
    net = UpdateNetwork()
    params = train(net, args.target, steps=args.steps)
    from flax.serialization import to_bytes
    from pathlib import Path
    Path('nca-jax.msgpack').write_bytes(to_bytes(params))
    print('Saved weights. A finite loss verifies execution, not successful growth.')

