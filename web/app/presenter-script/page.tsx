import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import {
  PRESENTATION_BASE_URL,
  PRESENTER_SLIDE_COUNT,
  encodeSlideToken,
} from '../presenter-script-6f2a9c17/_shared';
import { PRESENTER_SCRIPTS } from '../presenter-script-6f2a9c17/scripts';

const PUBLIC_PRESENTER_ROUTE = '/presenter-script';

export const metadata: Metadata = {
  title: 'Presenter Script',
};

export default function PresenterScriptPage() {
  return (
    <main className="min-h-screen bg-[#111110] text-[#f5f2ec] px-6 py-8 md:px-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Presenter Script</h1>
        <p className="text-sm text-[#bdb8af] mb-4">
          Per-slide word-for-word script with encoded slide URLs.
        </p>

        <div className="rounded-xl border border-[#3d3a36] bg-[#1d1c1a] p-4 mb-6">
          <p className="text-xs text-[#c7c2b9] mb-2">
            Route:
            {' '}
            <code className="text-[#f5f2ec]">{PUBLIC_PRESENTER_ROUTE}</code>
          </p>
          <p className="text-xs text-[#c7c2b9] mb-2">
            Slide count:
            {' '}
            <code className="text-[#f5f2ec]">{PRESENTER_SLIDE_COUNT}</code>
          </p>
          <p className="text-xs text-[#948d82]">
            Encoded links use token format <code>slide:&lt;number&gt;:v1</code> encoded as base64url.
          </p>
        </div>

        <div className="space-y-4">
          {PRESENTER_SCRIPTS.map((entry) => {
            const token = encodeSlideToken(entry.slide);
            const encodedPath = `${PUBLIC_PRESENTER_ROUTE}/s/${token}`;
            const encodedAbsoluteUrl = `${PRESENTATION_BASE_URL}${encodedPath}`;
            const directSlideUrl = `${PRESENTATION_BASE_URL}/slides/${entry.slide}`;

            return (
              <article key={entry.slide} className="rounded-xl border border-[#3d3a36] bg-[#1d1c1a] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h2 className="text-lg font-semibold">
                    Slide
                    {' '}
                    {entry.slide}
                    {': '}
                    {entry.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={encodedPath}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3d3a36] text-xs font-semibold text-[#f5f2ec] hover:bg-[#242220] transition-colors"
                    >
                      Open Encoded
                      <ExternalLink size={12} />
                    </Link>
                    <Link
                      href={`/slides/${entry.slide}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3d3a36] text-xs font-semibold text-[#f5f2ec] hover:bg-[#242220] transition-colors"
                    >
                      Open Direct
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>

                <p className="text-sm text-[#f5f2ec] leading-relaxed mb-3">{entry.script}</p>

                <div className="space-y-1">
                  <p className="text-[11px] text-[#bdb8af]">
                    Encoded URL:
                    {' '}
                    <code className="text-[#f5f2ec] break-all">{encodedAbsoluteUrl}</code>
                  </p>
                  <p className="text-[11px] text-[#948d82]">
                    Direct URL:
                    {' '}
                    <code className="text-[#c7c2b9] break-all">{directSlideUrl}</code>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

