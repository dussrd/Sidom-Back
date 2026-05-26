export interface Solicitud {
  id?: number;
  fechaSolicitud?: string;
  descripcionSolicitud: string;
  direccionRecogidaSolicitud?: string | null;
  direccionEntregaSolicitud: string;
  cliente: number;
  tipoZona: number;
  tipoServicio: number;
  tipoEstado?: number | null;
  tipoMotivoRechazo?: number | null;
  tipoEstadoCodigo?: string;
  tipoMotivoRechazoCodigo?: string | null;
}
