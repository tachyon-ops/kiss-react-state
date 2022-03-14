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
import { AnyAction, ProcessAction, SetupStore } from './index';

enum ActionType {
  INCREMENT,
  DECREMENT,
  RESET,
}
type CountState = { counter: number };

const s = new SetupStore<ActionType, CountState>('', { counter: 0 });

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
const reset = s.setSimpleAction(ActionType.RESET, () => s.getInitialState());

/**
 * Processes
 */
type AppProcessType<R> = ProcessAction<R, CountState, null, AnyAction>;

type TestAsyncProcess = (amount: number) => AppProcessType<boolean>;
const testAsync: TestAsyncProcess = (amount) => (dispatch) => {
  setTimeout(() => dispatch(increment(amount)), 1000);
  return true;
};

const { Provider: CountProvider, useContext: useCount } = s.build(
  { increment, decrement, reset },
  { testAsync }
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
      <CountProvider>
        <CountPage />
      </CountProvider>
    </header>
  </div>
);
```

### 3 You can create your `CounterPage.tsx`

```ts
import React from 'react';
import { CountProvider, useCount } from './CountContext';

export function Counter() {
  const {
    actions: { increment, decrement },
    processes: { testAsync },
  } = useCount();
  return (
    <>
      <button onClick={() => increment(1)}>+</button>
      <button onClick={() => decrement(1)}>-</button>
      <button onClick={() => testAsync(10)}>Test async (process/akind to thunk)</button>
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

In order to be a bit more true to the test, we did 3 trials

* Accumulating

 `kiss-react-state`

| Operation       | ms   | ms   | ms   |
| :-------------- | ---: | ---: | ---: |
|Added 100        | 3    | 3    | 3    |
|Added 1 100      | 1    | 2    | 1    |
|Added 11 100     | 2    | 2    | 2    |
|Added 1 011 100  | 143  | 132  | 154  |
|Added 11 011 100 | 1019 | 975  | 1026 |
|Added 61 011 100 | 2303 | 2242 | 2228 |

 `react-redux`

| Operation       | ms   | ms   | ms   |
| :-------------- | ---: | ---: | ---: |
|Added 100        | 3    | 4    | 4    |
|Added 1 100      | 1    | 2    | 2    |
|Added 11 100     | 2    | 2    | 4    |
|Added 1 011 100  | 97   | 114  | 94   |
|Added 10 011 100 | 1543 | 1545 | 932  |
|Added 30 011 100 | 3378 | 3212 | 2222 |

* Resetting

 `kiss-react-state`

| Operation       | ms   | ms   | ms   |
| :-------------- | ---: | ---: | ---: |
|Added 100        | 1    | 1    | 1    |
|Added 1 000      | 1    | 1    | 1    |
|Added 10 000     | 2    | 2    | 2    |
|Added 1 000 000  | 321  | 113  | 298  |
|Added 10 000 000 | 1128 | 1072 | 1254 |
|Added 50 000 000 | 2123 | 2347 | 2190 |

 `react-redux`

| Operation       | ms   | ms   | ms   |
| :-------------- | ---: | ---: | ---: |
|Added 100        | 3    | 2    | 3    |
|Added 1 000      | 1    | 1    | 1    |
|Added 10 000     | 2    | 2    | 2    |
|Added 1 000 000  | 85   | 85   | 89   |
|Added 10 000 000 | 1587 | 1573 | 1872 |
|Added 50 000 000 | 5099 | 5147 | 4675 |

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
