import type { ContextsConfig } from "@softer-components/types";

import type { Contract } from "./user-menu.component.contract";
import { type UserContextDef, userContextSymbol } from "../user-context/user-context.component";

export const contextsConfig: ContextsConfig<Contract, UserContextDef> = {
  [userContextSymbol]: {
    commands: [
      {
        from: "signOutRequested",
        to: "signOutRequested",
      },
    ],
    listeners: [
      {
        from: "signOutSucceeded",
        to: "signOutSucceeded",
      },
      {
        from: "authenticated",
        to: "authenticated",
      },
    ],
  },
};
