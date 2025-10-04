import type { JSX } from "react"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import styles from "./Counter.module.css"
import {
  decrementRequested,
  incrementRequested,
  selectCount,
    incrementByAmountRequested,
} from "./counterSlice.ts"

export const Counter = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCount)
  const [incrementAmount, setIncrementAmount] = useState(2)

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(decrementRequested())}
        >
          -
        </button>
        <label aria-label="Count" className={styles.value}>
          {count}
        </label>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(incrementRequested())}
        >
          +
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          type="number"
          onChange={e => {
            setIncrementAmount(parseInt(e.target.value))
          }}
        />
      </div>
        <button
            className={styles.button}
            onClick={() => dispatch(incrementByAmountRequested(incrementAmount))}
        >
            Add Amount
        </button>
    </div>
  )
}
