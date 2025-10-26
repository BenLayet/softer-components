import { newItemFormDef } from "./new-item-form.component";
import { useSofter } from "@softer-components/redux-adapter";

export const AddItemForm = ({ path = "/" }) => {
  const [{ name }, { nameChanged, submitted }] = useSofter(
    path,
    newItemFormDef,
  );
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        submitted();
      }}
    >
      <input
        type="text"
        value={name}
        onChange={e => nameChanged(e.target.value)}
      />
      <button type="submit">Add Item</button>
    </form>
  );
};
