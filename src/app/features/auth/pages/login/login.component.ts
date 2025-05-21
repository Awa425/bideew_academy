import { Component } from '@angular/core';
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
export class LoginComponent {

  email = '';
  password = '';
  error = '';
  constructor(private router: Router, private authService: AuthService){

  }

  login(){
    this.authService.login({email: this.email, password: this.password}).subscribe({
      next: (res:any) =>{
        localStorage.setItem('token', res.token);
        this.router.navigate(['/home']);
      },
      error: (err)=>{
        this.error = 'Email ou mot de passe incorrect';
      }
    });
  }
}
