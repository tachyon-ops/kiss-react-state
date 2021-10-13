import { StoreModule } from './helpers/StoreModule';

export interface Action<T = any> {
  type: T;
}
export type AnyAction = Action<any>;

export interface SimpleAction<TType = Action> {
  type: TType;
}
export interface PayloadAction<TType, TPayload> extends SimpleAction<TType> {
  payload: TPayload;
}

export type StoreModuleActions<ActionType> =
  | SimpleAction<ActionType>
  | PayloadAction<ActionType, any>;

export interface ProcessDispatch<S, E, A extends Action> {
  <T extends A>(action: T): T;
  <R>(asyncAction: ProcessAction<R, S, E, A>): R;
}
export type ProcessAction<R, S, E, A extends Action> = (
  dispatch: ProcessDispatch<S, E, A>,
  getState: () => S,
  extraArgument: E
) => R;

export { StoreModule };
