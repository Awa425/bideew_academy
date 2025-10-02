import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent implements AfterViewInit, OnDestroy {

  email = '';
  password = '';
  error = '';
  constructor(private router: Router, private authService: AuthService){

  }

  ngAfterViewInit() {
    if (typeof google !== 'undefined') {
      this.initializeGoogleSignIn();
    } else {
      window.addEventListener('google-loaded', () => {
        this.initializeGoogleSignIn();
      });
    }
  }

  private initializeGoogleSignIn() {
    try {
      this.authService.handleGoogleLogin();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la connexion Google:', error);
      this.error = 'Impossible de charger la connexion Google. Veuillez réessayer.';
    }
  }

  ngOnDestroy() {
  }

  login() {
    this.authService.login({email: this.email, password: this.password}).subscribe({
      next: (res:any) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.error = 'Email ou mot de passe incorrect';
      }
    });
  }
}
