import { InternalEventForwarders } from "@softer-components/types";

import { Contract } from "./user-context.component.contract";

export const eventForwarders: InternalEventForwarders<Contract> = [
  { from: "signInSucceeded", to: "authenticated" },
  { from: "signOutSucceeded", to: "unAuthenticated" },
  { from: "authenticated", to: "userChanged" },
  { from: "unAuthenticated", to: "userChanged" },
  {
    from: "userRequired",
    to: "loadUserRequested",
    onCondition: ({ values }) => !values.isProcessing(),
  },
];
