import { ContextsConfig } from "@softer-components/types";

import { Contract } from "./user-menu.component.contract";

export const contextsConfig: ContextsConfig<Contract> = {
  userContext: {
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
