import type { Effects } from "@softer-components/types";

import type { ListService } from "../../../port/list.service";
import type { Contract } from "./list.component.contract";

export type EffectsDependencies = {
  listService: ListService;
};

export const effects = ({
  listService,
}: EffectsDependencies): Effects<Contract> => ({
  saveRequested: async ({ saveSucceeded, saveFailed }, { values }) => {
    try {
      await listService.save(values.list());
      saveSucceeded();
    } catch (e: any) {
      saveFailed(e.message);
      console.error(e);
    }
  },
});
