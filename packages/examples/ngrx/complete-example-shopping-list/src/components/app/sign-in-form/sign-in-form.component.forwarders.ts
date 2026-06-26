import type { EventForwarders } from "@softer-components/types";

import type { Contract } from "./sign-in-form.component.contract";
import { userContextSymbol } from "../user-context/user-context.component";
import type { ContextsDef } from "./sign-in-form.component.dependencies";

export const eventForwarders = {
  contexts: {
    [userContextSymbol]: {
      commands: [
        {
          from: "signInFormSubmitted",
          to: "signInRequested",
          withPayload: ({ values }) => ({
            username: values.username(),
            password: values.password(),
          }),
        },
      ],
      listeners: [
        {
          from: "signInFailed",
          to: "signInFailed",
        },
      ],
    },
  },
} satisfies EventForwarders<Contract, ContextsDef>;
