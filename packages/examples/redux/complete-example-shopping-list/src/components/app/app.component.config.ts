import type { ComponentDefConfig } from "@softer-components/types";
import { listDef } from "./list/list.component";
import { listManagerDef } from "./list-manager/list-manager.component";
import { signInFormComponentDef } from "./sign-in-form/sign-in-form.component";
import { userContextDef } from "./user-context/user-context.component";
import { userMenuDef } from "./user-menu/user-menu.component";
import type { Dependencies } from "./app.component.dependencies";
import type { AppContract } from "./app.component";

export const config = (dependencies: Dependencies): ComponentDefConfig<AppContract> => ({
  childrenDefs: {
    userContext: userContextDef(dependencies),
    userMenu: userMenuDef(dependencies),
    signInForm: signInFormComponentDef(dependencies),
    list: listDef(dependencies),
    listManager: listManagerDef(dependencies),
  },
});
