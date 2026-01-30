import { configureSofterStore } from "@softer-components/redux-adapter";

import { appDef } from "./components/app/app.component.ts";
import { createListEffects } from "./components/app/list-select/create-list/create-list.effects.ts";
import { listsEffects } from "./components/app/list-select/lists/lists.effects.ts";
import { listEffects } from "./components/app/list/list.effects.ts";

export const store = configureSofterStore(appDef);
store.configureEffects("/listSelect/lists", listsEffects);
store.configureEffects("/listSelect/createList", createListEffects);
store.configureEffects("/list", listEffects);
