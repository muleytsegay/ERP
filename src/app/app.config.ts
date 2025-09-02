import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Lara,
        options: {
          darkModeSelector: '.dark-mode',
          cssVariables: {
            '--p-primary-color': '#9e9e9e', // ✅ Sets gray as primary
            '--p-highlight-background': '#9e9e9e', // ✅ Selected item bg
            '--p-highlight-color': '#000', // ✅ Selected item text color
          },
        },
      },
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    HttpClientModule,
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
