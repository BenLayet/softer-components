import { List } from "../../model/List.ts";
import { shoppingListComponentDef } from "../shopping-list/shopping-list.component.ts";
import { listSelectComponentDef } from "../list-select/list-select.component.ts";
import { componentDefBuilder } from "@softer-components/types";

export const appComponentDef = componentDefBuilder
    .initialState({ listName: null as string | null })
    .selectors({
        selectedListName: state => state.listName ?? "",
        isSelected: state => state.listName !== null,
    })
    .events<{ listSelected: List }>({
        listSelected: {
            stateUpdater: (state, selectedList) => ({
                ...state,
                listName: selectedList.name,
            }),
        },
    })
    .children({
        shoppingList: { componentDef: shoppingListComponentDef },
        listSelect: { componentDef: listSelectComponentDef },
    })
    .input([
        {
            onEvent: "listSelect/createNewListRequested",
            thenDispatch: "listSelected",
            withPayload: (_: {}, name: string) => ({ name, items: [] }),
        },
    ])
    .build();
