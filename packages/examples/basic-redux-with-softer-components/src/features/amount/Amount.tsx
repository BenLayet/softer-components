import styles from "../counter/Counter.module.css"
import { amountComponentDef } from "./amountComponent"
import { useSofter } from "@softer-components/redux-adapter"

export const Amount = ({ path } = { path: "/" }) => {
  const [values, events] = useSofter(path, amountComponentDef)

  return (
    <input
      className={styles.textbox}
      aria-label="Set increment amount"
      value={values.amount}
      type="number"
      onChange={e => events.setAmountRequested(parseInt(e.target.value))}
    />
  )
}
