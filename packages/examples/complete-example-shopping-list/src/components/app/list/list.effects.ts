import { Effects } from "@softer-components/types";

import { List } from "../../../model";
import { listService } from "../../../service/list-service.ts";
import { ListContract } from "./list.component.ts";

export const listEffects: Effects<ListContract> = {
  saveRequested: async (
    { saveSucceeded, saveFailed },
    { values, childrenValues },
  ) => {
    try {
      const list: List = {
        id: values.id(),
        name: values.name(),
        listItems: Object.values(childrenValues.itemRows).map(itemRow =>
          itemRow.values.listItem(),
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
