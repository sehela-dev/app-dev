export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center font-serif">
      <h2 className="text-2xl font-bold text-brand-500">Page not found</h2>
      <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
    </div>
  );
}
