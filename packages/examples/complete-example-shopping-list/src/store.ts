import { configureSofterStore } from "@softer-components/redux-adapter";

import { appDef } from "./components/app/app.component.ts";
import { createListEffects } from "./components/app/list-manager/create-list/create-list.effects.ts";
import { listsEffects } from "./components/app/list-manager/lists/lists.effects.ts";
import { listEffects } from "./components/app/list/list.effects.ts";

export const store = configureSofterStore(appDef);
store.configureEffects("/listManager/lists", listsEffects);
store.configureEffects("/listManager/createList", createListEffects);
store.configureEffects("/list", listEffects);
