import type { Effects } from "@softer-components/types";

import type { Contract } from "./list.component.contract";
import type { Dependencies } from "./list.component.dependencies";

export const effects = ({ listService }: Dependencies["services"]): Effects<Contract> => ({
  saveRequested: async ({ saveSucceeded, saveFailed }, { values }) => {
    try {
      await listService.save(values.list());
      saveSucceeded();
    } catch (e) {
      if (e instanceof Error) {
        saveFailed(e.message);
      } else {
        saveFailed("unknown error");
        console.error(e);
      }
    }
  },
});
