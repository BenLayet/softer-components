import { ListContract } from "./list";
import { ListManagerContract } from "./list-manager";
import { SignInContract } from "./sign-in-form";
import { UserContextContract } from "./user-context";
import { UserMenuContract } from "./user-menu";

export type Children = {
  userMenu: UserMenuContract;
  signInForm: SignInContract;
  list: ListContract;
  listManager: ListManagerContract;
  userContext: UserContextContract;
};
