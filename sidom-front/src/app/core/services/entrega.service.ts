import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HistorialEstadoEntrega, SeguimientoEntrega, Novedad } from '../models/entrega.model';

@Injectable({ providedIn: 'root' })
export class EntregaService extends ApiService {
  getAllHistorial(): Observable<HistorialEstadoEntrega[]>      { return this.getList<HistorialEstadoEntrega>('entregas/historial-estados-entrega'); }
  postHistorial(d: HistorialEstadoEntrega): Observable<HistorialEstadoEntrega> { return this.create<HistorialEstadoEntrega>('entregas/historial-estados-entrega', d); }
  putHistorial(id: number, d: HistorialEstadoEntrega): Observable<HistorialEstadoEntrega> { return this.update<HistorialEstadoEntrega>('entregas/historial-estados-entrega', id, d); }
  delHistorial(id: number): Observable<void>                  { return this.remove('entregas/historial-estados-entrega', id); }

  getAllSeguimientos(): Observable<SeguimientoEntrega[]>       { return this.getList<SeguimientoEntrega>('entregas/seguimientos-entrega'); }
  postSeguimiento(d: SeguimientoEntrega): Observable<SeguimientoEntrega> { return this.create<SeguimientoEntrega>('entregas/seguimientos-entrega', d); }
  putSeguimiento(id: number, d: SeguimientoEntrega): Observable<SeguimientoEntrega> { return this.update<SeguimientoEntrega>('entregas/seguimientos-entrega', id, d); }
  delSeguimiento(id: number): Observable<void>                { return this.remove('entregas/seguimientos-entrega', id); }
  cambiarEstado(id: number, tipoEstado: number, observacion?: string): Observable<SeguimientoEntrega> {
    return this.http.post<SeguimientoEntrega>(`${this.baseUrl}/entregas/seguimientos-entrega/${id}/cambiar-estado/`, { tipoEstado, observacion });
  }
  tiempoReal(): Observable<any[]>                             { return this.http.get<any[]>(`${this.baseUrl}/entregas/seguimientos-entrega/tiempo-real/`); }

  getAllNovedades(): Observable<Novedad[]>                     { return this.getList<Novedad>('entregas/novedades'); }
  postNovedad(d: Novedad): Observable<Novedad>                { return this.create<Novedad>('entregas/novedades', d); }
  putNovedad(id: number, d: Novedad): Observable<Novedad>     { return this.update<Novedad>('entregas/novedades', id, d); }
  delNovedad(id: number): Observable<void>                    { return this.remove('entregas/novedades', id); }
  resolverNovedad(id: number, solucion: string): Observable<Novedad> {
    return this.http.post<Novedad>(`${this.baseUrl}/entregas/novedades/${id}/resolver/`, { solucion });
  }
  novedadesSinResolver(): Observable<Novedad[]>                { return this.http.get<Novedad[]>(`${this.baseUrl}/entregas/novedades/sin-resolver/`); }
}
