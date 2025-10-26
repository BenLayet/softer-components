import { componentDefBuilder } from "@softer-components/types";

export const listSelectComponentDef = componentDefBuilder
  .initialState({ listName: "" })
  .selectors({ listName: state => state.listName })
  .events<{
    listNameChanged: string;
    createNewListClicked: undefined;
    createNewListRequested: string;
    openPreviousListRequested: undefined;
  }>({
    listNameChanged: {
      stateUpdater: (state, payload) => ({ ...state, listName: payload }),
    },
    createNewListClicked: {
      forwarders: [
        {
          to: "createNewListRequested",
          withPayload: state => state.listName,
        },
      ],
    },
    createNewListRequested: {},
    openPreviousListRequested: {},
  })
  .build();
