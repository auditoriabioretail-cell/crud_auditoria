"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, CheckCircle, XCircle, Clock } from "lucide-react";

const stats = [
  {
    title: "Total Inconsistencias",
    icon: FileWarning,
    color: "from-blue-500 to-blue-600",
    key: "total",
  },
  {
    title: "Aplican",
    icon: CheckCircle,
    color: "from-emerald-500 to-emerald-600",
    key: "aplican",
  },
  {
    title: "No Aplican",
    icon: XCircle,
    color: "from-red-500 to-red-600",
    key: "noAplican",
  },
  {
    title: "Pendientes",
    icon: Clock,
    color: "from-yellow-500 to-yellow-600",
    key: "pendientes",
  },
];

export default function DashboardPage() {
  const { data: statsData } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/inconsistencias?limit=1000");
      const json = await res.json();
      const items = json.data || [];
      
      return {
        total: json.pagination?.total || 0,
        aplican: items.filter((i: any) => i.aplicaInconsistencia === true).length,
        noAplican: items.filter((i: any) => i.aplicaInconsistencia === false).length,
        pendientes: items.filter((i: any) => i.aplicaInconsistencia === null).length,
      };
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de auditoría
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass border-border/50 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statsData?.[stat.key as keyof typeof statsData] ?? "-"}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/inconsistencias"
              className="p-4 rounded-xl bg-accent/50 hover:bg-accent transition-colors group"
            >
              <FileWarning className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Revisar Inconsistencias</h3>
              <p className="text-sm text-muted-foreground">
                Ver y editar registros
              </p>
            </a>
            <a
              href="/dashboard/inconsistencias?aplicaInconsistencia=true"
              className="p-4 rounded-xl bg-accent/50 hover:bg-accent transition-colors group"
            >
              <CheckCircle className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Inconsistencias Válidas</h3>
              <p className="text-sm text-muted-foreground">
                Filtrar por aplicables
              </p>
            </a>
            <a
              href="/dashboard/parametricas"
              className="p-4 rounded-xl bg-accent/50 hover:bg-accent transition-colors group"
            >
              <Clock className="w-8 h-8 text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Tablas Paramétricas</h3>
              <p className="text-sm text-muted-foreground">
                Configurar constantes
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
