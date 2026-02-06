import { EffectsConfiguration } from "@softer-components/utils";

import { ListService } from "../../../service/list-service.ts";
import { ListManagerContract } from "./list-manager.component.ts";
import { configureLists } from "./lists/lists.configuration.ts";

export const configureListManager = (
  configuration: {
    listService: ListService;
  },
  effectsConfig: EffectsConfiguration<ListManagerContract>,
) => {
  configureLists(effectsConfig.for("/lists"), configuration);
};

export const listManagerConfiguration: (providers: {
  listService: ListService;
}) => Configuration<ListManagerContract> = providers => ({
  own: {},
  children: {
    lists: listsConfiguration(providers),
  },
});
