export interface HistorialEstadoEntrega {
  id?: number;
  fechaCambioHistorial?: string;
  observacionHistorial?: string | null;
  tipoEstado: number;
  tipoEstadoCodigo?: string;
}

export interface SeguimientoEntrega {
  id?: number;
  fechaEstimadaSeguimiento: string;
  fechaRealSeguimiento?: string | null;
  cumplimientoSeguimiento: 'PENDIENTE' | 'A_TIEMPO' | 'CON_RETRASO';
  asignacion: number;
  historialEstadoEntrega: number;
  estadoActualCodigo?: string;
}

export interface Novedad {
  id?: number;
  fechaNovedad?: string;
  descripcionNovedad: string;
  solucionNovedad?: string | null;
  seguimientoEntrega: number;
  tipoNovedad: number;
  tipoEstado?: number | null;
  tipoNovedadCodigo?: string;
  tipoEstadoCodigo?: string;
}
