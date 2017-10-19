import { App } from "./App";

export type AppConstructor = new (shutdown: () => void) => App;
