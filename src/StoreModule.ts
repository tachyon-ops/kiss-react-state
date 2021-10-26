import React, { Context, Dispatch } from 'react';
import {
  Action,
  AnyAction,
  PayloadAction,
  ProcessAction,
  SimpleAction,
  StoreModuleActions,
} from '.';

export class StoreModule<ActionType extends string | number, S extends {}> {
  path: string;

  initialState: S;

  reducers: {
    [key in ActionType]?: <
      A extends PayloadAction<ActionType, unknown> | SimpleAction<ActionType>
    >(
      state: S,
      action: A
    ) => S;
  } = {};

  selectors: { [key in ActionType]?: (state: S) => any[] } = {};

  constructor(path: string, initialState: S) {
    this.path = path;
    this.initialState = initialState;
  }

  setPayloadAction<P extends any>(
    type: ActionType,
    tinyReducer: (state: S, action: PayloadAction<ActionType, P>) => S
  ) {
    this.reducers[type] = tinyReducer as (state: S, action: Action<any>) => S;
    return (payload: P) => ({ type, payload });
  }

  setSimpleAction(
    type: ActionType,
    tinyReducer: (state: S, action: SimpleAction<ActionType> | Action<any>) => S
  ) {
    this.reducers[type] = tinyReducer;
    return () => ({ type });
  }

  getReducer() {
    return <
      A extends PayloadAction<ActionType, any> | SimpleAction<ActionType>
    >(
      state: S = this.initialState,
      action: A
    ) => {
      const thisReducer = this.reducers[action.type];
      if (thisReducer) return thisReducer(state, action);
      return state;
    };
  }

  helper<T>(state: T, separator = '.'): S {
    return this.resolve(this.path, state, separator);
  }

  getMemoValueHook: () => () => [S, Dispatch<StoreModuleActions<ActionType>>] =
    () => () => {
      const [state, dispatch] = React.useReducer(
        this.getReducer(),
        this.initialState
      );
      return React.useMemo(() => [state, dispatch], [state]);
    };

  getContext() {
    return React.createContext<[S, Dispatch<StoreModuleActions<ActionType>>]>([
      this.initialState,
      (): void => undefined,
    ]);
  }

  useContext =
    <
      A extends
        | { [key: string]: (...args: any) => PayloadAction<ActionType, any> }
        | { [key: string]: (...args: any) => SimpleAction<ActionType> },
      T extends {
        [key: string]: (...args: any) => ProcessAction<any, S, null, AnyAction>;
      }
    >(
      contextArg: Context<[S, Dispatch<StoreModuleActions<ActionType>>]>,
      newActions: A = {} as A,
      newThunks: T = {} as T
    ) =>
    () => {
      const context = React.useContext(contextArg);
      if (!context) {
        throw new Error(`useCount must be used within a CountProvider`);
      }
      const [state, dispatch] = context;

      const actions: { [key: string]: (...args: any) => void } = {};
      if (newActions) {
        Object.entries(newActions).forEach(([key, value]) => {
          actions[key] = (...arg: any) => {
            dispatch(value(...arg));
          };
        });
      }
      const thunks: {
        [key: string]: ProcessAction<any, S, null, AnyAction>;
      } = {};
      if (newThunks) {
        Object.entries(newThunks).forEach(([key, value]) => {
          thunks[key] = (...args: any) => {
            value(...args)(dispatch as any, () => state, null);
          };
        });
      }
      return {
        state,
        dispatch,
        ...actions,
        ...thunks,
      } as {
        state: S;
        dispatch: Dispatch<StoreModuleActions<ActionType>>;
      } & A &
        T;
    };

  private resolve<T>(path: string, object: T, separator = '.'): S {
    return path
      .split(separator)
      .reduce(
        (r: Record<string, any>, val) => (r ? (r as any)[val] : undefined),
        object
      ) as S;
  }
}
