"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";

type Stats = {
  totalUpcoming: number;
  totalPast: number;
  uniquePatients: number;
  statusDistribution: { name: string; value: number }[];
  appointmentsByDay: { date: string; appointments: number }[];
};

export default function DoctorDashboardClient({ stats }: { stats: Stats }) {
  // Safe defaults if API hasn't resolved
  const safeStats = stats || {
    totalUpcoming: 0,
    totalPast: 0,
    uniquePatients: 0,
    statusDistribution: [],
    appointmentsByDay: [],
  };

  const COLORS = ["#0d9488", "#f59e0b", "#3b82f6", "#ef4444"]; // Teal, Amber, Blue, Red

  return (
    <div className="space-y-8">
      
      {/* Top Graphic KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Patients */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-bl-full -z-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Unique Patients</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {safeStats.uniquePatients}
                  </h3>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/20 rounded-bl-full -z-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Upcoming Visits</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {safeStats.totalUpcoming}
                  </h3>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center border border-teal-100 dark:border-teal-800/50">
                <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Past / Consulted */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-bl-full -z-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Completed Visits</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {safeStats.totalPast}
                  </h3>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pulse Status */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 h-full flex flex-col justify-center gap-3">
             <div className="flex items-center gap-3">
               <div className="relative flex h-5 w-5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-5 w-5 bg-teal-500"></span>
               </div>
               <span className="font-semibold text-zinc-700 dark:text-zinc-200">System Active</span>
             </div>
             <p className="text-sm text-zinc-500">Your portal is up to date.</p>
          </CardContent>
        </Card>

      </div>

      {/* Visual Analytics */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* 7-Day Trend Bar Chart */}
        <Card className="md:col-span-4 lg:col-span-5 border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">7-Day Appointment Projection</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-4">
            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={safeStats.appointmentsByDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(20, 184, 166, 0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(24, 24, 27, 0.95)', color: '#fff' }}
                  />
                  <Bar 
                    dataKey="appointments" 
                    fill="#0d9488" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="md:col-span-3 lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {safeStats.statusDistribution.length > 0 ? (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={safeStats.statusDistribution.map((entry, index) => ({
                        ...entry,
                        fill: COLORS[index % COLORS.length]
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {safeStats.statusDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                       <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-zinc-500 text-sm italic">
                No active data points
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
