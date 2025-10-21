import {useSofter} from "@softer-components/redux-adapter";
import {itemDef} from "./item.component";

export const Item = ({path = "/"}) => {
    const [{name, id}, {itemClicked}] = useSofter(path, itemDef);
    return (
        <div className="clickable" onClick={() => itemClicked(id)}>{name}</div>
    );
};
    