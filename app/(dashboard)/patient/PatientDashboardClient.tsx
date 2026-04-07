"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Stethoscope, BriefcaseMedical } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
} from "recharts";

type Stats = {
  totalVisits: number;
  uniqueDoctors: number;
  departmentDistribution: { name: string; value: number }[];
};

export default function PatientDashboardClient({ stats }: { stats: Stats }) {
  const safeStats = stats || {
    totalVisits: 0,
    uniqueDoctors: 0,
    departmentDistribution: [],
  };

  const COLORS = ["#0d9488", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"];

  return (
    <div className="space-y-8 mt-10">
      
      {/* Top Graphic KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Total Appointments Lifetime */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/20 rounded-bl-full -z-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Consultations</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {safeStats.totalVisits}
                  </h3>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center border border-teal-100 dark:border-teal-800/50">
                <Activity className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unique Specialists */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-bl-full -z-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Specialists Visited</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {safeStats.uniqueDoctors}
                  </h3>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status Pulse */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 h-full flex flex-col justify-center gap-3">
             <div className="flex items-center gap-3">
               <div className="relative flex h-5 w-5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500"></span>
               </div>
               <span className="font-semibold text-zinc-700 dark:text-zinc-200">System Active</span>
             </div>
             <p className="text-sm text-zinc-500">Records securely synchronized.</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Distribution Pie Chart */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm h-[380px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <BriefcaseMedical className="h-5 w-5 text-teal-600" />
              Department Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-6">
            {safeStats.departmentDistribution.length > 0 ? (
              <div className="h-full flex items-center gap-6">
                <div className="w-1/2 flex items-center justify-center -ml-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={safeStats.departmentDistribution.map((entry, index) => ({
                          ...entry,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend */}
                <div className="w-1/2 flex flex-col justify-center gap-3 pr-2">
                  {safeStats.departmentDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                         <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 truncate">{entry.name}</span>
                       </div>
                       <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-center min-w-[28px]">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm italic bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                You haven't visited any departments yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
