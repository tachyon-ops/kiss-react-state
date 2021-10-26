# KISS-REACT-STATE

<!-- STORY -->

This module is aimed at reducing the work of web developers while setting up simple state management. The goal is to become a modular context state management simplification while still using Types to get your IDE to help you.
It follows the Keep It Super Simple philosophy.

The work was based on my previous `redux-auto-actions` library, and after getting a termendous amount of inspiration from Kent C. Dodds article [Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react) - many thanks! Keep them comming :)

## Import

```js
import {
    StoreModule
} from 'kiss-react-state';
```

## Usage

### 1 First create `CountContext.ts`

```ts
import React from 'react';
import { AnyAction, ProcessAction, StoreModule } from 'kiss-react-state';

enum ActionType {
  INCREMENT,
  DECREMENT,
  RESET,
}
type CountState = { counter: number };

const s = new StoreModule<ActionType, CountState>('', { counter: 0 });

/**
 * Exportable Actions
 */
const increment = s.setPayloadAction<number>(
  ActionType.INCREMENT,
  (state, action) => ({
    ...state,
    counter: state.counter + action.payload,
  })
);
const decrement = s.setPayloadAction<number>(
  ActionType.DECREMENT,
  (state, action) => ({
    ...state,
    counter: state.counter - action.payload,
  })
);
const reset = s.setSimpleAction(ActionType.RESET, () => s.initialState);

/**
 * Processees
 */
type AppProcessType<R> = ProcessAction<R, CountState, null, AnyAction>;

type TestAsyncProcess = (amount: number) => AppProcessType<boolean>;
const testAsync: TestAsyncProcess = (amount) => (dispatch) => {
  setTimeout(() => dispatch(increment(amount)), 1000);
  return true;
};

const CountContext = s.getContext();
const useCount = s.useContext(
  CountContext,
  { increment: () => increment(1), decrement: () => decrement(1), reset },
  { testAsync: () => testAsync(10) }
);

const CountProvider: React.FC = ({ children }) => (
  <CountContext.Provider value={s.getMemoValueHook()()}>
    {children}
  </CountContext.Provider>
);

export { CountProvider, useCount };
```

### 2 Now add the Context to the DOM `Provider` (adding to `App.ts` )

```ts
import React from 'react';

import { CountProvider } from './CountContext';
import { CountPage } from './Page';
import './App.css';

export const App = () => (
  <div className="App">
    <header className="App-header">
      <CountProvider />
      <CountPage />
    </header>
  </div>
);
```

### 3 You can create your `CounterPage.tsx`

```ts
import React from 'react';
import { CountProvider, useCount } from './CountContext';

export function Counter() {
  const { increment, decrement, testAsync } = useCount();
  return (
    <>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={testAsync}>Test async (process/akind to thunk)</button>
    </>
  );
}

export function CountDisplay() {
  const { state } = useCount();
  return <div>The current counter count is {state.counter}</div>;
}

export function CountPage() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  );
}
```

Supper simple right? In 3 components, with very little boillerplate you can setup termendous amounts of power. Do keep an eye on re-renderers and now that you can setup any unmber of contexts you want, you could modulate your state way better than with redux. This way you run only specific hooks and can even provide update logics between stores by using `useEffect` . Be careful though! Every time you do that, double check you don't run into infinite loops or cyclic updates (ContextA Store -> updates -> ContextB Store -> which in turn updates Context A Store).

Have fun!

### Performance

 `kiss-react-state`

```TypeScript
Added 100 in 3ms
Added 1 000 in 1ms
Added 10 000 in 2ms
Added 1 000 000 in 120ms
Added 10 000 000 in 1045ms
```

 `react-redux`

```TypeScript
Added 100 in 5ms
Added 1 000 in 3ms
Added 10 000 in 4ms
Added 1 000 000 in 84ms
Added 10 000 000 in 1459ms
```

### Help with work

Just fork and do a PR :) I will add you to the colaborators list with a BIG thank you!

* If you want to buy me a coffee or a beer as a thank you, I'm very much appreciated :stuck_out_tongue_winking_eye: [![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=D3J2WXTXLAWK8&source=url)

### Guidelines

Whenever a new `master` is deployed, it should be tagged with the new deployed version.
After we reach version 1.0.0 as the first release (production ready). After that, we follow semantic versioning.

### Publishing

Remember to always publish on a merge request. Pipeline `master:only` actions will be created in the future, once we stabilize this library.

Enjoy!

## Troubleshooting

* Create an issue
