"""
Neural Cellular Automata - PyTorch Implementation
Run: python nca_pytorch.py
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
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
    """Apply identity, x-gradient, and y-gradient independently to each channel."""
    channels = grid.shape[1]
    filters = torch.stack([identity, sobel_x, sobel_y]).unsqueeze(1)
    filters = filters.repeat(channels, 1, 1, 1).to(grid.device)
    return F.conv2d(grid, filters, padding=1, groups=channels).permute(0, 2, 3, 1)
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
    pre_alive = alive_mask(grid)
    grid = grid + delta * mask
    return grid * pre_alive * alive_mask(grid)

# ============ Training ============
def load_target(path, size=40, device='cpu'):
    img = Image.open(path).convert('RGBA').resize((size, size), Image.LANCZOS)
    target = torch.from_numpy(np.asarray(img, dtype=np.float32).copy() / 255.0).permute(2, 0, 1).to(device)
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
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--target', default='target.png')
    parser.add_argument('--steps', type=int, default=2000)
    args = parser.parse_args()
    net = UpdateNetwork()
    train(net, args.target, steps=args.steps)
    torch.save(net.state_dict(), 'nca-pytorch.pt')
    print('Saved weights. A finite loss verifies execution, not successful growth.')

