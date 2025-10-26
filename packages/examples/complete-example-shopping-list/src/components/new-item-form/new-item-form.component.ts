import { componentDefBuilder } from "@softer-components/types";

export const newItemFormDef = componentDefBuilder
  .initialState({ name: "" })
  .selectors({ name: state => state.name })
  .events<{
    newItemSubmitted: string;
    nameChanged: string;
    submitted: undefined;
  }>({
    nameChanged: {
      stateUpdater: (state, name) => ({ ...state, name }),
    },
    submitted: {
      forwarders: [
        {
          to: "newItemSubmitted",
          withPayload: state => state.name,
        },
      ],
    },
    newItemSubmitted: {},
  })
  .build();
