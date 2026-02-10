import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Generation — Learn | Real-Time Avatars',
  description:
    'Explore diffusion-based generative video and streaming avatar infrastructure for real-time talking head synthesis.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
