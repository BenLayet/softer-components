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

export const Counter = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const count = useAppSelector(selectCount)
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
                    onClick={() => dispatch(incrementByAmountRequested())}
                >
                    Add Amount
                </button>
            </div>
        </div>
    )
}
