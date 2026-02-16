import { useSofter } from "@softer-components/redux-adapter";

import { AppContract } from "./app.component";
import { ListManager } from "./list-manager/ListManager";
import { List } from "./list/List";
import { SignInForm } from "./sign-in-form/SignInForm";
import { UserMenu } from "./user-menu/UserMenu";

export const App = ({ path = "" }) => {
  const [_, __, c] = useSofter<AppContract>(path);
  return (
    <div>
      <div className="menu-bar">
        <UserMenu path={c.userMenu} />
      </div>
      <h1>Shopping List</h1>
      {c.signInForm && <SignInForm path={c.signInForm} />}
      {c.listManager && <ListManager path={c.listManager} />}
      {c.list && <List path={c.list} />}
    </div>
  );
};
