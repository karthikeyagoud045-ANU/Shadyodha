"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/feedback";
import { simulationService } from "@/services/simulationService";
import type { SimulationParams, SimulationResult } from "@/types";

const DEFAULT: SimulationParams = {
  patientsPerDay: 180,
  cameras: 2,
  aiSeconds: 8,
  ophthalmologists: 1,
  reviewSeconds: 180,
  bandwidthMbps: 2,
  referableRate: 22,
};

export default function SimulationPage() {
  const [p, setP] = useState(DEFAULT);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const mut = useMutation({ mutationFn: simulationService.run, onSuccess: setResult });
  const live = useMemo(() => result, [result]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Resource Simulation — District Screening Program</h1>
        <p className="text-sm text-ink-500">Tune camp capacity. Metrics update when you run the model.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4 rounded-2xl border border-ink-200 bg-white p-5">
          <Slider label="Patients per day" min={50} max={500} value={p.patientsPerDay} onChange={(patientsPerDay) => setP({ ...p, patientsPerDay })} />
          <Slider label="Fundus cameras" min={1} max={5} value={p.cameras} onChange={(cameras) => setP({ ...p, cameras })} />
          <Slider label="AI processing (sec)" min={3} max={15} value={p.aiSeconds} onChange={(aiSeconds) => setP({ ...p, aiSeconds })} />
          <Slider label="Ophthalmologists" min={1} max={4} value={p.ophthalmologists} onChange={(ophthalmologists) => setP({ ...p, ophthalmologists })} />
          <Slider label="Review time (sec)" min={60} max={300} step={10} value={p.reviewSeconds} onChange={(reviewSeconds) => setP({ ...p, reviewSeconds })} />
          <Slider label="Bandwidth (Mbps)" min={0.5} max={10} step={0.5} value={p.bandwidthMbps} onChange={(bandwidthMbps) => setP({ ...p, bandwidthMbps })} />
          <Slider label="Referable rate (%)" min={10} max={35} value={p.referableRate} onChange={(referableRate) => setP({ ...p, referableRate })} />
          <Button className="w-full" loading={mut.isPending} onClick={() => mut.mutate(p)}>▶ Run Simulation</Button>
        </div>
        <div className="space-y-4">
          {live && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Daily Throughput", live.dailyThroughput],
                  ["Avg Wait (min)", live.averageWaitMinutes],
                  ["Referral Backlog", live.referralBacklog],
                  ["AI Utilization", `${Math.round(live.aiUtilization * 100)}%`],
                  ["Doctor Utilization", `${Math.round(live.doctorUtilization * 100)}%`],
                ].map(([k, v]) => (
                  <div key={String(k)} className="rounded-2xl border border-ink-200 bg-white p-4">
                    <p className="text-xs text-ink-500">{k}</p>
                    <p className="text-2xl font-semibold tabular-nums">{v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-ink-900 p-5 text-white">
                <p className="text-xs uppercase tracking-wider text-white/50">Bottleneck identified</p>
                <p className="mt-2 font-semibold">{live.bottleneck}</p>
                <p className="mt-2 text-sm text-white/70">{live.recommendation}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-64 rounded-2xl border border-ink-200 bg-white p-3">
                  <p className="mb-2 text-sm font-medium">Queue length over time</p>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={live.queue}>
                      <CartesianGrid stroke="#E4E4E7" />
                      <XAxis dataKey="hour" stroke="#71717A" fontSize={11} />
                      <YAxis stroke="#71717A" fontSize={11} />
                      <Tooltip />
                      <Area dataKey="length" stroke="#0A0A0A" fill="#D4D4D8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-64 rounded-2xl border border-ink-200 bg-white p-3">
                  <p className="mb-2 text-sm font-medium">Resource utilization</p>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={live.utilization}>
                      <CartesianGrid stroke="#E4E4E7" />
                      <XAxis dataKey="name" stroke="#71717A" fontSize={11} />
                      <YAxis stroke="#71717A" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#18181B" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="h-56 rounded-2xl border border-ink-200 bg-white p-3">
                <p className="mb-2 text-sm font-medium">Patient flow</p>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={live.flow} layout="vertical">
                    <CartesianGrid stroke="#E4E4E7" />
                    <XAxis type="number" stroke="#71717A" fontSize={11} />
                    <YAxis type="category" dataKey="stage" stroke="#71717A" fontSize={11} width={90} />
                    <Tooltip />
                    <Bar dataKey="patients" fill="#3F3F46" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          {!live && <p className="rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-500">Run the simulation to see throughput, wait time and bottlenecks.</p>}
        </div>
      </div>
    </div>
  );
}
