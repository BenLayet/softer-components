import { configureSofterStore } from "@softer-components/redux-adapter";

import { counterDef } from "./components/counter/counter.component";

export const store = configureSofterStore(counterDef);
