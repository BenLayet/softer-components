import { useSofter } from "@softer-components/redux-adapter";
import { useEffect } from "react";

import { CreateList } from "./create-list/CreateList.tsx";
import { ListSelectContract } from "./list-select.component.ts";
import { Lists } from "./lists/Lists.tsx";

export const ListSelect = ({ path = "" }) => {
  const [v, d, c] = useSofter<ListSelectContract>(path);
  useEffect(() => {
    d.displayed();
  }, [d]);
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
