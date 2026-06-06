import type { Effects } from "@softer-components/types";

import type { AuthenticationService } from "../../../port/authentication.service";
import type { Contract } from "./user-context.component.contract";

type Dependencies = {
  authenticationService: AuthenticationService;
};

export const effects = ({ authenticationService }: Dependencies): Effects<Contract> => ({
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
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "network error") {
        signInFailed({ type: "network error", message: e.message });
      } else {
        signInFailed({ type: "unknown error", message: String(e) });
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
