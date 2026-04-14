import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { counterDef } from '../components/counter/counter.component';
import { provideSofterState } from '@softer-components/ngrx-adapter';
import { ComponentDef } from '@softer-components/types';

const devProviders = environment.devToolsEnabled
  ? [provideStoreDevtools({ maxAge: 25, logOnly: false })]
  : [];
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideStore(),
    provideSofterState({ rootComponentDef: counterDef as ComponentDef }),
    ...devProviders,
  ],
};
