import { configureSofterStore } from "@softer-components/redux-adapter";
import { appDef } from "./components/app/app.component.ts";

export const store = configureSofterStore(appDef);
