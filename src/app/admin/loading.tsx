import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded-full bg-subtle" />
          <div className="h-8 w-64 rounded-xl bg-subtle" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-subtle px-4 py-2 text-xs font-semibold text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
          Memuat data...
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-3xl bg-subtle/80" />
        <div className="h-48 rounded-3xl bg-subtle/80" />
        <div className="h-48 rounded-3xl bg-subtle/80" />
        <div className="h-48 rounded-3xl bg-subtle/80" />
      </div>
    </div>
  );
}
