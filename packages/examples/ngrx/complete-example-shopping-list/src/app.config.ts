import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { environment } from './environments/environment';
import { provideSofterState } from '@softer-components/ngrx-adapter';
import { ComponentDef } from '@softer-components/types';
import { appDef } from './components/app';
import { DemoListService } from './adapter/demo-list.service';
import { DemoAuthenticationService } from './adapter/demo-authentication.service';

const authenticationService = new DemoAuthenticationService();
const listService = new DemoListService(authenticationService);
const configuration = { listService, authenticationService };
const devProviders = environment.devToolsEnabled
  ? [provideStoreDevtools({ maxAge: 25, logOnly: false })]
  : [];
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideStore(),
    provideSofterState({ rootComponentDef: appDef(configuration) as ComponentDef }),
    ...devProviders,
  ],
};
