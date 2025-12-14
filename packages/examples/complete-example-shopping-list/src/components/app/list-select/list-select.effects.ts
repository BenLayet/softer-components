import { Effects } from "@softer-components/types";

import { listService } from "../../../service/list-service.ts";
import { ListSelectContract } from "./list-select.component.ts";

export const listSelectEffects: Effects<ListSelectContract> = {
  createNewListRequested: async (
    { createNewListSucceeded, createNewListFailed },
    { payload: name },
  ) => {
    try {
      const list = await listService.create(name);
      createNewListSucceeded(list);
    } catch (e: any) {
      createNewListFailed(e.message);
      console.error(e);
    }
  },
};
