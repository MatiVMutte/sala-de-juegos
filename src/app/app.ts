import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from "./shared/nav/nav.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isMobileMenuOpen = signal(false);
  
  toggleMobileMenu() {
    this.isMobileMenuOpen.update((value: boolean) => !value);
  }

}
