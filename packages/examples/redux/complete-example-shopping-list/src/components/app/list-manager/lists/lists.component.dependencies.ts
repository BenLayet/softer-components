import type { UserContextDef, UserContextPath } from "../../user-context/user-context.component";
import type { ListService } from "../../../../port/list.service";
export type ContextsDef = UserContextDef;
export type EffectsDependencies = {
  listService: ListService;
};
export type Dependencies = { contextsPath: UserContextPath; dependencies: EffectsDependencies };
