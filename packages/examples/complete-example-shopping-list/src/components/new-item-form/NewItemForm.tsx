import { useSofter } from "@softer-components/redux-adapter";
import { newItemFormDef } from "./new-item-form.component";

export const AddItemForm = ({ path = "/" }) => {
  const [{ itemName }, { itemNameChanged, formSubmitted }] = useSofter(
    path,
    newItemFormDef,
  );
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        formSubmitted();
      }}
    >
      <input
        type="text"
        value={itemName}
        onChange={e => itemNameChanged(e.target.value)}
      />
      <button type="submit">Add Item</button>
    </form>
  );
};
