import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/auth/components/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/components/register-page/register-page.component';
import { HomePageComponent } from './features/home/components/home-page/home-page.component';
import { QuienSoyPageComponent } from './features/quien-soy/components/quien-soy-page/quien-soy-page.component';
import { GamesPageComponent } from './features/games/games-page/games-page.component';

export const routes: Routes = [

    {
        path: 'login',
        component: LoginPageComponent
    },
    {
        path: 'register',
        component: RegisterPageComponent
    },
    {
        path: 'home',
        component: HomePageComponent
    },
    {
        path: 'quien-soy',
        component: QuienSoyPageComponent
    },
    {
        path: 'juegos',
        component: GamesPageComponent
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full'
    }

];
