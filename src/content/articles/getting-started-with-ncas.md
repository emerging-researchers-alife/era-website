---
title: "Getting Started with Neural Cellular Automata"
subtitle: "A hands-on guide to growing patterns with learned update rules"
date: "2025-11-24"
authors:
  - name: "B. Gaskin"
    affiliation: "University of Sydney"
    url: "https://bengaskin.com"
tags:
  - "tutorial"
  - "neural-networks"
  - "cellular-automata"
  - "beginner"
  - "pytorch"
  - "mlx"
  - "jax"
abstract: >
  This tutorial teaches you how to implement Neural Cellular Automata (NCA) from
  scratch. Starting from the basic concepts, we'll build a complete system that
  can grow images from a single seed cell. Code is provided in PyTorch, MLX, and JAX.
status: "published"
featured: true
thumbnail: "/articles/nca/nca-growth.png"
---

:::nca{weights="lizard" width=96 height=96}
This "Experiment 3" lizard from Mordvintsev et al. (2020) can regenerate when damaged. Click to damage it, double-click to reset. By the end of this tutorial, you'll understand exactly how it works.
:::

:::sidenote
This tutorial is based on [Growing Neural Cellular Automata](https://distill.pub/2020/growing-ca/) by Mordvintsev, Randazzo, Niklasson & Levin (Distill, 2020). The interactive demo above uses their Experiment 3 (regenerating) model weights, released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). [DOI: 10.23915/distill.00023](https://doi.org/10.23915/distill.00023)
:::

## What is a Neural Cellular Automaton?

Imagine a grid of cells, like pixels on a screen. Each cell can only see its immediate neighbors - the 8 cells surrounding it. Despite this limited view, if we give each cell the right rules for updating itself, something magical happens: complex patterns emerge from simple beginnings.

This is the essence of **cellular automata** (CA). The most famous example is Conway's Game of Life, where cells follow just four simple rules and produce endlessly fascinating behaviors.

**Neural Cellular Automata** (NCA) take this idea further. Instead of hand-coding the rules, we *learn* them using a neural network. This lets us train cells to grow into any pattern we want - and remarkably, they can even repair themselves when damaged.

## Prerequisites

Before we start, you should have:

- **Basic Python knowledge** - variables, functions, loops
- **One ML framework installed** - pick PyTorch, MLX (for Apple Silicon), or JAX
- **Basic understanding of tensors** - think of them as multi-dimensional arrays

Don't worry if you haven't used neural networks before - we'll explain everything as we go.

## The Core Idea

Here's the architecture of what we're building:

![NCA Update Architecture](/articles/nca/model.svg)
{caption="The NCA update step: perception → update rule → stochastic update → alive masking. (Mordvintsev et al., 2020, CC-BY-4.0)"}

The system works in five stages:

1. **Grid of cells**: Each cell has a state vector (16 numbers: RGBA color + 12 hidden values)
2. **Perception**: Each cell "sees" its neighbors using Sobel gradient filters
3. **Update network**: A small neural network decides how to change each cell's state
4. **Stochastic update**: Cells update randomly (not all at once) to avoid synchronization artifacts
5. **Alive masking**: Only living cells (those with neighbors) participate

Let's build each piece.

## Step 1: Define the Cell State

Each cell in our grid has 16 channels:
- **Channels 0-2**: RGB color (what we see)
- **Channel 3**: Alpha (transparency / "aliveness")
- **Channels 4-15**: Hidden state (for the cell to use internally)

We start with a single "seed" cell in the center of an otherwise empty grid:

:::codetabs
```python {title="PyTorch"}
import torch

def create_seed(size=64, channels=16, device='cpu'):
    """Create initial grid with a single seed cell in the center.

    The seed has alpha=1 and hidden channels=1, marking it as "alive".
    RGB channels start at 0 so the seed is initially invisible.
    """
    grid = torch.zeros(1, channels, size, size, device=device)
    center = size // 2
    grid[0, 3:, center, center] = 1.0  # Alpha + hidden = 1
    return grid

seed = create_seed(size=64)
print(f"Grid shape: {seed.shape}")  # [1, 16, 64, 64]
```

```python {title="MLX"}
import mlx.core as mx

def create_seed(size=64, channels=16):
    """Create initial grid with a single seed cell in the center.

    MLX uses NHWC format (batch, height, width, channels).
    The seed has alpha=1 and hidden channels=1, marking it as "alive".
    """
    grid = mx.zeros((1, size, size, channels))
    center = size // 2
    grid = grid.at[0, center, center, 3:].set(1.0)
    return grid

seed = create_seed(size=64)
print(f"Grid shape: {seed.shape}")  # [1, 64, 64, 16]
```

```python {title="JAX"}
import jax.numpy as jnp

def create_seed(size=64, channels=16):
    """Create initial grid with a single seed cell in the center.

    JAX uses NHWC format. The seed has alpha=1 and hidden channels=1.
    """
    grid = jnp.zeros((1, size, size, channels))
    center = size // 2
    grid = grid.at[0, center, center, 3:].set(1.0)
    return grid

seed = create_seed(size=64)
print(f"Grid shape: {seed.shape}")  # [1, 64, 64, 16]
```
:::

## Step 2: Perception

Before a cell can decide what to do, it needs to "see" its neighborhood. We do this with **Sobel filters** - convolution kernels that detect gradients (how values change across space).

Each cell perceives three things for each of its 16 channels:
1. Its own state (identity filter)
2. The horizontal gradient (Sobel X)
3. The vertical gradient (Sobel Y)

Total: **48 perception values** per cell (16 channels × 3 filters).

:::codetabs
```python {title="PyTorch"}
import torch
import torch.nn.functional as F

def get_sobel_kernels():
    """Create perception filter kernels.

    Sobel filters detect gradients: sobel_x finds horizontal edges,
    sobel_y finds vertical edges. Division by 8 normalizes the output.
    """
    sobel_x = torch.tensor([
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ], dtype=torch.float32) / 8.0

    sobel_y = sobel_x.T
    identity = torch.tensor([
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ], dtype=torch.float32)

    return sobel_x, sobel_y, identity

def perceive(grid, sobel_x, sobel_y, identity):
    """Apply perception filters to compute what each cell sees.

    Uses depthwise convolution: each filter is applied to each channel
    independently, producing 48 output values per cell.
    """
    B, C, H, W = grid.shape

    # Stack filters and reshape for depthwise conv
    filters = torch.stack([identity, sobel_x, sobel_y])  # [3, 3, 3]
    filters = filters.unsqueeze(1).repeat(C, 1, 1, 1)    # [C*3, 1, 3, 3]
    filters = filters.view(C * 3, 1, 3, 3).to(grid.device)

    # Depthwise convolution
    grid_repeated = grid.repeat(1, 3, 1, 1)  # [B, C*3, H, W]
    perception = F.conv2d(grid_repeated, filters, padding=1, groups=C * 3)

    # Reshape to [B, H, W, C*3] for the update network
    perception = perception.permute(0, 2, 3, 1)
    return perception

sobel_x, sobel_y, identity = get_sobel_kernels()
perception = perceive(seed, sobel_x, sobel_y, identity)
print(f"Perception shape: {perception.shape}")  # [1, 64, 64, 48]
```

```python {title="MLX"}
import mlx.core as mx
import mlx.nn as nn

def get_sobel_kernels():
    """Create perception filter kernels."""
    sobel_x = mx.array([
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ], dtype=mx.float32) / 8.0

    sobel_y = sobel_x.T
    identity = mx.array([
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ], dtype=mx.float32)

    return sobel_x, sobel_y, identity

def perceive(grid, sobel_x, sobel_y, identity):
    """Apply perception filters using depthwise convolution.

    MLX conv2d expects [B, H, W, C_in] input and [H, W, C_in, C_out] weight.
    """
    B, H, W, C = grid.shape

    # Stack filters: [3, 3, 1, 3]
    filters = mx.stack([identity, sobel_x, sobel_y], axis=-1)
    filters = mx.expand_dims(filters, axis=2)

    # Tile for all channels: [3, 3, C, 3]
    filters = mx.tile(filters, (1, 1, C, 1))

    # Depthwise conv (groups=C)
    perception = mx.conv2d(grid, filters, padding=1, groups=C)
    perception = perception.reshape(B, H, W, C * 3)

    return perception

sobel_x, sobel_y, identity = get_sobel_kernels()
perception = perceive(seed, sobel_x, sobel_y, identity)
print(f"Perception shape: {perception.shape}")  # [1, 64, 64, 48]
```

```python {title="JAX"}
import jax
import jax.numpy as jnp
from jax import lax

def get_sobel_kernels():
    """Create perception filter kernels."""
    sobel_x = jnp.array([
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ], dtype=jnp.float32) / 8.0

    sobel_y = sobel_x.T
    identity = jnp.array([
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ], dtype=jnp.float32)

    return sobel_x, sobel_y, identity

def perceive(grid, sobel_x, sobel_y, identity):
    """Apply perception filters to all channels.

    Uses vmap for efficient vectorized computation across channels.
    """
    B, H, W, C = grid.shape

    # Stack filters: [3, 3, 1, 3]
    filters = jnp.stack([identity, sobel_x, sobel_y], axis=-1)
    filters = jnp.expand_dims(filters, axis=2)

    # Apply filters to each channel using vmap
    def convolve_channel(channel):
        return lax.conv(channel[..., None], filters, (1, 1), 'SAME')

    # Vectorize over channels
    channels = jnp.transpose(grid, (3, 0, 1, 2))  # [C, B, H, W]
    perceptions = jax.vmap(convolve_channel)(channels)  # [C, B, H, W, 3]

    # Reshape to [B, H, W, C*3]
    perceptions = jnp.transpose(perceptions, (1, 2, 3, 0, 4))  # [B, H, W, C, 3]
    perception = perceptions.reshape(B, H, W, C * 3)

    return perception

sobel_x, sobel_y, identity = get_sobel_kernels()
perception = perceive(seed, sobel_x, sobel_y, identity)
print(f"Perception shape: {perception.shape}")  # [1, 64, 64, 48]
```
:::

## Step 3: The Update Network

Now we need a neural network that takes the perception (48 values) and outputs a state update (16 values). We use a simple two-layer network:

```
Perception (48) → Dense (128) → ReLU → Dense (16) → State Delta
```

The key trick: we initialize the final layer to **zeros**. This means the network starts by doing nothing, then gradually learns what changes to make. This "do-nothing" initialization is crucial for stable training.

:::codetabs
```python {title="PyTorch"}
import torch.nn as nn

class UpdateNetwork(nn.Module):
    def __init__(self, channels=16, hidden=128):
        super().__init__()
        perception_dim = channels * 3  # 48 inputs

        self.fc1 = nn.Linear(perception_dim, hidden)
        self.fc2 = nn.Linear(hidden, channels)

        # Zero-initialize output layer (network starts doing nothing)
        nn.init.zeros_(self.fc2.weight)
        nn.init.zeros_(self.fc2.bias)

    def forward(self, perception):
        # perception: [B, H, W, 48]
        x = torch.relu(self.fc1(perception))
        delta = self.fc2(x)  # [B, H, W, 16]
        return delta

update_net = UpdateNetwork()
print(f"Parameters: {sum(p.numel() for p in update_net.parameters()):,}")
```

```python {title="MLX"}
import mlx.nn as nn

class UpdateNetwork(nn.Module):
    def __init__(self, channels=16, hidden=128):
        super().__init__()
        perception_dim = channels * 3

        self.fc1 = nn.Linear(perception_dim, hidden)
        self.fc2 = nn.Linear(hidden, channels)

        # Zero-initialize output layer
        self.fc2.weight = mx.zeros_like(self.fc2.weight)
        self.fc2.bias = mx.zeros_like(self.fc2.bias)

    def __call__(self, perception):
        x = nn.relu(self.fc1(perception))
        delta = self.fc2(x)
        return delta

update_net = UpdateNetwork()
print(f"Parameters: ~8,000")  # 48*128 + 128 + 128*16 + 16
```

```python {title="JAX"}
import jax
import jax.numpy as jnp
from flax import linen as nn

class UpdateNetwork(nn.Module):
    channels: int = 16
    hidden: int = 128

    @nn.compact
    def __call__(self, perception):
        x = nn.Dense(self.hidden)(perception)
        x = nn.relu(x)
        # Zero-initialize output layer
        delta = nn.Dense(
            self.channels,
            kernel_init=nn.initializers.zeros,
            bias_init=nn.initializers.zeros
        )(x)
        return delta

# Initialize
key = jax.random.PRNGKey(0)
model = UpdateNetwork()
dummy_input = jnp.zeros((1, 64, 64, 48))
params = model.init(key, dummy_input)
print(f"Parameters: {sum(p.size for p in jax.tree_util.tree_leaves(params)):,}")
```
:::

:::sidenote
The network has only ~8,000 parameters - tiny by modern standards! Yet it can learn to grow complex patterns. This is the power of local rules applied repeatedly.
:::

## Step 4: Stochastic Updates and Alive Masking

Two more pieces make NCAs work well:

### Stochastic Updates
Instead of updating all cells at once (which would require a global clock), each cell randomly decides whether to update. This makes the system more robust and removes grid artifacts.

### Alive Masking
We only want "living" cells to participate. A cell is considered alive if it or any neighbor has alpha > 0.1. Dead cells are forced to stay at zero.

:::codetabs
```python {title="PyTorch"}
def alive_mask(grid, threshold=0.1):
    """Determine which cells are alive.

    A cell is alive if any cell in its 3x3 neighborhood has alpha > threshold.
    This prevents isolated dead cells from spontaneously activating.
    """
    alpha = grid[:, 3:4, :, :]  # [B, 1, H, W]
    alive = F.max_pool2d(alpha, kernel_size=3, stride=1, padding=1)
    alive = (alive > threshold).float()
    return alive

def step(grid, update_net, sobel_x, sobel_y, identity, update_prob=0.5):
    """Perform one NCA update step."""
    # 1. Perceive neighborhood
    perception = perceive(grid, sobel_x, sobel_y, identity)

    # 2. Compute update
    delta = update_net(perception)  # [B, H, W, C]
    delta = delta.permute(0, 3, 1, 2)  # [B, C, H, W]

    # 3. Stochastic update mask (per-cell dropout)
    B, C, H, W = grid.shape
    update_mask = (torch.rand(B, 1, H, W, device=grid.device) < update_prob).float()

    # 4. Apply update
    grid = grid + delta * update_mask

    # 5. Alive masking
    mask = alive_mask(grid)
    grid = grid * mask

    return grid
```

```python {title="MLX"}
def alive_mask(grid, threshold=0.1):
    """Determine which cells are alive using 3x3 max pooling."""
    alpha = grid[..., 3:4]  # [B, H, W, 1]

    # Manual max pool over 3x3
    padded = mx.pad(alpha, [(0, 0), (1, 1), (1, 1), (0, 0)])

    # Gather all 9 neighbors
    neighbors = []
    for dy in range(3):
        for dx in range(3):
            neighbors.append(padded[:, dy:dy+grid.shape[1], dx:dx+grid.shape[2], :])

    stacked = mx.stack(neighbors, axis=-1)
    alive = mx.max(stacked, axis=-1) > threshold

    return alive.astype(mx.float32)

def step(grid, update_net, sobel_x, sobel_y, identity, update_prob=0.5):
    """Perform one NCA update step."""
    # 1. Perceive
    perception = perceive(grid, sobel_x, sobel_y, identity)

    # 2. Compute update
    delta = update_net(perception)

    # 3. Stochastic mask
    B, H, W, C = grid.shape
    mask = (mx.random.uniform(shape=(B, H, W, 1)) < update_prob).astype(mx.float32)

    # 4. Apply update
    grid = grid + delta * mask

    # 5. Alive masking
    alive = alive_mask(grid)
    grid = grid * alive

    return grid
```

```python {title="JAX"}
def alive_mask(grid, threshold=0.1):
    """Determine which cells are alive using 3x3 max pooling."""
    alpha = grid[..., 3:4]

    # Max pool via sliding window
    alive = lax.reduce_window(
        alpha,
        -jnp.inf,
        lax.max,
        window_dimensions=(1, 3, 3, 1),
        window_strides=(1, 1, 1, 1),
        padding='SAME'
    )
    alive = (alive > threshold).astype(jnp.float32)

    return alive

def step(grid, params, model, sobel_x, sobel_y, identity, key, update_prob=0.5):
    """Perform one NCA update step."""
    # 1. Perceive
    perception = perceive(grid, sobel_x, sobel_y, identity)

    # 2. Compute update
    delta = model.apply(params, perception)

    # 3. Stochastic mask
    B, H, W, C = grid.shape
    key, subkey = jax.random.split(key)
    mask = (jax.random.uniform(subkey, (B, H, W, 1)) < update_prob).astype(jnp.float32)

    # 4. Apply update
    grid = grid + delta * mask

    # 5. Alive masking
    alive = alive_mask(grid)
    grid = grid * alive

    return grid, key
```
:::

## Step 5: Training

Now we put it all together. The training loop:

1. Start from a seed cell
2. Run for N steps (randomly sampled between 64-96)
3. Compare RGBA channels to target image
4. Backpropagate through all steps
5. Update network weights

:::codetabs
```python {title="PyTorch"}
from PIL import Image
import torchvision.transforms as T

def load_target(path, size=40):
    """Load and preprocess target image.

    Premultiplies RGB by alpha for correct blending.
    """
    img = Image.open(path).convert('RGBA')
    img = img.resize((size, size), Image.LANCZOS)

    transform = T.ToTensor()
    target = transform(img)  # [4, H, W]

    # Premultiply RGB by alpha
    rgb = target[:3] * target[3:4]
    target = torch.cat([rgb, target[3:4]], dim=0)

    return target.unsqueeze(0)  # [1, 4, H, W]

def train_nca(update_net, target, steps=2000, lr=2e-3):
    """Train the NCA to grow a target pattern."""
    optimizer = torch.optim.Adam(update_net.parameters(), lr=lr)
    sobel_x, sobel_y, identity = get_sobel_kernels()

    device = next(update_net.parameters()).device
    target = target.to(device)
    sobel_x, sobel_y, identity = sobel_x.to(device), sobel_y.to(device), identity.to(device)

    # Pad target to 64x64 (centered)
    pad = (64 - target.shape[-1]) // 2
    target_padded = F.pad(target, (pad, pad, pad, pad))

    for step_i in range(steps):
        optimizer.zero_grad()

        # Random number of steps (prevents overfitting to specific step counts)
        n_steps = torch.randint(64, 96, (1,)).item()

        # Start from seed
        grid = create_seed(size=64, device=device)

        # Run simulation
        for _ in range(n_steps):
            grid = step(grid, update_net, sobel_x, sobel_y, identity)

        # Loss on RGBA channels only
        loss = F.mse_loss(grid[:, :4], target_padded)

        loss.backward()

        # Gradient normalization (important for stability)
        for p in update_net.parameters():
            if p.grad is not None:
                p.grad.data = p.grad.data / (p.grad.data.norm() + 1e-8)

        optimizer.step()

        if step_i % 100 == 0:
            print(f"Step {step_i}: loss = {loss.item():.6f}")

# Usage:
# target = load_target("emoji.png")
# train_nca(update_net, target)
```

```python {title="MLX"}
from PIL import Image
import numpy as np
import mlx.optimizers as optim

def load_target(path, size=40):
    """Load and preprocess target image."""
    img = Image.open(path).convert('RGBA')
    img = img.resize((size, size), Image.LANCZOS)

    arr = np.array(img, dtype=np.float32) / 255.0
    target = mx.array(arr)  # [H, W, 4]

    # Premultiply RGB by alpha
    rgb = target[..., :3] * target[..., 3:4]
    target = mx.concatenate([rgb, target[..., 3:4]], axis=-1)

    return mx.expand_dims(target, 0)  # [1, H, W, 4]

def train_nca(update_net, target, steps=2000, lr=2e-3):
    """Train the NCA to grow a target pattern."""
    optimizer = optim.Adam(learning_rate=lr)
    sobel_x, sobel_y, identity = get_sobel_kernels()

    # Pad target to 64x64
    pad = (64 - target.shape[1]) // 2
    target_padded = mx.pad(target, [(0, 0), (pad, pad), (pad, pad), (0, 0)])

    def loss_fn(model, grid, target):
        n_steps = int(mx.random.randint(64, 96, ()))

        for _ in range(n_steps):
            grid = step(grid, model, sobel_x, sobel_y, identity)

        return mx.mean((grid[..., :4] - target) ** 2)

    loss_and_grad = nn.value_and_grad(update_net, loss_fn)

    for step_i in range(steps):
        grid = create_seed(size=64)
        loss, grads = loss_and_grad(update_net, grid, target_padded)

        optimizer.update(update_net, grads)
        mx.eval(update_net.parameters())

        if step_i % 100 == 0:
            print(f"Step {step_i}: loss = {loss.item():.6f}")
```

```python {title="JAX"}
import optax
from PIL import Image
import numpy as np

def load_target(path, size=40):
    """Load and preprocess target image."""
    img = Image.open(path).convert('RGBA')
    img = img.resize((size, size), Image.LANCZOS)

    arr = np.array(img, dtype=np.float32) / 255.0
    target = jnp.array(arr)  # [H, W, 4]

    # Premultiply RGB by alpha
    rgb = target[..., :3] * target[..., 3:4]
    target = jnp.concatenate([rgb, target[..., 3:4]], axis=-1)

    return jnp.expand_dims(target, 0)

def train_nca(params, model, target, steps=2000, lr=2e-3):
    """Train the NCA to grow a target pattern."""
    optimizer = optax.adam(lr)
    opt_state = optimizer.init(params)
    sobel_x, sobel_y, identity = get_sobel_kernels()

    # Pad target
    pad = (64 - target.shape[1]) // 2
    target_padded = jnp.pad(target, [(0, 0), (pad, pad), (pad, pad), (0, 0)])

    @jax.jit
    def loss_fn(params, grid, key, n_steps):
        for _ in range(n_steps):
            grid, key = step(grid, params, model, sobel_x, sobel_y, identity, key)
        return jnp.mean((grid[..., :4] - target_padded) ** 2)

    @jax.jit
    def train_step(params, opt_state, key):
        grid = create_seed(size=64)
        key, subkey = jax.random.split(key)
        n_steps = jax.random.randint(subkey, (), 64, 96)

        loss, grads = jax.value_and_grad(loss_fn)(params, grid, key, n_steps)

        # Normalize gradients
        grads = jax.tree_util.tree_map(
            lambda g: g / (jnp.linalg.norm(g) + 1e-8), grads
        )

        updates, opt_state = optimizer.update(grads, opt_state, params)
        params = optax.apply_updates(params, updates)

        return params, opt_state, loss, key

    key = jax.random.PRNGKey(42)

    for step_i in range(steps):
        params, opt_state, loss, key = train_step(params, opt_state, key)

        if step_i % 100 == 0:
            print(f"Step {step_i}: loss = {loss:.6f}")

    return params
```
:::

## Step 6: Visualization

After training, let's watch the NCA grow:

:::codetabs
```python {title="PyTorch"}
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np

def visualize_growth(update_net, n_steps=200, save_path=None):
    """Generate and optionally save a growth animation."""
    sobel_x, sobel_y, identity = get_sobel_kernels()
    device = next(update_net.parameters()).device
    sobel_x, sobel_y, identity = sobel_x.to(device), sobel_y.to(device), identity.to(device)

    frames = []
    grid = create_seed(size=64, device=device)

    with torch.no_grad():
        for i in range(n_steps):
            grid = step(grid, update_net, sobel_x, sobel_y, identity)

            if i % 2 == 0:  # Save every other frame
                rgba = grid[0, :4].permute(1, 2, 0).cpu().numpy()
                rgba = np.clip(rgba, 0, 1)
                frames.append(rgba)

    # Create animation
    fig, ax = plt.subplots(figsize=(6, 6))
    ax.axis('off')

    im = ax.imshow(frames[0])

    def update(frame):
        im.set_array(frames[frame])
        return [im]

    anim = FuncAnimation(fig, update, frames=len(frames), interval=50, blit=True)

    if save_path:
        anim.save(save_path, writer='pillow')

    plt.show()
    return frames

# Usage:
# visualize_growth(update_net, save_path="nca_growth.gif")
```

```python {title="MLX"}
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np

def visualize_growth(update_net, n_steps=200, save_path=None):
    """Generate and optionally save a growth animation."""
    sobel_x, sobel_y, identity = get_sobel_kernels()

    frames = []
    grid = create_seed(size=64)

    for i in range(n_steps):
        grid = step(grid, update_net, sobel_x, sobel_y, identity)
        mx.eval(grid)

        if i % 2 == 0:
            rgba = np.array(grid[0, :, :, :4])
            rgba = np.clip(rgba, 0, 1)
            frames.append(rgba)

    # Create animation
    fig, ax = plt.subplots(figsize=(6, 6))
    ax.axis('off')

    im = ax.imshow(frames[0])

    def update(frame):
        im.set_array(frames[frame])
        return [im]

    anim = FuncAnimation(fig, update, frames=len(frames), interval=50, blit=True)

    if save_path:
        anim.save(save_path, writer='pillow')

    plt.show()
    return frames
```

```python {title="JAX"}
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np

def visualize_growth(params, model, n_steps=200, save_path=None):
    """Generate and optionally save a growth animation."""
    sobel_x, sobel_y, identity = get_sobel_kernels()

    frames = []
    grid = create_seed(size=64)
    key = jax.random.PRNGKey(0)

    for i in range(n_steps):
        grid, key = step(grid, params, model, sobel_x, sobel_y, identity, key)

        if i % 2 == 0:
            rgba = np.array(grid[0, :, :, :4])
            rgba = np.clip(rgba, 0, 1)
            frames.append(rgba)

    # Create animation
    fig, ax = plt.subplots(figsize=(6, 6))
    ax.axis('off')

    im = ax.imshow(frames[0])

    def update(frame):
        im.set_array(frames[frame])
        return [im]

    anim = FuncAnimation(fig, update, frames=len(frames), interval=50, blit=True)

    if save_path:
        anim.save(save_path, writer='pillow')

    plt.show()
    return frames
```
:::

## Full Scripts

Want to run everything at once? Here are complete, self-contained scripts:

:::details{title="Complete PyTorch Script"}
```python
"""
Neural Cellular Automata - PyTorch Implementation
Run: python nca_pytorch.py
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import torchvision.transforms as T
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np

# ============ Cell State ============
def create_seed(size=64, channels=16, device='cpu'):
    grid = torch.zeros(1, channels, size, size, device=device)
    center = size // 2
    grid[0, 3:, center, center] = 1.0
    return grid

# ============ Perception ============
def get_sobel_kernels(device='cpu'):
    sobel_x = torch.tensor([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=torch.float32, device=device) / 8.0
    sobel_y = sobel_x.T
    identity = torch.tensor([[0, 0, 0], [0, 1, 0], [0, 0, 0]], dtype=torch.float32, device=device)
    return sobel_x, sobel_y, identity

def perceive(grid, sobel_x, sobel_y, identity):
    B, C, H, W = grid.shape
    filters = torch.stack([identity, sobel_x, sobel_y]).unsqueeze(1).repeat(C, 1, 1, 1)
    filters = filters.view(C * 3, 1, 3, 3)
    grid_repeated = grid.repeat(1, 3, 1, 1)
    perception = F.conv2d(grid_repeated, filters, padding=1, groups=C * 3)
    return perception.permute(0, 2, 3, 1)

# ============ Update Network ============
class UpdateNetwork(nn.Module):
    def __init__(self, channels=16, hidden=128):
        super().__init__()
        self.fc1 = nn.Linear(channels * 3, hidden)
        self.fc2 = nn.Linear(hidden, channels)
        nn.init.zeros_(self.fc2.weight)
        nn.init.zeros_(self.fc2.bias)

    def forward(self, x):
        return self.fc2(torch.relu(self.fc1(x)))

# ============ Step Function ============
def alive_mask(grid, threshold=0.1):
    alpha = grid[:, 3:4, :, :]
    return (F.max_pool2d(alpha, 3, stride=1, padding=1) > threshold).float()

def step(grid, net, sobel_x, sobel_y, identity, update_prob=0.5):
    perception = perceive(grid, sobel_x, sobel_y, identity)
    delta = net(perception).permute(0, 3, 1, 2)
    mask = (torch.rand(1, 1, grid.shape[2], grid.shape[3], device=grid.device) < update_prob).float()
    grid = grid + delta * mask
    return grid * alive_mask(grid)

# ============ Training ============
def load_target(path, size=40, device='cpu'):
    img = Image.open(path).convert('RGBA').resize((size, size), Image.LANCZOS)
    target = T.ToTensor()(img).to(device)
    rgb = target[:3] * target[3:4]
    return torch.cat([rgb, target[3:4]], dim=0).unsqueeze(0)

def train(net, target_path, steps=2000, lr=2e-3):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    net = net.to(device)
    optimizer = torch.optim.Adam(net.parameters(), lr=lr)
    sobel_x, sobel_y, identity = get_sobel_kernels(device)

    target = load_target(target_path, device=device)
    pad = (64 - target.shape[-1]) // 2
    target_padded = F.pad(target, (pad, pad, pad, pad))

    for i in range(steps):
        optimizer.zero_grad()
        grid = create_seed(device=device)
        for _ in range(torch.randint(64, 96, (1,)).item()):
            grid = step(grid, net, sobel_x, sobel_y, identity)
        loss = F.mse_loss(grid[:, :4], target_padded)
        loss.backward()
        for p in net.parameters():
            if p.grad is not None:
                p.grad.data /= p.grad.data.norm() + 1e-8
        optimizer.step()
        if i % 100 == 0:
            print(f"Step {i}: loss = {loss.item():.6f}")

if __name__ == "__main__":
    net = UpdateNetwork()
    # train(net, "target.png")  # Uncomment with your target image
    print("NCA ready! Call train(net, 'your_image.png') to train.")
```
:::

:::details{title="Complete MLX Script"}
```python
"""
Neural Cellular Automata - MLX Implementation (Apple Silicon)
Run: python nca_mlx.py
"""
import mlx.core as mx
import mlx.nn as nn
import mlx.optimizers as optim
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# ============ Cell State ============
def create_seed(size=64, channels=16):
    grid = mx.zeros((1, size, size, channels))
    center = size // 2
    grid = grid.at[0, center, center, 3:].set(1.0)
    return grid

# ============ Perception ============
def get_sobel_kernels():
    sobel_x = mx.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=mx.float32) / 8.0
    sobel_y = sobel_x.T
    identity = mx.array([[0, 0, 0], [0, 1, 0], [0, 0, 0]], dtype=mx.float32)
    return sobel_x, sobel_y, identity

def perceive(grid, sobel_x, sobel_y, identity):
    B, H, W, C = grid.shape
    filters = mx.stack([identity, sobel_x, sobel_y], axis=-1)
    filters = mx.expand_dims(filters, axis=2)
    filters = mx.tile(filters, (1, 1, C, 1))
    perception = mx.conv2d(grid, filters, padding=1, groups=C)
    return perception.reshape(B, H, W, C * 3)

# ============ Update Network ============
class UpdateNetwork(nn.Module):
    def __init__(self, channels=16, hidden=128):
        super().__init__()
        self.fc1 = nn.Linear(channels * 3, hidden)
        self.fc2 = nn.Linear(hidden, channels)
        self.fc2.weight = mx.zeros_like(self.fc2.weight)
        self.fc2.bias = mx.zeros_like(self.fc2.bias)

    def __call__(self, x):
        return self.fc2(nn.relu(self.fc1(x)))

# ============ Step Function ============
def alive_mask(grid, threshold=0.1):
    alpha = grid[..., 3:4]
    padded = mx.pad(alpha, [(0, 0), (1, 1), (1, 1), (0, 0)])
    neighbors = []
    for dy in range(3):
        for dx in range(3):
            neighbors.append(padded[:, dy:dy+grid.shape[1], dx:dx+grid.shape[2], :])
    return (mx.max(mx.stack(neighbors, axis=-1), axis=-1) > threshold).astype(mx.float32)

def step(grid, net, sobel_x, sobel_y, identity, update_prob=0.5):
    perception = perceive(grid, sobel_x, sobel_y, identity)
    delta = net(perception)
    mask = (mx.random.uniform(shape=(1, grid.shape[1], grid.shape[2], 1)) < update_prob).astype(mx.float32)
    grid = grid + delta * mask
    return grid * alive_mask(grid)

# ============ Training ============
def load_target(path, size=40):
    img = Image.open(path).convert('RGBA').resize((size, size), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    target = mx.array(arr)
    rgb = target[..., :3] * target[..., 3:4]
    return mx.expand_dims(mx.concatenate([rgb, target[..., 3:4]], axis=-1), 0)

def train(net, target_path, steps=2000, lr=2e-3):
    optimizer = optim.Adam(learning_rate=lr)
    sobel_x, sobel_y, identity = get_sobel_kernels()
    target = load_target(target_path)
    pad = (64 - target.shape[1]) // 2
    target_padded = mx.pad(target, [(0, 0), (pad, pad), (pad, pad), (0, 0)])

    def loss_fn(net):
        grid = create_seed()
        for _ in range(int(mx.random.randint(64, 96, ()))):
            grid = step(grid, net, sobel_x, sobel_y, identity)
        return mx.mean((grid[..., :4] - target_padded) ** 2)

    loss_and_grad = nn.value_and_grad(net, loss_fn)

    for i in range(steps):
        loss, grads = loss_and_grad(net)
        optimizer.update(net, grads)
        mx.eval(net.parameters())
        if i % 100 == 0:
            print(f"Step {i}: loss = {loss.item():.6f}")

if __name__ == "__main__":
    net = UpdateNetwork()
    print("NCA ready! Call train(net, 'your_image.png') to train.")
```
:::

:::details{title="Complete JAX Script"}
```python
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
    B, H, W, C = grid.shape
    filters = jnp.stack([identity, sobel_x, sobel_y], axis=-1)
    filters = jnp.expand_dims(filters, axis=2)

    def convolve_channel(channel):
        return lax.conv(channel[..., None], filters, (1, 1), 'SAME')

    channels = jnp.transpose(grid, (3, 0, 1, 2))
    perceptions = jax.vmap(convolve_channel)(channels)
    perceptions = jnp.transpose(perceptions, (1, 2, 3, 0, 4))
    return perceptions.reshape(B, H, W, C * 3)

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
    grid = grid + delta * mask
    return grid * alive_mask(grid), key

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
            for _ in range(n_steps):
                grid, k = step(grid, params, model, sobel_x, sobel_y, identity, k)
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
    model = UpdateNetwork()
    print("NCA ready! Call train(model, 'your_image.png') to train.")
```
:::

## Troubleshooting

### Loss becomes NaN
This usually means gradients exploded. Solutions:
- Ensure you're normalizing gradients (dividing by norm + epsilon)
- Try a lower learning rate (e.g., 1e-3 instead of 2e-3)
- Check that your target image has proper alpha values

### Pattern doesn't form
- Verify the seed is correctly placed (alpha and hidden channels = 1.0)
- Make sure the target image is centered in the padded grid
- Try training for more steps

### Pattern explodes or fills the grid
- Check the alive masking - cells should die when neighbors have low alpha
- Ensure the output layer is zero-initialized
- The alive threshold (0.1) may need adjustment

### Training is slow
- Use GPU if available (CUDA for PyTorch, Metal for MLX)
- Reduce grid size during experimentation (32x32 trains faster)
- Use fewer steps per training iteration

## What's Next?

You now have a working NCA! Here are some directions to explore:

### Pool-Based Training
The basic training above can be unstable - patterns may not persist. The original paper uses a "sample pool" technique where you save intermediate states and resume training from them, teaching the NCA to maintain patterns over time.

### Regeneration Training
To make NCAs that can repair damage (like the demo at the top of this article), randomly erase parts of the pattern during training. This forces the network to learn how to regrow missing sections.

### 3D and Beyond
NCAs work in any dimension. Try implementing a 3D NCA that grows voxel structures, or experiment with different neighborhood shapes.

## Further Resources

- [Original Colab Notebook](https://colab.research.google.com/github/google-research/self-organising-systems/blob/master/notebooks/growing_ca.ipynb) - The official notebook from the paper authors
- [Growing Neural Cellular Automata](https://distill.pub/2020/growing-ca/) - The original Distill article with interactive demos
- [Self-Organizing Textures](https://distill.pub/selforg/2021/textures/) - NCAs for texture synthesis
- [Differentiable Self-organizing Systems Thread](https://distill.pub/2020/selforg/) - More advanced topics

---

## References

Mordvintsev, A., Randazzo, E., Niklasson, E., & Levin, M. (2020). Growing Neural Cellular Automata. *Distill*. [https://doi.org/10.23915/distill.00023](https://doi.org/10.23915/distill.00023)
