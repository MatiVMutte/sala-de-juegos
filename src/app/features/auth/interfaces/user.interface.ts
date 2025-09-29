export interface User {
    nombre?: string;
    apellido?: string;
    edad?: number;
    email: string;
    password: string;
    auth_uuid?: string;
}