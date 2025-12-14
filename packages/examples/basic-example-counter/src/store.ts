import { configureSofterStore } from "@softer-components/redux-adapter";

import { counterComponentDef } from "./components/counter/counter.component.ts";

export const store = configureSofterStore(counterComponentDef);
