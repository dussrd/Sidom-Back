export interface Usuario {
  id?: number;
  usernameUsuario: string;
  passwordUsuario?: string;
  activoUsuario: boolean;
  tipoRol: number;
  cliente?: number | null;
  domiciliario?: number | null;
}
