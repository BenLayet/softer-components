import { UserContextContract } from './user-context';
import { UserMenuContract } from './user-menu';
import { ListManagerContract } from './list-manager';
import { ListContract } from './list';
import { SignInContract } from './sign-in-form';

export type Children = {
  userMenu: UserMenuContract;
  signInForm: SignInContract;
  list: ListContract;
  listManager: ListManagerContract;
  userContext: UserContextContract;
};
