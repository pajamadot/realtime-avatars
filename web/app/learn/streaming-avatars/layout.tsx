import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Streaming Avatars — Learn | Real-Time Avatars',
  description:
    'Understand streaming avatar infrastructure: WebRTC delivery, LiveKit agents, avatar provider APIs, and production deployment patterns.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
