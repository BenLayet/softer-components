import type { ListContract } from "./list";
import type { ListManagerContract } from "./list-manager";
import type { SignInContract } from "./sign-in-form";
import type { UserContextContract } from "./user-context";
import type { UserMenuContract } from "./user-menu";

export type Children = {
  userMenu: UserMenuContract;
  signInForm: SignInContract;
  list: ListContract;
  listManager: ListManagerContract;
  userContext: UserContextContract;
};
