import { Effects } from "@softer-components/types";

import { AuthenticationService } from "../../../port/authentication.service";
import { Contract } from "./user-context.component.contract";

type Dependencies = {
  authenticationService: AuthenticationService;
};

export const effects = ({
  authenticationService,
}: Dependencies): Effects<Contract> => ({
  signInRequested: async (
    { signInSucceeded, signInFailed },
    { payload: { username, password } },
  ) => {
    try {
      if (await authenticationService.signIn(username, password)) {
        signInSucceeded({ username });
      } else {
        signInFailed({ type: "invalid credentials" });
      }
    } catch (e: any) {
      if (e.message === "network error") {
        signInFailed({ type: "network error", message: e.message });
      } else {
        signInFailed({ type: "unknown error", message: e.message });
      }
    }
  },
  signOutRequested: async ({ signOutSucceeded }) => {
    await authenticationService.signOut();
    signOutSucceeded();
  },
  loadUserRequested: async ({ authenticated, unAuthenticated }) => {
    const username = await authenticationService.username();
    if (username) {
      authenticated({ username });
    } else {
      unAuthenticated();
    }
  },
});
