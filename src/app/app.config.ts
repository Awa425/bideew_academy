import { ApplicationConfig, provideZoneChangeDetection, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { register } from 'swiper/element/bundle';

import { routes } from './app.routes';

register();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    { provide: CUSTOM_ELEMENTS_SCHEMA, useValue: true }
  ]
};
