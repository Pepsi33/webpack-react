import React, { memo, useState } from 'react';
import { hot } from 'react-hot-loader/root';

import style from './app.scss';

interface CounterProps {
    initialCount?: number;
}

const Counter = memo(function Counter({ initialCount = 0 }: CounterProps) {
    const [count, setCount] = useState(initialCount);

    const add = () => {
        setCount(count + 1);
    };

    return (
        <div className={style.counter}>
            <input type="text" value={count} readOnly />
            <button type="button" onClick={add}>
                +
            </button>
        </div>
    );
});

const App = () => (
    <div className="app">
        <h2 className="title">react</h2>
        <Counter />
    </div>
);

export default hot(App);
