import { configureSofterStore } from "@softer-components/redux-adapter";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { App, appDef } from "./components/app/app.component";
import { services } from "./services";
import "./index.css";
import type { StatePathString } from "@softer-components/types";
import {
  type UserContextContract,
  userContextSymbol,
} from "./components/app/user-context/user-context.component";

const contextsPath = {
  [userContextSymbol]: "/userContext" as StatePathString<UserContextContract>,
};
const dependencies = { services, contextsPath };
export const store = configureSofterStore(appDef(dependencies));
const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>,
  );
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  );
}
