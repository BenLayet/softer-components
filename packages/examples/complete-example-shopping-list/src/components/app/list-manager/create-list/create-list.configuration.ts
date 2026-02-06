import { EffectsManager } from "@softer-components/utils";

import { CreateListContract } from "./create-list.component.ts";

export const configureCreateList = (
  effectsManager: EffectsManager<CreateListContract>,
) => {
  effectsManager.configureEffects("/");
};
