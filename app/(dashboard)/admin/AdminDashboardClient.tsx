"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, CalendarDays, Building2, BriefcaseMedical, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
} from "recharts";

type Stats = {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalDepartments: number;
  appointmentsByDay: { date: string; appointments: number }[];
  departmentDistribution: { name: string; value: number }[];
};

export default function AdminDashboardClient({ stats }: { stats: Stats }) {
  const safeStats = stats || {
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalDepartments: 0,
    appointmentsByDay: [],
    departmentDistribution: [],
  };

  const COLORS = ["#0ea5e9", "#14b8a6", "#8b5cf6", "#f59e0b", "#ec4899", "#3b82f6"];

  return (
    <div className="space-y-8 mt-10">
      
      {/* Top Graphic KPIs */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        
        {/* Total Patients */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-bl-full -z-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Patients</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {safeStats.totalPatients}
                  </h3>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Staff / Doctors */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/20 rounded-bl-full -z-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Medical Staff</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {safeStats.totalDoctors}
                  </h3>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center border border-teal-100 dark:border-teal-800/50">
                <Stethoscope className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Appointments Volume */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 dark:bg-violet-500/20 rounded-bl-full -z-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Visits</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {safeStats.totalAppointments}
                  </h3>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center border border-violet-100 dark:border-violet-800/50">
                <CalendarDays className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Departments */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/20 rounded-bl-full -z-10" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Departments</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {safeStats.totalDepartments}
                  </h3>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center border border-amber-100 dark:border-amber-800/50">
                <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Visual Analytics Row */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* System 7-Day Network Load */}
        <Card className="md:col-span-4 lg:col-span-5 border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
               <TrendingUp className="h-5 w-5 text-violet-600" />
               Hospital Trajectory (Next 7 Days)
            </CardTitle>
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
                    cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(24, 24, 27, 0.95)', color: '#fff' }}
                  />
                  <Bar 
                    dataKey="appointments" 
                    fill="#8b5cf6" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Global Department Traffic */}
        <Card className="md:col-span-3 lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <BriefcaseMedical className="h-5 w-5 text-teal-600" />
              Department Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            {safeStats.departmentDistribution.length > 0 ? (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={safeStats.departmentDistribution.map((entry, index) => ({
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
                <div className="flex flex-wrap justify-center gap-4 mt-2 max-h-[80px] overflow-y-auto">
                  {safeStats.departmentDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                       <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-zinc-500 text-sm italic">
                No active department data
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
