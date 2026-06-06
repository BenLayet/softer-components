import type { ContextsConfig } from "@softer-components/types";

import type { Contract } from "./sign-in-form.component.contract";
import { type UserContextDef, userContextSymbol } from "../user-context/user-context.component";

export const contextsConfig: ContextsConfig<Contract, UserContextDef> = {
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
};
