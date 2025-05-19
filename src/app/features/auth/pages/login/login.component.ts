import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  constructor(private router: Router){

  }

  onSubmit() {
    console.log('Email:', this.email);
    console.log('Mot de passe:', this.password);
    // Ajoutez ici la logique de connexion (appel API, service auth, etc.)
     if (this.email && this.password) {
      // Redirection vers /home
      this.router.navigate(['/home']);
    } else {
      alert('Identifiants invalides');
    }
  }
}
