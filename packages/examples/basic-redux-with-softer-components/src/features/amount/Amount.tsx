import {JSX} from "react";
import styles from "../counter/Counter.module.css";
import { amountComponentDef } from "./amountComponent";

export const Amount = (softerPath:string): JSX.Element => {
    const [dispatchers, selectors] = useSofter(softerPath, amountComponentDef);

    return (
        <input
            className={styles.textbox}
            aria-label="Set increment amount"
            value={selectors.amount}
            type="number"
            onChange={e => {
                dispatchers.setAmountRequested(parseInt(e.target.value)))
            }}
        />
    )
}
