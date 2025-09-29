import { Injectable, inject } from '@angular/core';
import { UserGit } from '../interface/user-git';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserGitServiceService {

  private url = 'https://api.github.com';
  private userGit = 'mativmutte';
  private http = inject(HttpClient);
  
  getUserGit(): Observable<UserGit> {
    return this.http.get(`${this.url}/users/${this.userGit}`).pipe(
      map((response: any) => {
        // Transformar la respuesta de GitHub a nuestra interfaz UserGit
        return {
          nombre: response.name || response.login,
          imagen: response.avatar_url,
          url: response.html_url,
          seguidores: response.followers,
          siguiendo: response.following,
          repositorio_publico: response.public_repos
        } as UserGit;
      })
    );
  }

}
