import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UbicacionDomiciliario } from '../models/tracking.model';

const PATH = 'tracking/ubicaciones-domiciliarios';

@Injectable({ providedIn: 'root' })
export class TrackingService extends ApiService {
  getAll(): Observable<UbicacionDomiciliario[]>              { return this.getList<UbicacionDomiciliario>(PATH); }
  post(d: UbicacionDomiciliario): Observable<UbicacionDomiciliario> { return this.create<UbicacionDomiciliario>(PATH, d); }
  put(id: number, d: UbicacionDomiciliario): Observable<UbicacionDomiciliario> { return this.update<UbicacionDomiciliario>(PATH, id, d); }
  del(id: number): Observable<void>                          { return this.remove(PATH, id); }
}
