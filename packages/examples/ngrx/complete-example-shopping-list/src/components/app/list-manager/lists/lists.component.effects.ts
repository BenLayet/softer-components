import type { Effects } from "@softer-components/types";
import type { Contract } from "./lists.component.contract";
import type { EffectsDependencies } from "./lists.component.dependencies";

export const effects = ({ listService }: EffectsDependencies): Effects<Contract> => ({
  fetchRequested: async ({ fetchSucceeded, fetchFailed }) => {
    try {
      const allLists = await listService.getAll();
      fetchSucceeded(allLists);
    } catch (e) {
      if (e instanceof Error) {
        fetchFailed(e.message);
      } else {
        fetchFailed("unknown error");
        console.error(e);
      }
    }
  },
  deleteRequested: async ({ deleteSucceeded, deleteFailed }, { payload: listId }) => {
    try {
      await listService.delete(listId);
      deleteSucceeded();
    } catch (e) {
      if (e instanceof Error) {
        deleteFailed(e.message);
      } else {
        deleteFailed("unknown error");
        console.error(e);
      }
    }
  },
});
