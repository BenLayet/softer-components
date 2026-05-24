import type { UserContextContract } from "./user-context";
import type { UserMenuContract } from "./user-menu";
import type { ListManagerContract } from "./list-manager";
import type { ListContract } from "./list";
import type { SignInContract } from "./sign-in-form";

export type Children = {
  userMenu: UserMenuContract;
  signInForm: SignInContract;
  list: ListContract;
  listManager: ListManagerContract;
  userContext: UserContextContract;
};
