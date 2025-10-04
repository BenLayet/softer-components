import type { JSX } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import styles from "./Counter.module.css"
import {
    decrementRequested,
    incrementRequested,
    selectCount,
    incrementByAmountRequested,
} from "./counterSlice"
import {Amount} from "../amount/Amount.tsx";
import {selectAmount} from "../amount/amountSlice.ts";

export const Counter = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const count = useAppSelector(selectCount)
    const amount = useAppSelector(selectAmount)

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
                <Amount/>
                <button
                    className={styles.button}
                    onClick={() => dispatch(incrementByAmountRequested(amount))}
                >
                    Add Amount
                </button>
            </div>
        </div>
    )
}
