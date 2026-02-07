import { ListService } from "../../../../adapter/list-service";
import { listsEffects } from "./lists.effects";

export const configureLists = (
  configuration: {
    listService: ListService;
  },
  effectsManager: any,
) => {
  effectsManager.registerEffects(listsEffects(configuration));
};
