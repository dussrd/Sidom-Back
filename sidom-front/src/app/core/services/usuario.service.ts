import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario } from '../models/usuario.model';

const PATH = 'usuarios/usuarios';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends ApiService {
  getAll(): Observable<Usuario[]>              { return this.getList<Usuario>(PATH); }
  getById(id: number): Observable<Usuario>     { return this.getOne<Usuario>(PATH, id); }
  post(d: Usuario): Observable<Usuario>        { return this.create<Usuario>(PATH, d); }
  put(id: number, d: Usuario): Observable<Usuario> { return this.update<Usuario>(PATH, id, d); }
  del(id: number): Observable<void>            { return this.remove(PATH, id); }
}
