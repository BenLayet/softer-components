import { useSofter } from "@softer-components/redux-adapter";
import { useEffect } from "react";

import { CreateList } from "./create-list/CreateList";
import { ListManagerContract } from "./list-manager.component";
import { Lists } from "./lists/Lists";

export const ListManager = ({ path = "" }) => {
  const [v, d, c] = useSofter<ListManagerContract>(path);
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
