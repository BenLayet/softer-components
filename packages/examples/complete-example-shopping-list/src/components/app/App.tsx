import { useSofter } from "@softer-components/redux-adapter";
import { useEffect } from "react";

import { AppContract } from "./app.component";
import { ListManager } from "./list-manager/";
import { List } from "./list/List";
import { SignInForm } from "./sign-in-form/SignInForm";
import { UserMenu } from "./user-menu/UserMenu";

export const App = ({ path = "" }) => {
  const [v, d, c] = useSofter<AppContract>(path);
  useEffect(() => {
    d.displayed();
  }, [d]);
  return (
    <div>
      <div className="menu-bar">
        {v.isUserMenuVisible && <UserMenu path={c.userMenu} />}
      </div>
      <h1>Shopping List</h1>
      {v.page === "LIST_MANAGER" && <ListManager path={c.listManager} />}
      {v.page === "LIST" && <List path={c.list} />}
      {v.page === "SIGN_IN_FORM" && <SignInForm path={c.signInForm} />}
    </div>
  );
};
