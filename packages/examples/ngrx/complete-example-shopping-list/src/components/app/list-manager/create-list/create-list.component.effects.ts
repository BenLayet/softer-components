import type { Effects } from "@softer-components/types";

import type { Contract } from "./create-list.component.contract";
import type { Dependencies } from "./create-list.component.dependencies";

export const effects = ({ listService }: Dependencies["services"]): Effects<Contract> => ({
  createNewListRequested: async (
    { createNewListSucceeded, createNewListFailed },
    { payload: name },
  ) => {
    try {
      const list = await listService.create(name);
      createNewListSucceeded(list);
    } catch (e) {
      if (e instanceof Error) {
        createNewListFailed(e.message);
      } else {
        createNewListFailed("unknown error");
        console.error(e);
      }
    }
  },
});
