export interface User {
    id?: number;
    username: string;
    name: string;
    lastname: string;
    age: number;
    email: string;
    password: string;
    auth_uuid?: string;
    photo_url?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}