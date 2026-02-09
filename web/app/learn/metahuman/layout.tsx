import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MetaHuman Pipeline — Learn | Real-Time Avatars',
  description:
    'Deep dive into Unreal Engine MetaHuman pipeline: rigging, blendshapes, Live Link face tracking, and real-time rendering at 60+ FPS.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
