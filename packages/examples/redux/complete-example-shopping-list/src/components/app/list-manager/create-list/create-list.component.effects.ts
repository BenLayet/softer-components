import type { Effects } from "@softer-components/types";

import type { ListService } from "../../../../port/list.service";
import type { Contract } from "./create-list.component.contract";

export type EffectsDependencies = {
  listService: ListService;
};

export const effects = ({ listService }: EffectsDependencies): Effects<Contract> => ({
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
