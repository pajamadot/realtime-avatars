'use client';

export default function ShareButton() {
  const onClick = async () => {
    const data = {
      title: 'Real-Time Avatar Systems: A Comparative Analysis',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(data.url);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="badge hover:border-[var(--border-strong)] text-xs"
      aria-label="Share this page"
    >
      Share
    </button>
  );
}
