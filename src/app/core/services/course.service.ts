import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Course, Lessons, Quiz } from '../models/course.model';
import { envVars } from 'environments/environments';

interface QuizSubmission {
  quiz_id: number;
  answers: {
    question_id: number;
    answer_ids: number[];
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private http: HttpClient) {}

  private logRequest(
    url: string,
    method: string = 'GET',
    body: any = null
  ): void {
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
      error: error.error,
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.status === 0) {
      // Erreur réseau ou CORS
      errorMessage =
        'Impossible de se connecter au serveur. Vérifiez votre connexion.';
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

  getAllCourses(page: number = 1): Observable<any> {
    return this.http.get(`${envVars.apiBaseUrl}/courses?page=${page}`);
  }

  // Mettre à jour un cours
  updateCourse(id: number, formData: FormData): Observable<any> {
    console.log(formData);

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<any>(`${envVars.apiBaseUrl}/courses/${id}`, formData, {
      headers,
    });
  }

  // Mettre à jour lesson
  updateLesson(id: number, formData: FormData): Observable<any> {
    console.log(formData);

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<any>(`${envVars.apiBaseUrl}/lessons/${id}`, formData, {
      headers,
    });
  }

  getAllCoursesByFormateur(userID: number, page: number = 1): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(
      `${envVars.apiBaseUrl}/courses/user/${userID}?page=${page}`,
      {
        headers,
      }
    );
  }

  addProgress(lesson_id: number): any {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // const body = {
    //   lesson_id: lesson_id,
    //   // progress_percent: progress_percent, // ou un autre champ selon ton API
    // };
    return this.http.patch(
      `${envVars.apiBaseUrl}/lessons/${lesson_id}/progress`,
      {},
      {
        headers,
      }
    );
  }

  generedCertificat(course_id: number): any {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(
      `${envVars.apiBaseUrl}/certificates/generate`,
      { course_id },
      {
        headers,
      }
    );
  }

  // getCertificat(certificat_id: number): any {
  //   const token = localStorage.getItem('access_token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  //   return this.http.get(
  //     `${envVars.apiBaseUrl}/certificates/${certificat_id}`,
  //     {
  //       headers,
  //     }
  //   );
  // }
  getCertificat(certificat_id: number): any {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(
      `${envVars.apiBaseUrl}/certificates/${certificat_id}`,
      {
        headers,
        responseType: 'blob' as 'json', // 👈 important
      }
    );
  }

  createLesson(courseId: number, lessonData: FormData): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // ✅ IMPORTANT: Pas de Content-Type pour FormData - le navigateur l'ajoute automatiquement

    return this.http.post(
      `${envVars.apiBaseUrl}/courses/${courseId}/lessons`,
      lessonData,
      { headers }
    );
  }

  getProgress(courseId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${envVars.apiBaseUrl}/courses/${courseId}/progress`, {
      headers,
    });
  }

  getInfoUser(userID: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${envVars.apiBaseUrl}/users/${userID}/details`, {
      headers,
    });
  }

  CourseStart(courseId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(
      `${envVars.apiBaseUrl}/courses/${courseId}/start`,
      {},
      {
        headers,
      }
    );
  }

  createCourse(data: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${envVars.apiBaseUrl}/courses`, data, {
      headers,
    });
  }

  calculateScore(courseId: number, data: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post(`${envVars.apiBaseUrl}/courses/${courseId}/quizzes/submit`, data, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error submitting quiz:', error);
          return throwError(() => error);
        })
      );
  }

  getCourseById(id: any) {
    const token = localStorage.getItem('access_token'); // Get stored token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${envVars.apiBaseUrl}/courses/${id}`, {
      headers,
    });
  }

  getLessonsByIdCourse(id: number) {
    const token = localStorage.getItem('access_token'); // Get stored token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${envVars.apiBaseUrl}/courses/${id}\lessons`, {
      headers,
    });
  }

  getLessonsByIdLesson(idCour: number, idLesson: number) {
    const token = localStorage.getItem('access_token'); // Get stored token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(
      `${envVars.apiBaseUrl}/courses/${idCour}\/lessons/${idLesson}`,
      {
        headers,
      }
    );
  }

  getQuizzByLesson(idCour: any) {
    const token = localStorage.getItem('access_token'); // Get stored token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${envVars.apiBaseUrl}/courses/${idCour}\/quizzes`, {
      headers,
    });
  }

  getPopularCourses(limit: number = 3): Observable<Course[]> {
    return this.http
      .get<Course[]>(
        `${envVars.apiBaseUrl}/courses?sort=rating&order=desc&limit=${limit}`
      )
      .pipe(catchError(this.handleError));
  }

  getCoursesByLevel(
    level: 'beginner' | 'intermediate' | 'advanced'
  ): Observable<Course[]> {
    return this.http
      .get<Course[]>(`${envVars.apiBaseUrl}/courses?level=${level}`)
      .pipe(catchError(this.handleError));
  }

  searchCourses(query: string): Observable<Course[]> {
    return this.http
      .get<Course[]>(
        `${envVars.apiBaseUrl}/courses?search=${encodeURIComponent(query)}`
      )
      .pipe(catchError(this.handleError));
  }

  getCourseLessons(courseId: string): Observable<Lessons[]> {
    const url = `${envVars.apiBaseUrl}/courses/${courseId}/lessons`;
    this.logRequest(url, 'GET');

    return this.http
      .get<Lessons[]>(url, {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      })
      .pipe(
        tap({
          next: (response) => this.logResponse(response),
          error: (error) =>
            this.logError(
              error,
              `lors de la récupération des leçons du cours ${courseId}`
            ),
          complete: () => console.log('🏁 Récupération des leçons terminée'),
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getCourseQuiz(courseId: number): Observable<Quiz> {
    const url = `${envVars.apiBaseUrl}/courses/${courseId}/quizzes`;
    this.logRequest(url, 'GET');

    return this.http
      .get<Quiz>(url, {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      })
      .pipe(
        tap({
          next: (response) => this.logResponse(response),
          error: (error) =>
            this.logError(
              error,
              `lors de la récupération du quiz du cours ${courseId}`
            ),
          complete: () => console.log('🏁 Récupération du quiz terminée'),
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
}
