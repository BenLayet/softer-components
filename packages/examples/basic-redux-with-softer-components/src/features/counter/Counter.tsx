import { Amount } from "../amount/Amount.tsx"
import styles from "./Counter.module.css"
import { counterComponentDef } from "./counterComponent.ts"
import { useSofter } from "@softer-components/redux-adapter"

export const Counter = ({ path } = { path: "/" }) => {
  const [values, events, childrenPaths] = useSofter(path, counterComponentDef) //useSofter in ReactReduxAdapter
  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => events.decrementRequested()}
        >
          -
        </button>
        <label
          aria-label="Count"
          className={styles.value}
          style={{ color: values.isEven ? "blue" : "red" }}
        >
          {values.count}
        </label>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => events.incrementRequested()}
        >
          +
        </button>
      </div>
      <div className={styles.row}>
        <Amount path={childrenPaths.amount} />
        <button
          className={styles.button}
          onClick={() => events.incrementByAmountRequested()}
        >
          Add Amount
        </button>
      </div>
    </div>
  )
}
