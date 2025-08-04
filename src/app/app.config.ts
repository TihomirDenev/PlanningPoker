import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore } from '@angular/fire/firestore';
import { provideRouter } from '@angular/router';
import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { MessageService } from 'primeng/api';

import { routes } from 'src/app/app.routes';
import { environment } from 'src/environments/environment.prod';
import { RoomLifecycleService } from 'src/app/shared/services/room-lifecycle.service';

export function appInitializerFactory(roomLifecycleService: RoomLifecycleService) {
  return () => roomLifecycleService.runStartupCleanup();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      BrowserAnimationsModule
    ),
    MessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [RoomLifecycleService],
      multi: true,
    }
  ]
};
