"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  CheckCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Inconsistencia {
  id: number;
  numeroFactura: string | null;
  ips: string | null;
  origen: string | null;
  tipoValidacion: string | null;
  observacion: string | null;
  tipoServicio: string | null;
  codigoServicio: string | null;
  descripcionServicio: string | null;
  cantidad: number | null;
  valorUnitario: string | null;
  valorTotal: string | null;
  fecha: string | null;
  aplicaInconsistencia: boolean | null;
  observacionAuditor: string | null;
  auditObservations: string | null;
  updatedAt: string;
}

export default function InconsistenciasPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tipoValidacion, setTipoValidacion] = useState("");
  const [aplicaFilter, setAplicaFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<Inconsistencia | null>(null);
  const [editingObservation, setEditingObservation] = useState<{
    id: number;
    value: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Fetch data
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["inconsistencias", page, search, tipoValidacion, aplicaFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(search && { search }),
        ...(tipoValidacion && { tipoValidacion }),
        ...(aplicaFilter && { aplicaInconsistencia: aplicaFilter }),
      });
      const res = await fetch(`/api/inconsistencias?${params}`);
      return res.json();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Inconsistencia>;
    }) => {
      const res = await fetch(`/api/inconsistencias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inconsistencias"] });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      toast.error("Error al guardar");
      setSaveStatus("idle");
    },
  });

  // Debounced auto-save for observations
  const debouncedSave = useCallback(
    debounce((id: number, value: string) => {
      setSaveStatus("saving");
      updateMutation.mutate({ id, data: { observacionAuditor: value } });
    }, 1000),
    []
  );

  const handleObservationChange = (id: number, value: string) => {
    setEditingObservation({ id, value });
    debouncedSave(id, value);
  };

  const handleSwitchChange = (id: number, checked: boolean) => {
    updateMutation.mutate({ id, data: { aplicaInconsistencia: checked } });
    toast.success(checked ? "Marcado como aplica" : "Marcado como no aplica");
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inconsistencias</h1>
          <p className="text-muted-foreground">
            Gestión y auditoría de inconsistencias médicas
          </p>
        </div>

        {/* Auto-save indicator */}
        <div className={`auto-save-indicator ${saveStatus}`}>
          {saveStatus === "saving" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Guardado</span>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="glass border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por factura, IPS o descripción..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 bg-background/50"
              />
            </div>
            <Select
              value={tipoValidacion}
              onValueChange={(v) => {
                setTipoValidacion(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px] bg-background/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo validación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Descripcion del Evento Inconsistente">
                  Evento Inconsistente
                </SelectItem>
                <SelectItem value="Mayor valor en Medicamentos Regulados">
                  Mayor valor Medicamentos
                </SelectItem>
                <SelectItem value="Codigo Soat no corresponde">
                  Código SOAT no corresponde
                </SelectItem>
                <SelectItem value="Codigo Soat no AJUSTADO A Centena">
                  SOAT no ajustado
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={aplicaFilter}
              onValueChange={(v) => {
                setAplicaFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Aplica</SelectItem>
                <SelectItem value="false">No Aplica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="glass border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[100px]">Factura</TableHead>
                <TableHead>IPS</TableHead>
                <TableHead>Tipo Validación</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-center w-[100px]">Aplica</TableHead>
                <TableHead className="w-[250px]">Observación Auditor</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-muted-foreground">
                      No se encontraron registros
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((item: Inconsistencia, index: number) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <TableCell className="font-mono text-sm">
                      {item.numeroFactura || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {item.ips || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.tipoValidacion?.substring(0, 25) || "-"}
                        {item.tipoValidacion && item.tipoValidacion.length > 25
                          ? "..."
                          : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.valorTotal)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={item.aplicaInconsistencia || false}
                        onCheckedChange={(checked) =>
                          handleSwitchChange(item.id, checked)
                        }
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={
                          editingObservation?.id === item.id
                            ? editingObservation.value
                            : item.observacionAuditor || ""
                        }
                        onChange={(e) =>
                          handleObservationChange(item.id, e.target.value)
                        }
                        placeholder="Escribir observación..."
                        className="min-h-[60px] text-xs bg-background/50 resize-none"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Mostrando {data?.data?.length || 0} de {data?.pagination?.total || 0}{" "}
            registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm px-3">
              Página {page} de {data?.pagination?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (data?.pagination?.totalPages || 1) || isFetching}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="glass max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Inconsistencia</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Factura</p>
                  <p className="font-mono">{selectedItem.numeroFactura || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IPS</p>
                  <p>{selectedItem.ips || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Origen</p>
                  <p>{selectedItem.origen || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo Servicio</p>
                  <p>{selectedItem.tipoServicio || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código Servicio</p>
                  <p className="font-mono text-sm">
                    {selectedItem.codigoServicio || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad</p>
                  <p>{selectedItem.cantidad || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Unitario</p>
                  <p className="font-mono">
                    {formatCurrency(selectedItem.valorUnitario)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-mono text-lg font-bold text-primary">
                    {formatCurrency(selectedItem.valorTotal)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Descripción Servicio
                </p>
                <p className="text-sm">{selectedItem.descripcionServicio || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tipo Validación</p>
                <Badge variant="outline">{selectedItem.tipoValidacion || "-"}</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Observación Original
                </p>
                <p className="text-sm bg-accent/50 p-3 rounded-lg">
                  {selectedItem.observacion || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Última actualización
                </p>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(selectedItem.updatedAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
