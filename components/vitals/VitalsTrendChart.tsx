"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { HeartPulse, ShieldAlert, Thermometer } from "lucide-react";

type VitalRecord = {
  id: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bpString: string;
  heartRate: number;
  spO2: number;
  temperatureCelsius: number;
  recordedAt: Date | string | null;
  isAbnormalBP: boolean;
  isAbnormalSpO2: boolean;
  isFever: boolean;
};

export default function VitalsTrendChart({ history }: { history: VitalRecord[] }) {
  if (!history || history.length === 0) {
    return (
      <Card className="border-dashed bg-zinc-50/50 dark:bg-zinc-900/50 shadow-none border-zinc-200 dark:border-zinc-800">
        <CardContent className="py-12 text-center text-zinc-500 text-sm italic">
          No longitudinal vital signs recorded for this patient yet.
        </CardContent>
      </Card>
    );
  }

  // Format data for Recharts (reverse to show chronological left-to-right)
  const chartData = [...history].reverse().map((v) => ({
    date: v.recordedAt
      ? new Date(v.recordedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      : "Unknown",
    systolic: v.bloodPressureSystolic,
    diastolic: v.bloodPressureDiastolic,
    heartRate: v.heartRate,
    spO2: v.spO2,
    temp: v.temperatureCelsius,
  }));

  const latest = history[0];

  return (
    <div className="space-y-6">
      {/* Latest Vitals KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Blood Pressure */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${latest.isAbnormalBP ? "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Blood Pressure</span>
            <HeartPulse className={`h-4 w-4 ${latest.isAbnormalBP ? "text-rose-600" : "text-teal-600"}`} />
          </div>
          <div className="mt-2">
            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{latest.bpString} <span className="text-xs font-normal text-zinc-500">mmHg</span></h4>
            {latest.isAbnormalBP && (
              <Badge className="mt-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px]">HIGH BP</Badge>
            )}
          </div>
        </div>

        {/* Heart Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Heart Rate</span>
            <HeartPulse className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{latest.heartRate} <span className="text-xs font-normal text-zinc-500">bpm</span></h4>
          </div>
        </div>

        {/* SpO2 */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${latest.isAbnormalSpO2 ? "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">SpO2 Oxygen</span>
            <ShieldAlert className={`h-4 w-4 ${latest.isAbnormalSpO2 ? "text-rose-600" : "text-blue-600"}`} />
          </div>
          <div className="mt-2">
            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{latest.spO2}%</h4>
            {latest.isAbnormalSpO2 && (
              <Badge className="mt-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px]">LOW SpO2</Badge>
            )}
          </div>
        </div>

        {/* Body Temperature */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${latest.isFever ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Temperature</span>
            <Thermometer className={`h-4 w-4 ${latest.isFever ? "text-amber-600" : "text-emerald-600"}`} />
          </div>
          <div className="mt-2">
            <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{latest.temperatureCelsius}°C</h4>
            {latest.isFever && (
              <Badge className="mt-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">FEVER</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Longitudinal Recharts Trend Line Graph */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-rose-500" />
            Longitudinal Vitals Trend (Last 20 Observations)
          </CardTitle>
          <CardDescription>Tracks Systolic/Diastolic Blood Pressure, Heart Rate, and Oxygen Saturation over time.</CardDescription>
        </CardHeader>
        <CardContent className="pl-0 pb-4">
          <div className="w-full">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(24, 24, 27, 0.95)', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="systolic" name="Systolic BP (mmHg)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic BP (mmHg)" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="spO2" name="SpO2 (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
