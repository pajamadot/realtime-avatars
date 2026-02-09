import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generative Video Models — Learn | Real-Time Avatars',
  description:
    'Explore diffusion and transformer-based generative video for talking head synthesis: distillation, autoregressive streaming, and avatar forcing.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
