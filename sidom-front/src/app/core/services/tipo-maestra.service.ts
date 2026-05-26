import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TipoMaestra } from '../models/tipo-maestra.model';

const PATH = 'core/tipos-maestra';

@Injectable({ providedIn: 'root' })
export class TipoMaestraService extends ApiService {
  getAll(): Observable<TipoMaestra[]>           { return this.getList<TipoMaestra>(PATH); }
  getById(id: number): Observable<TipoMaestra>  { return this.getOne<TipoMaestra>(PATH, id); }
  post(d: TipoMaestra): Observable<TipoMaestra> { return this.create<TipoMaestra>(PATH, d); }
  put(id: number, d: TipoMaestra): Observable<TipoMaestra> { return this.update<TipoMaestra>(PATH, id, d); }
  del(id: number): Observable<void>             { return this.remove(PATH, id); }
}
