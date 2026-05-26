export interface SolicitudDisponible {
  id?: number;
  fechaPublicacionSolicitudDisponible?: string;
  fechaAceptacionSolicitudDisponible?: string | null;
  solicitud: number;
  domiciliario?: number | null;
  tipoEstado?: number | null;
  tipoEstadoCodigo?: string;
}

export interface Asignacion {
  id?: number;
  fechaAsignacion?: string;
  solicitudDisponible: number;
}
