import { Effects } from "@softer-components/types";

import { listService } from "../../../../service/list-service.ts";
import { CreateListContract } from "./create-list.component.ts";

export const createListEffects: Effects<CreateListContract> = {
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
