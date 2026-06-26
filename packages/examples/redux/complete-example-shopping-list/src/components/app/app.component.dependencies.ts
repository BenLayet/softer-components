import type { AuthenticationService } from "../../port/authentication.service";
import type { ListService } from "../../port/list.service";
import type { UserContextContract, userContextSymbol } from "./user-context/user-context.component";
import type { StatePathString } from "@softer-components/types";
export type Dependencies = {
  services: {
    authenticationService: AuthenticationService;
    listService: ListService;
  };
  contextsPath: {
    [userContextSymbol]: StatePathString<UserContextContract>;
  };
};
