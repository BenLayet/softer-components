import { configureSofterStore } from "@softer-components/redux-adapter";
import { shoppingListComponentDef } from "./components/shopping-list/shopping-list.component.ts";

export const store = configureSofterStore(shoppingListComponentDef);
