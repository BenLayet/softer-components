import type { ComponentDef } from "@softer-components/types";

import { itemRowDef } from "./item-row";
import type { Contract } from "./list.component.contract";
import type { EffectsDependencies} from "./list.component.effects";
import { effects } from "./list.component.effects";
import { uiEvents } from "./list.component.events";
import { childrenConfig, eventForwarders } from "./list.component.forwarders";
import { selectors } from "./list.component.selectors";
import type { State } from "./list.component.state";
import { childrenUpdaters, stateUpdaters } from "./list.component.updaters";

export type Dependencies = EffectsDependencies;

const componentDef = (dependencies: Dependencies): ComponentDef<Contract, State> => {
  return {
    selectors,
    uiEvents,
    stateUpdaters,
    childrenUpdaters,
    eventForwarders,
    childrenConfig,
    effects: effects(dependencies),
    childrenComponentDefs: {
      itemRows: itemRowDef(),
    },
    initialChildren: { itemRows: [] },
  };
};

export { componentDef };
