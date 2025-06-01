import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore } from '@angular/fire/firestore';
import { provideRouter } from '@angular/router';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { MessageService } from 'primeng/api';

import { routes } from './app.routes';

import { environment } from 'src/environments/environment.prod';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      BrowserAnimationsModule
    ),
    MessageService
  ]
};
