import type { ContextsConfig } from "@softer-components/types";

import type { Contract } from "./sign-in-form.component.contract";
import { userContextSymbol } from "../user-context/user-context.component";
import type { ContextsDef } from "./sign-in-form.component.dependencies";

export const contextsConfig: ContextsConfig<Contract, ContextsDef> = {
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
