import { configureSofterStore } from "@softer-components/redux-adapter";

import { counterDef } from "./components/counter/counter.component.ts";

export const store = configureSofterStore(counterDef);
