import { ContextsConfig } from "@softer-components/types";

import { Contract } from "./sign-in-form.component.contract";

export const contextsConfig: ContextsConfig<Contract> = {
  userContext: {
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
