import { useSofter } from "@softer-components/redux-adapter";

import { CreateList } from "./create-list";
import { Contract } from "./list-manager.component.contract";
import { Lists } from "./lists";

export const View = ({ path = "" }) => {
  const [v, _, c] = useSofter<Contract>(path);
  return (
    <div>
      {v.hasAnyList && (
        <div>
          {" "}
          <p style={{ textAlign: "start", width: "300px" }}>
            All lists ({v.listCount})
          </p>
          <Lists path={c.lists} />
        </div>
      )}
      <CreateList path={c.createList} />
    </div>
  );
};
