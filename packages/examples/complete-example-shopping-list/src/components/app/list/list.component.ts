import {
  ComponentDef,
  ExtractComponentChildrenContract,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { ItemId, List, ListId, ListItem } from "../../../model";
import { itemRowDef } from "./item-row/item-row.component.ts";

// State
type Error = "SAVE_FAILED";
type ErrorMessage = string;
type ListState = {
  id: ListId;
  name: string;
  nextItemName: string;
  isSaving: boolean;
  errors: { [key in Error]?: {} };
};
type ListEvents = {
  initialize: { payload: List };
  goBackClicked: { payload: undefined };
  nextItemNameChanged: { payload: string };
  nextItemSubmitted: { payload: undefined };
  createItemOrIncrementQuantityRequested: { payload: string };
  resetNextItemNameRequested: { payload: undefined };
  incrementItemQuantityRequested: { payload: ItemId };
  createItemRequested: { payload: ListItem };
  removeItemRequested: { payload: ItemId };
  saveRequested: {
    payload: undefined;
    canTrigger: ["saveSucceeded", "saveFailed"];
  };
  saveSucceeded: { payload: undefined };
  saveFailed: { payload: ErrorMessage };
};

const childrenComponents = {
  itemRows: itemRowDef,
};

const listSelectors = {
  id: state => state.id,
  name: state => state.name,
  nextItemName: state => state.nextItemName,
  nextItemSanitizedName: state => state.nextItemName.trim(),
  isNextItemNameValid: state => state.nextItemName.trim().length > 0,
  hasSaveFailedError: state => state.errors["SAVE_FAILED"] !== undefined,
  isSaving: state => state.isSaving,
} satisfies Selectors<ListState>;

export type ListContract = {
  state: ListState;
  values: ExtractComponentValuesContract<typeof listSelectors>;
  events: ListEvents;
  children: ExtractComponentChildrenContract<typeof childrenComponents>;
};

export const listDef: ComponentDef<ListContract> = {
  selectors: listSelectors,
  uiEvents: ["nextItemNameChanged", "nextItemSubmitted", "goBackClicked"],
  updaters: {
    initialize: ({ payload: list, childrenKeys }) => {
      childrenKeys.itemRows = list.listItems.map(
        listItem => `${listItem.item.id}`,
      );
      return {
        id: list.id,
        name: list.name,
        isSaving: false,
        errors: {},
        nextItemName: "",
      };
    },
    nextItemNameChanged: ({ state, payload: nextItemName }) => {
      state.nextItemName = nextItemName;
    },
    resetNextItemNameRequested: ({ state }) => {
      state.nextItemName = "";
    },
    createItemRequested: ({
      childrenKeys: { itemRows },
      payload: listItem,
    }) => {
      itemRows.push(`${listItem.item.id}`);
    },
    removeItemRequested: ({
      childrenKeys: { itemRows },
      payload: idToRemove,
    }) => {
      itemRows.splice(itemRows.indexOf(`${idToRemove}`), 1);
    },
    saveRequested: ({ state }) => {
      state.isSaving = true;
      state.errors = {};
    },
    saveFailed: ({ state, payload: errorMessage }) => {
      state.errors["SAVE_FAILED"] = errorMessage;
      state.isSaving = false;
    },
    saveSucceeded: ({ state }) => {
      state.isSaving = false;
      state.errors = {};
    },
  },
  eventForwarders: [
    {
      from: "nextItemSubmitted",
      to: "createItemOrIncrementQuantityRequested",
      withPayload: ({ selectors }) => selectors.nextItemSanitizedName(),
      onCondition: ({ selectors }) => selectors.isNextItemNameValid(),
    },
    {
      from: "createItemOrIncrementQuantityRequested",
      to: "createItemRequested",
      onCondition: ({ children: { itemRows }, payload: itemName }) =>
        Object.values(itemRows).every(
          itemRow => itemRow.selectors.name() !== itemName,
        ),
      withPayload: ({ payload: name, children: { itemRows } }) => ({
        item: {
          name,
          id:
            Object.keys(itemRows)
              .map(Number)
              .reduce((maxId, id) => (id > maxId ? id : maxId), 0) + 1,
        },
        quantity: 1,
      }),
    },
    {
      from: "createItemOrIncrementQuantityRequested",
      to: "incrementItemQuantityRequested",
      onCondition: ({ children: { itemRows }, payload: itemName }) =>
        Object.values(itemRows).some(
          itemRow => itemRow.selectors.name() === itemName,
        ),
      withPayload: ({ children: { itemRows }, payload: itemName }) =>
        Object.entries(itemRows)
          .filter(([, item]) => item.selectors.name() === itemName)
          .map(([key]) => key)
          .map(Number)[0],
    },
    {
      from: "createItemOrIncrementQuantityRequested",
      to: "resetNextItemNameRequested",
    },
    {
      from: "createItemRequested",
      to: "saveRequested",
    },
    {
      from: "removeItemRequested",
      to: "saveRequested",
    },
  ],
  childrenComponents,
  initialChildrenKeys: { itemRows: [] },
  childrenConfig: {
    itemRows: {
      commands: [
        {
          from: "incrementItemQuantityRequested",
          to: "incrementRequested",
          toKeys: ({ payload: id }) => [`${id}`],
        },
        {
          from: "createItemRequested",
          to: "initialize",
          toKeys: ({
            payload: {
              item: { id },
            },
          }) => [`${id}`],
        },
        {
          from: "initialize",
          to: "initialize",
          withPayload: ({ childKey, payload: { listItems } }) =>
            listItems.find(i => i.item.id === parseInt(childKey)) as ListItem,
        },
      ],
      listeners: [
        {
          from: "removeItemRequested",
          to: "removeItemRequested",
          withPayload: ({ childKey }) => parseInt(childKey),
        },
        {
          from: "itemChanged",
          to: "saveRequested",
        },
      ],
    },
  },
  effects: {
    saveRequested: ["saveSucceeded", "saveFailed"],
  },
};
