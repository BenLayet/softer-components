import {
  ComponentDef,
  ComponentEventsContract,
  EffectsDef,
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { ItemId, List, ListId, ListItem } from "../../../model";
import { ItemRowContract, itemRowDef } from "./item-row/item-row.component.ts";

// State
type Error = "SAVE_FAILED";
type ErrorMessage = string;
type State = {
  id: ListId;
  name: string;
  nextItemName: string;
  isSaving: boolean;
  errors: { [key in Error]?: {} };
};

// Events
type eventNames =
  | "initialize"
  | "goBackClicked"
  | "nextItemNameChanged"
  | "newItemSubmitted"
  | "createItemOrIncrementQuantityRequested"
  | "resetNextItemNameRequested"
  | "incrementItemQuantityRequested"
  | "createItemRequested"
  | "removeItemRequested"
  | "saveRequested"
  | "saveSucceeded"
  | "saveFailed";

type Events = ComponentEventsContract<
  eventNames,
  {
    initialize: List;
    nextItemNameChanged: string;
    createItemOrIncrementQuantityRequested: string;
    createItemRequested: ListItem;
    incrementItemQuantityRequested: ItemId;
    removeItemRequested: ItemId;
    saveFailed: ErrorMessage;
  }
>;

// Effects
const effects = {
  saveRequested: ["saveSucceeded", "saveFailed"],
} satisfies EffectsDef<eventNames>;

const childrenComponentDefs = {
  itemRows: itemRowDef,
};
type Children = { itemRows: ItemRowContract & { isCollection: true } };
const listSelectors = {
  id: state => state.id,
  name: state => state.name,
  nextItemName: state => state.nextItemName,
  nextItemSanitizedName: state => state.nextItemName.trim(),
  isNextItemNameValid: state => state.nextItemName.trim().length > 0,
  hasSaveFailedError: state => state.errors["SAVE_FAILED"] !== undefined,
  isSaving: state => state.isSaving,
  list: (state, childrenValues) => {
    const list: List = {
      id: state.id,
      name: state.name,
      listItems: Object.values(childrenValues.itemRows).map(itemRow =>
        itemRow.values.listItem(),
      ),
    };
    return list;
  },
} satisfies Selectors<State, Children>;

export type ListContract = {
  state: State;
  values: ExtractComponentValuesContract<typeof listSelectors>;
  events: Events;
  children: Children;
  effects: typeof effects;
};

export const listDef: ComponentDef<ListContract> = {
  selectors: listSelectors,
  uiEvents: ["nextItemNameChanged", "newItemSubmitted", "goBackClicked"],
  updaters: {
    initialize: ({ payload: list, children }) => {
      children.itemRows = list.listItems.map(listItem => `${listItem.item.id}`);
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
    createItemRequested: ({ children: { itemRows }, payload: listItem }) => {
      itemRows.push(`${listItem.item.id}`);
    },
    removeItemRequested: ({ children: { itemRows }, payload: idToRemove }) => {
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
      from: "newItemSubmitted",
      to: "createItemOrIncrementQuantityRequested",
      withPayload: ({ values }) => values.nextItemSanitizedName(),
      onCondition: ({ values }) => values.isNextItemNameValid(),
    },
    {
      from: "createItemOrIncrementQuantityRequested",
      to: "createItemRequested",
      onCondition: ({ childrenValues: { itemRows }, payload: itemName }) =>
        Object.values(itemRows).every(
          itemRow => itemRow.values.name() !== itemName,
        ),
      withPayload: ({ payload: name, childrenValues: { itemRows } }) => ({
        item: {
          name,
          id:
            Object.keys(itemRows)
              .map(Number)
              .reduce((maxId, id) => (id > maxId ? id : maxId), -1) + 1,
        },
        quantity: 1,
      }),
    },
    {
      from: "createItemOrIncrementQuantityRequested",
      to: "incrementItemQuantityRequested",
      onCondition: ({ childrenValues: { itemRows }, payload: itemName }) =>
        Object.values(itemRows).some(
          itemRow => itemRow.values.name() === itemName,
        ),
      withPayload: ({ childrenValues: { itemRows }, payload: itemName }) =>
        Object.entries(itemRows)
          .filter(([, item]) => item.values.name() === itemName)
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
  childrenComponentDefs,
  initialChildren: { itemRows: [] },
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
  effects,
};
