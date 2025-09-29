import { Component, inject, signal } from '@angular/core';
import { UserGit } from '../../interface/user-git';
import { UserGitServiceService } from '../../service/user-git-service.service';

@Component({
  selector: 'app-quien-soy-page',
  templateUrl: './quien-soy-page.component.html',
})
export class QuienSoyPageComponent { 

  userGitService = inject(UserGitServiceService);
  userGit = signal<UserGit>({
    nombre: '',
    imagen: '',
    url: '',
    seguidores: 0,
    siguiendo: 0,
    repositorio_publico: 0
  });

  ngOnInit(): void {
    this.getUserGit();
  }

  getUserGit(): void {
    this.userGitService.getUserGit().subscribe({
      next: (response: UserGit) => {
        this.userGit.set(response);
      },
      error: (error) => console.error('Error fetching GitHub user data:', error)
    });
  }
}
