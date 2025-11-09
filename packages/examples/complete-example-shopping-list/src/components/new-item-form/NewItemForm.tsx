import { useSofter } from "@softer-components/redux-adapter";
import { NewItemFormUi } from "./new-item-form.component";

export const NewItemForm = ({ path = "/" }) => {
  const [{ name }, { nameChanged, submitted }] = useSofter<NewItemFormUi>(path);
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
