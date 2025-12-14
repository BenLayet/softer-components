import { Effects } from "@softer-components/types";

import { List } from "../../../model";
import { listService } from "../../../service/list-service.ts";
import { ListContract } from "./list.component.ts";

export const listEffects: Effects<ListContract> = {
  saveRequested: async (
    { saveSucceeded, saveFailed },
    { selectors, children },
  ) => {
    try {
      const list: List = {
        id: selectors.id(),
        name: selectors.name(),
        listItems: Object.values(children.itemRows).map(values =>
          values.selectors.listItem(),
        ),
      };
      await listService.save(list);
      saveSucceeded();
    } catch (e: any) {
      saveFailed(e.message);
      console.error(e);
    }
  },
};
