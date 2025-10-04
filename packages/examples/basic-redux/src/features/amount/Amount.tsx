import {JSX} from "react";
import {useAppDispatch, useAppSelector} from "../../app/hooks.ts";
import styles from "../counter/Counter.module.css";
import {selectAmount, setAmountRequested} from "./amountSlice.ts";

export const Amount = (): JSX.Element => {
    const dispatch = useAppDispatch()
    const amount = useAppSelector(selectAmount)

    return (
        <input
            className={styles.textbox}
            aria-label="Set increment amount"
            value={amount}
            type="number"
            onChange={e => {
                dispatch(setAmountRequested(parseInt(e.target.value)))
            }}
        />
    )
}
