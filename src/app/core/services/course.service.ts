import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Course, Lessons, Quiz } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // L'URL de base de l'API - utilise le proxy en développement
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private logRequest(url: string, method: string = 'GET', body: any = null): void {
    console.log(`⏳ [${method}] Requête vers:`, url);
    if (body) {
      console.log('📦 Corps de la requête:', body);
    }
  }

  private logResponse(response: any): void {
    console.log('✅ Réponse reçue:', response);
  }

  private logError(error: any, context: string = ''): void {
    console.error(`❌ Erreur${context ? ' ' + context : ''}:`, {
      name: error.name,
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 0) {
      // Erreur réseau ou CORS
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Le serveur a retourné le code ${error.status} avec le message: ${error.message}`;
      
      // Si le serveur fournit un message d'erreur plus détaillé
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getAllCourses(): Observable<Course[]>{
    return this.http.get(`http://localhost:8000/api/courses`).pipe(
    map(response => Object.values(response)[1])
  );
  }
  // getAllCourses(): Observable<Course[]> {
  //   const url = `${this.apiUrl}/courses`;
  //   this.logRequest(url);
    
  //   return this.http.get<Course[]>(url, { 
  //     headers: {
  //       'Accept': 'application/json',
  //       'Cache-Control': 'no-cache'
  //     }
  //   }).pipe(
  //     tap({
  //       next: (response) => this.logResponse(response),
  //       error: (error) => this.logError(error, 'lors de la récupération des cours'),
  //       complete: () => console.log('🏁 Appel API terminé')
  //     }),
  //     catchError((error: HttpErrorResponse) => this.handleError(error))
  //   );
  // }

  getCourseById(id: number) {
  const token = localStorage.getItem('access_token'); // Get stored token
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`http://localhost:8000/api/courses/${id}`, { headers });
}
  getLessonsByIdCourse(id: number) {
  const token = localStorage.getItem('access_token'); // Get stored token
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`http://localhost:8000/api/courses/${id}\lessons`, { headers });
}

  getPopularCourses(limit: number = 3): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses?sort=rating&order=desc&limit=${limit}`).pipe(
      catchError(this.handleError)
    );
  }

  getCoursesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses?level=${level}`).pipe(
      catchError(this.handleError)
    );
  }

  searchCourses(query: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses?search=${encodeURIComponent(query)}`).pipe(
      catchError(this.handleError)
    );
  }



  getCourseLessons(courseId: string): Observable<Lessons[]> {
    const url = `${this.apiUrl}/courses/${courseId}/lessons`;
    this.logRequest(url, 'GET');
    
    return this.http.get<Lessons[]>(url, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }).pipe(
      tap({
        next: (response) => this.logResponse(response),
        error: (error) => this.logError(error, `lors de la récupération des leçons du cours ${courseId}`),
        complete: () => console.log('🏁 Récupération des leçons terminée')
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  getCourseQuiz(courseId: string): Observable<Quiz> {
    const url = `${this.apiUrl}/courses/${courseId}/quiz`;
    this.logRequest(url, 'GET');
    
    return this.http.get<Quiz>(url, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }).pipe(
      tap({
        next: (response) => this.logResponse(response),
        error: (error) => this.logError(error, `lors de la récupération du quiz du cours ${courseId}`),
        complete: () => console.log('🏁 Récupération du quiz terminée')
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }
}
