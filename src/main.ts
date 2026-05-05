import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

import { addIcons } from 'ionicons';
import { heart, home } from 'ionicons/icons';

addIcons({ heart, home });

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    provideIonicAngular(), provideHttpClient(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
