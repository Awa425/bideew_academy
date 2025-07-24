import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { envVars } from 'environments/environments';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  constructor(
    private http: HttpClient, 
    private router: Router,
    private ngZone: NgZone
  ) {
    this.loadGoogleAuthSdk();
  }

  private loadGoogleAuthSdk() {
    // Vérifier si le script est déjà chargé
    if (document.querySelector('script[src^="https://accounts.google.com/gsi/client"]')) {
      // Déclencher l'événement personnalisé si l'API est déjà chargée
      if (typeof google !== 'undefined') {
        window.dispatchEvent(new Event('google-loaded'));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Déclencher un événement personnalisé lorsque l'API est chargée
      window.dispatchEvent(new Event('google-loaded'));
    };
    script.onerror = (error) => {
      console.error('Erreur lors du chargement du SDK Google:', error);
    };
    document.head.appendChild(script);
  }


  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${envVars.apiBaseUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.token); 
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${envVars.apiBaseUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('access_token'); 
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

loginWithGoogle(idToken: string): Observable<any> {
  return this.http.post(`${envVars.apiBaseUrl}/auth/google`, { id_token: idToken }).pipe(
    tap((response: any) => {
      console.log("loginWithGoogle", response);
      if (response.success) {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error(response.message || 'Erreur lors de la connexion avec Google');
      }
    }),
    catchError(error => {
      console.error('Erreur lors de la connexion avec Google:', error);
      let errorMessage = 'Une erreur est survenue lors de la connexion avec Google';
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
      } else if (error.status === 401) {
        errorMessage = 'Identifiants invalides. Veuillez réessayer.';
      }
      
      throw new Error(errorMessage);
    })
  );
}



  handleGoogleLogin(): void {
    
    try {
      // Vérifier si l'API Google est disponible
      if (typeof google === 'undefined') {
        console.error('Google API not loaded');
        return;
      }

      // Initialiser l'API Google Identity
      google.accounts.id.initialize({
        client_id: '544702559305-0pj57qlosquuhhe7rh3otjdfdj3k7p1t.apps.googleusercontent.com', // À remplacer par votre ID client Google
        callback: (response: any) => this.handleGoogleSignIn(response)
      });

      // Rendre le bouton de connexion Google
      const button = document.getElementById('google-signin-button');
      if (button) {
        google.accounts.id.renderButton(button, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 300,
          logo_alignment: 'left'
        });
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  }


  private handleGoogleSignIn(response: any): void {
    console.log(response);
    
    
    this.loginWithGoogle(response.credential).subscribe({
      next: (res: any) => {
        if (res.success && res.token) {
          localStorage.setItem('access_token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          
          this.ngZone.run(() => {
            this.router.navigate(['/home']);
          });
        } else {
          console.error('Erreur lors de la connexion avec Google:', res.message);
          // Afficher un message d'erreur à l'utilisateur
        }
      },
      error: (err) => {
        console.error('Erreur lors de la connexion avec Google', err);
        // Afficher un message d'erreur à l'utilisateur
        if (err.error && err.error.message) {
          console.error('Message d\'erreur:', err.error.message);
        }
      }
    });
  }
}
