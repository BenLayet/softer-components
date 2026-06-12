import type { EventForwarders } from "@softer-components/types";

import type { Contract } from "./user-context.component.contract";

export const eventForwarders = {
  internal: [
    { from: "signInSucceeded", to: "authenticated" },
    { from: "signOutSucceeded", to: "unAuthenticated" },
    { from: "authenticated", to: "userChanged" },
    { from: "unAuthenticated", to: "userChanged" },
    {
      from: "userRequired",
      to: "loadUserRequested",
      onCondition: ({ values }) => !values.isProcessing(),
    },
  ],
} satisfies EventForwarders<Contract>;
