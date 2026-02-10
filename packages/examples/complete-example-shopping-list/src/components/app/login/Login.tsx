import { useSofter } from "@softer-components/redux-adapter";

import { LoginContract } from "./login.component";

export const Login = ({ path = "" }) => {
  const [v, d] = useSofter<LoginContract>(path);
  return (
    <div>
      <div style={{ margin: "2em" }}>
        <a onClick={() => d.loginCancelled()}>👋 Try app without login</a>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          d.loginSubmitted();
        }}
        style={{ alignItems: "start", maxWidth: "18em" }}
        autoComplete="off"
      >
        <label>Username</label>
        <input
          type="text"
          placeholder="Username"
          onChange={e => d.usernameChanged(e.target.value)}
          autoComplete="off"
        />
        <p className="hint">Use either 'alice' or 'bob'</p>
        <label>Password</label>
        <input
          type="text"
          placeholder="Password"
          onChange={e => d.passwordChanged(e.target.value)}
          autoComplete="off"
        />
        <p className="hint">Use 'demo'</p>
        <div>
          <button type="submit">🚀 Login</button>
        </div>
      </form>
      {v.hasInvalidCredentialError && (
        <p className="error">
          ❌ Invalid username or password.
          <br />
          Use 'alice' or 'bob' as username and 'demo' as password.
        </p>
      )}
      {v.hasNetworkError && (
        <p className="error">
          🌐 Network error. Please check your connection and try again.
        </p>
      )}
      {v.hasUnknownError && (
        <p className="error">
          ⚠️ An unknown error occurred. Please try again later.
        </p>
      )}
      {v.isProcessing && <span className="spinner" />}
    </div>
  );
};
