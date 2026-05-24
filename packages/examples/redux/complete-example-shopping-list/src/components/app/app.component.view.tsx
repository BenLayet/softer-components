import { useSofter } from "@softer-components/redux-adapter";
import { useEffect } from "react";

import type { AppContract } from "./app.component";
import { List } from "./list/list.component";
import { ListManager } from "./list-manager/list-manager.component";
import { SignInForm } from "./sign-in-form/sign-in-form.component";
import { UserMenu } from "./user-menu/user-menu.component";

export const View = ({ path = "" }) => {
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
