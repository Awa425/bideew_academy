import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Requête interceptée:', request);
    
    // Cloner la requête pour ajouter des en-têtes
    const authReq = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true // Important pour les cookies de session
    });
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur interceptée:', error);
        
        let errorMessage = 'Une erreur est survenue';
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          errorMessage = `Erreur ${error.status}: ${error.message}`;
        }
        
        console.error('Message d\'erreur:', errorMessage);
        return throwError(() => ({
          message: errorMessage,
          status: error.status,
          error: error.error
        }));
      })
    );
  }
}
