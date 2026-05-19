export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center">
      <div className="flex items-center gap-3 text-fg-muted">
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse [animation-delay:120ms]" />
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse [animation-delay:240ms]" />
      </div>
    </div>
  );
}
