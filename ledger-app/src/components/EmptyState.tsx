export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
      </div>
      <p className="text-sm font-medium text-on-surface">{title}</p>
      <p className="text-xs text-on-surface-variant mt-1 max-w-[220px]">{subtitle}</p>
    </div>
  )
}
