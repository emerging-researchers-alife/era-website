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
    grid[0, center, center, 3:] = 1.0
    return grid

# ============ Perception ============
def get_sobel_kernels():
    sobel_x = mx.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=mx.float32) / 8.0
    sobel_y = sobel_x.T
    identity = mx.array([[0, 0, 0], [0, 1, 0], [0, 0, 0]], dtype=mx.float32)
    return sobel_x, sobel_y, identity

def perceive(grid, sobel_x, sobel_y, identity):
    """MLX weights use [output_channels, height, width, input_channels/group]."""
    channels = grid.shape[-1]
    filters = mx.stack([identity, sobel_x, sobel_y], axis=0)[..., None]
    filters = mx.tile(filters, (channels, 1, 1, 1))
    return mx.conv2d(grid, filters, padding=1, groups=channels)
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
    pre_alive = alive_mask(grid)
    grid = grid + delta * mask
    return grid * pre_alive * alive_mask(grid)

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
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--target', default='target.png')
    parser.add_argument('--steps', type=int, default=2000)
    args = parser.parse_args()
    net = UpdateNetwork()
    train(net, args.target, steps=args.steps)
    net.save_weights('nca-mlx.safetensors')
    print('Saved weights. A finite loss verifies execution, not successful growth.')

