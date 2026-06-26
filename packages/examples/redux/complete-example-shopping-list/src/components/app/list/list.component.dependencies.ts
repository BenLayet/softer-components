import type { ListService } from "../../../port/list.service";

export type Dependencies = {
  services: {
    listService: ListService;
  };
};
