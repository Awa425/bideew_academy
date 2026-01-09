import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { envVars } from 'environments/environments';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { SecureStorageService } from './secure-storage.service';

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
    private ngZone: NgZone,
    private secureStorage: SecureStorageService
  ) {
    // Migration des données de localStorage vers le stockage sécurisé
    this.secureStorage.migrateFromLocalStorage();

    this.loadGoogleAuthSdk();
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const savedRole = this.secureStorage.getUserRole();
      if (savedRole) {
        this.currentUserSubject.next(savedRole);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.secureStorage.clearAll();
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
        // Utilisation du stockage sécurisé
        this.secureStorage.setToken(response.token);
        this.secureStorage.setUserId(response.user.id.toString());
        this.secureStorage.setUserRole(response.user.role);
        this.secureStorage.setUserData(response.user);

        this.currentUserSubject.next(response.user.role);
      })
    );
  }

  getUserRole(): string {
    const user = this.getCurrentUser(); 
    return user; 
  }

  register(userData: any): Observable<any> {
    const token = this.secureStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${envVars.apiBaseUrl}/register`, userData, {
      headers,
    });
  }

  updateUser(userData: any, id: any): Observable<any> {
    const token = this.secureStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${envVars.apiBaseUrl}/users/${id}`, userData, {
      headers,
    });
  }

  updatePasswordUser(userData: any, id: any): Observable<any> {
    const token = this.secureStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${envVars.apiBaseUrl}/users/${id}`, userData, {
      headers,
    });
  }

  logout(): void {
    // Nettoyage du stockage sécurisé
    this.secureStorage.clearAll();

    this.currentUserSubject.next(null);

    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    // Vérifie que le token existe ET est valide (non expiré)
    return this.secureStorage.isTokenValid();
  }

  getUserById(id: any) {
    const token = this.secureStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${envVars.apiBaseUrl}/users/${id}/details`, {
      headers,
    });
  }

  deleteUser(id: any) {
    const token = this.secureStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${envVars.apiBaseUrl}/users/${id}`, {
      headers,
    });
  }

  getAllUser(params?: any) {
    const token = this.secureStorage.getToken();
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
            // Utilisation du stockage sécurisé
            this.secureStorage.setToken(response.token);
            this.secureStorage.setUserData(response.user);

            if (response.user && response.user.role) {
              this.secureStorage.setUserRole(response.user.role);
              this.secureStorage.setUserId(response.user.id.toString());
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
        client_id: envVars.googleClientId,
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
          // Le stockage est déjà géré dans loginWithGoogle via tap()

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

  /**
   * Obtient le token d'authentification
   */
  getToken(): string | null {
    return this.secureStorage.getToken();
  }

  /**
   * Obtient l'ID de l'utilisateur connecté
   */
  getUserId(): string | null {
    return this.secureStorage.getUserId();
  }

  /**
   * Obtient les données complètes de l'utilisateur
   */
  getUserData(): any | null {
    return this.secureStorage.getUserData();
  }

  /**
   * Vérifie le temps restant avant expiration du token (en secondes)
   */
  getTokenExpirationTime(): number | null {
    return this.secureStorage.getTokenExpirationTime();
  }
}