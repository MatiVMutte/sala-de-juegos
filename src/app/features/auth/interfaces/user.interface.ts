export interface User {
    id?: string; // UUID del usuario (mismo que auth.users.id)
    username: string;
    name: string;
    lastname: string;
    age: number;
    email: string;
    password: string;
    photo_url?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}