import { Effects } from "@softer-components/types";

import { ListService } from "../../../../port/list.service";
import { Contract } from "./create-list.component.contract";

export type EffectsDependencies = {
  listService: ListService;
};

export const effects = ({
  listService,
}: EffectsDependencies): Effects<Contract> => ({
  createNewListRequested: async (
    { createNewListSucceeded, createNewListFailed },
    { payload: name },
  ) => {
    try {
      const list = await listService.create(name);
      createNewListSucceeded(list);
    } catch (e: any) {
      createNewListFailed(e.message);
    }
  },
});
