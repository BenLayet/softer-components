import { configureSofterStore } from "./redux-adapter/softerStore.ts";
import { counterComponentDef } from "./components/counter/counter.component.ts";

export const store = configureSofterStore(counterComponentDef);
