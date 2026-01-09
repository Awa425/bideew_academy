import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Intercepteur HTTP fonctionnel pour Angular 19+
 * Gère les erreurs HTTP globalement et ajoute les headers par défaut
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  console.log('Requête interceptée:', req.url);

  // Clone la requête pour ajouter les headers par défaut
  // Note: Ne pas forcer Content-Type pour FormData (utilisé pour les uploads)
  let modifiedReq = req;

  if (!(req.body instanceof FormData)) {
    modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  // Traite la requête et gère les erreurs
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Erreur HTTP interceptée:', error);

      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Erreur côté serveur
        switch (error.status) {
          case 0:
            errorMessage =
              'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
            break;
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            // Redirection vers la page de login
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = "Vous n'avez pas les permissions nécessaires.";
            break;
          case 404:
            errorMessage = 'Ressource non trouvée.';
            break;
          case 422:
            errorMessage = error.error?.message || 'Données invalides.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage =
              error.error?.message ||
              `Erreur ${error.status}: ${error.message}`;
        }
      }

      console.error("Message d'erreur formaté:", errorMessage);

      // Retourne l'erreur formatée
      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        error: error.error,
        originalError: error,
      }));
    })
  );
};
