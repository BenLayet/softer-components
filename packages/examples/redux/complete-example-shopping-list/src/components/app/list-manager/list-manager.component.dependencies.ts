import type { ListService } from "../../../port/list.service";
import type { UserContextPath } from "../user-context/user-context.component";

export type Dependencies = {
  services: {
    listService: ListService;
  };
  contextsPath: UserContextPath;
};
