import { List } from "../../model/List.ts";
import { shoppingListComponentDef } from "../shopping-list/shopping-list.component.ts";
import { listSelectComponentDef } from "../list-select/list-select.component.ts";
import { ComponentDef } from "@softer-components/types";

const initialState = { listName: null as string | null };

export const appComponentDef: ComponentDef<
  typeof initialState,
  { listSelected: { payload: List } }
> = {
  initialState,
  selectors: {
    selectedListName: state => state.listName ?? "",
    isSelected: state => state.listName !== null,
  },
  events: {
    listSelected: {
      stateUpdater: (state, selectedList: List) => ({
        ...state,
        listName: selectedList.name,
      }),
    },
  },
  children: {
    shoppingList: shoppingListComponentDef,
    listSelect: listSelectComponentDef,
  },
};
