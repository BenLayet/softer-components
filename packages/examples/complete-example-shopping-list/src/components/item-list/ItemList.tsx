import {useSofterChildrenPath} from "@softer-components/redux-adapter";
import {itemListDef} from "./item-list.component";
import {Item} from "../item/Item";

export const ItemList = ({path = "/"}) => {
    const {items} = useSofterChildrenPath(path, itemListDef);
    return (
        <>
            {items.map(itemPath => <Item key={itemPath} path={itemPath}/>)}
        </>
    );
};
