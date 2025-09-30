import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/auth/components/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/components/register-page/register-page.component';
import { HomePageComponent } from './features/home/components/home-page/home-page.component';
import { QuienSoyPageComponent } from './features/quien-soy/components/quien-soy-page/quien-soy-page.component';
import { GamesPageComponent } from './features/games/pages/games-page/games-page.component';
import { MayorOMenorComponent } from './features/games/list-games/mayor-o-menor/components/mayor-o-menor.component';
import { AhorcadoComponent } from './features/games/list-games/ahorcado/components/ahorcado.component';
import { AdivinaNumeroComponent } from './features/games/list-games/adivina-numero/components/adivina-numero.component';
import { PreguntadosComponent } from './features/games/list-games/preguntados/components/preguntados.component';
import { ChatPageComponent } from './features/chat/pages/chat-page/chat-page.component';
import { authGuard } from './core/guards/auth.guard';

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
        component: GamesPageComponent,
        canActivate: [authGuard]
    },
    {
        path: 'juegos/mayor-o-menor',
        component: MayorOMenorComponent,
        canActivate: [authGuard]
    },
    {
        path: 'juegos/ahorcado',
        component: AhorcadoComponent,
        canActivate: [authGuard]
    },
    {
        path: 'juegos/adivina-numero',
        component: AdivinaNumeroComponent,
        canActivate: [authGuard]
    },
    {
        path: 'juegos/preguntados',
        component: PreguntadosComponent,
        canActivate: [authGuard]
    },
    {
        path: 'chat',
        component: ChatPageComponent,
        canActivate: [authGuard]
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
