import { Effects } from "@softer-components/types";

import { listService } from "../../../service/list-service.ts";
import { ListContract } from "./list.component.ts";

export const listEffects: Effects<ListContract> = {
  saveRequested: async ({ saveSucceeded, saveFailed }, { values }) => {
    try {
      await listService.save(values.list());
      saveSucceeded();
    } catch (e: any) {
      saveFailed(e.message);
      console.error(e);
    }
  },
};
