import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'End-to-End Pipeline — Learn | Real-Time Avatars',
  description:
    'Build a complete real-time avatar system end-to-end: voice capture, speech processing, LLM reasoning, text-to-speech, and avatar rendering.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
