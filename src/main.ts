import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { httpErrorInterceptor } from './app/core/interceptors/http-error.interceptor.func';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    provideRouter(routes),
    provideAnimations()
  ]
});