import { EffectsConfiguration } from "@softer-components/utils";

import { ListService } from "../../../adapter/list-service";
import { ListManagerContract } from "./list-manager.component";
import { configureLists } from "./lists/lists.configuration";

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
