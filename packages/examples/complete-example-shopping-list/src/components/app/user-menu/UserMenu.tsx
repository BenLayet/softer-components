import { useSofter } from "@softer-components/redux-adapter";

import { UserMenuContract } from "./user-menu.component";

export const UserMenu = ({ path = "" }) => {
  const [v, d] = useSofter<UserMenuContract>(path);
  return (
    <div className="menu-item">
      {v.isAnonymous && (
        <a
          onClick={() => d.loginRequested()}
          title="Sign in to share your lists"
        >
          🔓 Sign in
        </a>
      )}
      {v.isAuthenticated && (
        <>
          Hi {v.username}!{" "}
          <a
            onClick={() => d.logoutRequested()}
            title="Sign out and return to anonymous mode"
          >
            sign out
          </a>
        </>
      )}
    </div>
  );
};
