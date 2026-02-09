export default function Loading() {
  return (
    <div className="min-h-screen relative">
      <div className="paper-texture fixed inset-0" />
      <div className="mx-auto max-w-4xl px-6 py-12 relative">
        <div className="space-y-4 animate-fade-in">
          <div className="skeleton h-4 w-48 rounded" />
          <div className="skeleton h-10 w-96 rounded" />
          <div className="skeleton h-6 w-full max-w-lg rounded" />
          <div className="skeleton h-6 w-full max-w-md rounded" />
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
