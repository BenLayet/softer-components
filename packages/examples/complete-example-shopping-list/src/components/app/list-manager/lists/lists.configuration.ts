import { ListService } from "../../../../service/list-service.ts";
import { listsEffects } from "./lists.effects.ts";

export const configureLists = (
  configuration: {
    listService: ListService;
  },
  effectsManager: any,
) => {
  effectsManager.registerEffects(listsEffects(configuration));
};
