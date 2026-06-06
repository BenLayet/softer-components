import type { ContextsConfig } from "@softer-components/types";

import type { Contract } from "./user-menu.component.contract";
import { userContextSymbol } from "../user-context/user-context.component";
import type { ContextsDef } from "./user-menu.component.dependencies";

export const contextsConfig: ContextsConfig<Contract, ContextsDef> = {
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
