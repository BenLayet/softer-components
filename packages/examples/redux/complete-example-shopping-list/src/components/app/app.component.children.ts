import type { ListManagerContract } from "./list-manager/list-manager.component";
import type { ListContract } from "./list/list.component";
import type { SignInContract } from "./sign-in-form/sign-in-form.component";
import type { UserContextContract } from "./user-context/user-context.component";
import type { UserMenuContract } from "./user-menu/user-menu.component";

export type Children = {
  userMenu: UserMenuContract;
  signInForm: SignInContract;
  list: ListContract;
  listManager: ListManagerContract;
  userContext: UserContextContract;
};
