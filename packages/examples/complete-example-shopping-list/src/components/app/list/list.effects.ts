import { Effects } from "@softer-components/types";

import { ListService } from "../../../port/list.service";
import { ListContract } from "./list.component";

export const listEffects: (configuration: {
  listService: ListService;
}) => Effects<ListContract> = ({ listService }) => ({
  saveRequested: async ({ saveSucceeded, saveFailed }, { values }) => {
    try {
      await listService.save(values.list());
      saveSucceeded();
    } catch (e: any) {
      saveFailed(e.message);
    }
  },
});
