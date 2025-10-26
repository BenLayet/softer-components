import { configureSofterStore } from "@softer-components/redux-adapter";
import { appComponentDef } from "./components/app/app.component.ts";

export const store = configureSofterStore(appComponentDef);
