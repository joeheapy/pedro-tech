interface NavBarProps {
  Tokens: number
  error?: string | null
  onReset: () => void
}

export function TokenControls({ Tokens, error, onReset }: NavBarProps) {
  return (
    <div className="fixed right-4 top-20 z-40">
      <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tokens:</span>
          <span className="font-semibold text-foreground">{Tokens}</span>
          {error && <span className="text-destructive text-sm">{error}</span>}
        </div>
        <button
          onClick={onReset}
          className="px-2 py-1 text-sm text-foreground bg-foreground/40 hover:bg-foreground/20 rounded transition-colors"
        >
          Reset Tokens
        </button>
      </div>
    </div>
  )
}
