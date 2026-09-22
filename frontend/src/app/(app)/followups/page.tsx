"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PriorityMark, StatusBadge } from "@/components/SeverityBadge";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { followupService } from "@/services/followupService";
import type { FollowUp } from "@/types";
import { cn } from "@/lib/utils";

function Section({ title, items, onAct }: { title: string; items: FollowUp[]; onAct: (id: string, s: FollowUp["status"], date?: string) => void }) {
  if (!items.length) return <EmptyState title={`No ${title.toLowerCase()}.`} />;
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((f) => (
          <div key={f.id} className={cn("rounded-2xl border bg-white p-5", f.status === "overdue" ? "border-ink-400" : "border-ink-200")}>
            <div className="flex justify-between">
              <p className="font-semibold">{f.patientName}</p>
              <PriorityMark priority={f.priority} />
            </div>
            <p className="text-sm text-ink-500">{f.date} · {f.doctor}</p>
            <div className="mt-2"><StatusBadge status={f.status} /></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onAct(f.id, "upcoming", f.date)}>Schedule</Button>
              <Button size="sm" variant="outline" onClick={() => onAct(f.id, "upcoming", new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))}>Reschedule</Button>
              <Button size="sm" onClick={() => onAct(f.id, "completed")}>Mark Complete</Button>
              <Button size="sm" variant="subtle" onClick={() => onAct(f.id, "overdue")}>Escalate</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FollowupsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["followups"], queryFn: followupService.list });
  const mut = useMutation({
    mutationFn: ({ id, status, date }: { id: string; status: FollowUp["status"]; date?: string }) =>
      followupService.update(id, status, date),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["followups"] }),
  });
  if (q.isLoading) return <Spinner className="mx-auto mt-20 h-8 w-8" />;
  const items = q.data ?? [];
  const act = (id: string, status: FollowUp["status"], date?: string) => mut.mutate({ id, status, date });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Follow-ups</h1>
      <Section title="Upcoming Follow-ups" items={items.filter((i) => i.status === "upcoming")} onAct={act} />
      <Section title="Overdue" items={items.filter((i) => i.status === "overdue")} onAct={act} />
      <Section title="Completed" items={items.filter((i) => i.status === "completed")} onAct={act} />
    </div>
  );
}
