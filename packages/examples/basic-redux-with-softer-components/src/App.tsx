import "./App.css"
import {Counter} from "./features/counter/Counter"

export const App = () => (
    <div className="App">
        <h1>Redux Counter Example</h1>
        <h2>With softer components</h2>
        <header className="App-header">
            <Counter/>
        </header>
    </div>
)
