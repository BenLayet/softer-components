import { useSofter } from "@softer-components/redux-adapter";

import { UserMenuContract } from "./user-menu.component";

export const View = ({ path = "" }) => {
  const [v, d] = useSofter<UserMenuContract>(path);
  return (
    <div className="menu-item">
      {v.isAnonymous && (
        <a
          onClick={() => d.signInRequested()}
          title="Sign in to share your lists"
        >
          🔓 Sign in
        </a>
      )}
      {v.isAuthenticated && (
        <>
          Hi <span style={{ textTransform: "capitalize" }}>{v.username}</span>!{" "}
          <a
            onClick={() => d.signOutRequested()}
            title="Sign out and return to anonymous mode"
          >
            sign out
          </a>
        </>
      )}
    </div>
  );
};
