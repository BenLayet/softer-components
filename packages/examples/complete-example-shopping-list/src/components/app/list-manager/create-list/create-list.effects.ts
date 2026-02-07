import { Effects } from "@softer-components/types";

import { ListService } from "../../../../port/list.service";
import { CreateListContract } from "./create-list.component";

export const createListEffects: (configuration: {
  listService: ListService;
}) => Effects<CreateListContract> = ({ listService }) => ({
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
});
