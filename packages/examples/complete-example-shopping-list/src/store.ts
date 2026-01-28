import { configureSofterStore } from "@softer-components/redux-adapter";

import { appDef } from "./components/app/app.component.ts";
import { listSelectEffects } from "./components/app/list-select/list-select.effects.ts";
import { savedListsEffects } from "./components/app/list-select/saved-lists/saved-lists.effects.ts";
import { listEffects } from "./components/app/list/list.effects.ts";

export const store = configureSofterStore(appDef);
store.configureEffects("/listSelect", listSelectEffects);
store.configureEffects("/listSelect/savedLists", savedListsEffects);
store.configureEffects("/list", listEffects);
