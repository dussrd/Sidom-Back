import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Solicitud } from '../models/solicitud.model';

const PATH = 'solicitudes/solicitudes';

@Injectable({ providedIn: 'root' })
export class SolicitudService extends ApiService {
  getAll(): Observable<Solicitud[]>              { return this.getList<Solicitud>(PATH); }
  getById(id: number): Observable<Solicitud>     { return this.getOne<Solicitud>(PATH, id); }
  post(d: Solicitud): Observable<Solicitud>      { return this.create<Solicitud>(PATH, d); }
  put(id: number, d: Solicitud): Observable<Solicitud> { return this.update<Solicitud>(PATH, id, d); }
  del(id: number): Observable<void>              { return this.remove(PATH, id); }
  reintentar(id: number): Observable<Solicitud>  { return this.http.post<Solicitud>(`${this.baseUrl}/${PATH}/${id}/reintentar/`, {}); }
  panel(): Observable<Solicitud[]>               { return this.http.get<Solicitud[]>(`${this.baseUrl}/${PATH}/panel/`); }
  estadisticas(): Observable<any[]>              { return this.http.get<any[]>(`${this.baseUrl}/${PATH}/estadisticas/`); }
}
