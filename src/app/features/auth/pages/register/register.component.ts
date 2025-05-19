import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor(private router: Router) {}

  onRegister() {
    if (this.password !== this.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    // Exemple simple, à remplacer par un vrai service
    console.log('Inscription réussie', {
      name: this.name,
      email: this.email,
      password: this.password,
    });

    // Redirection vers la page de connexion
    this.router.navigate(['/login']);
  }

}
