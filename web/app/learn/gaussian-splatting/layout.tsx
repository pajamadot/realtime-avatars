import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gaussian Splatting — Learn | Real-Time Avatars',
  description:
    'Learn 3D Gaussian Splatting for real-time photorealistic avatars: training, rasterization, alpha blending, and drivable Gaussian representations.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
