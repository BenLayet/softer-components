import type { ApplicationConfig } from "@angular/core";
import { provideBrowserGlobalErrorListeners } from "@angular/core";

import { provideStore } from "@ngrx/store";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { environment } from "./environments/environment";
import { provideSofterState } from "@softer-components/ngrx-adapter";
import type { ComponentDef, StatePathString } from "@softer-components/types";
import { appDef } from "./components/app/app.component";
import { DemoListService } from "./adapter/demo-list.service";
import { DemoAuthenticationService } from "./adapter/demo-authentication.service";
import {
  type UserContextContract,
  userContextSymbol,
} from "./components/app/user-context/user-context.component";

const authenticationService = new DemoAuthenticationService();
const listService = new DemoListService(authenticationService);
const dependencies = { listService, authenticationService };
const contextsPath = {
  [userContextSymbol]: "/userContext" as StatePathString<UserContextContract>,
};
const configuration = { dependencies, contextsPath };
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
