import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { envVars } from 'environments/environments';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.loadGoogleAuthSdk();
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const savedUser = localStorage.getItem('user_role');
      if (savedUser) {
        this.currentUserSubject.next(savedUser);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user_role');
      this.currentUserSubject.next(null);
    }
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  private loadGoogleAuthSdk() {
    if (
      document.querySelector(
        'script[src^="https://accounts.google.com/gsi/client"]'
      )
    ) {
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
        localStorage.setItem('user_id', response.user.id); 
        localStorage.setItem('user_role', response.user.role);
        
        this.currentUserSubject.next(response.user.role);
      })
    );
  }

  getUserRole(): string {
    const user = this.getCurrentUser(); 
    return user; 
  }

  register(userData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${envVars.apiBaseUrl}/register`, userData, {
      headers,
    });
  }

  updateUser(userData: any, id: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${envVars.apiBaseUrl}/users/${id}`, userData, {
      headers,
    });
  }

  updatePasswordUser(userData: any, id: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${envVars.apiBaseUrl}/users/${id}`, userData, {
      headers,
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user');
    
    this.currentUserSubject.next(null);
    
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUserById(id: any) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${envVars.apiBaseUrl}/users/${id}/details`, {
      headers,
    });
  }

  deleteUser(id: any) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${envVars.apiBaseUrl}/users/${id}`, {
      headers,
    });
  }

  getAllUser(params?: any) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${envVars.apiBaseUrl}/users`, {
      headers,
      params,
    });
  }

  loginWithGoogle(idToken: string): Observable<any> {
    return this.http
      .post(`${envVars.apiBaseUrl}/auth/google`, { id_token: idToken })
      .pipe(
        tap((response: any) => {
          console.log('loginWithGoogle', response);
          if (response.success) {
            localStorage.setItem('access_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            if (response.user && response.user.role) {
              localStorage.setItem('user_role', response.user.role);
              localStorage.setItem('user_id', response.user.id);
              this.currentUserSubject.next(response.user.role);
            }
          } else {
            throw new Error(
              response.message || 'Erreur lors de la connexion avec Google'
            );
          }
        }),
        catchError((error) => {
          console.error('Erreur lors de la connexion avec Google:', error);
          let errorMessage =
            'Une erreur est survenue lors de la connexion avec Google';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 0) {
            errorMessage =
              'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
          } else if (error.status === 401) {
            errorMessage = 'Identifiants invalides. Veuillez réessayer.';
          }

          throw new Error(errorMessage);
        })
      );
  }

  handleGoogleLogin(): void {
    try {
      if (typeof google === 'undefined') {
        console.error('Google API not loaded');
        return;
      }

      google.accounts.id.initialize({
        client_id:
          '544702559305-0pj57qlosquuhhe7rh3otjdfdj3k7p1t.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleSignIn(response),
      });

      const button = document.getElementById('google-signin-button');
      if (button) {
        google.accounts.id.renderButton(button, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 300,
          logo_alignment: 'left',
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
          console.error(
            'Erreur lors de la connexion avec Google:',
            res.message
          );
        }
      },
      error: (err) => {
        console.error('Erreur lors de la connexion avec Google', err);
        if (err.error && err.error.message) {
          console.error("Message d'erreur:", err.error.message);
        }
      },
    });
  }
}