import { EffectsManager } from "@softer-components/utils";

import { CreateListContract } from "./create-list.component";

export const configureCreateList = (
  effectsManager: EffectsManager<CreateListContract>,
) => {
  effectsManager.configureEffects("/");
};
