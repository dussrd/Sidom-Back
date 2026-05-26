export type UserRole = 'ADMIN' | 'CLIENTE' | 'DOMICILIARIO';

export interface AuthUser {
  id: number | null;
  name: string;
  username: string;
  role: UserRole;
  entityId: number | null;
}

export const ADMIN_CREDENTIALS = {
  username: 'admin@sidom.com',
  password: 'admin123',
};
