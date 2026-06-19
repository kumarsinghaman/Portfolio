export function TechTag({ children }: { children: string }) {
  return (
    <span className="inline-block rounded border border-border bg-surface/50 px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent">
      {children}
    </span>
  )
}
