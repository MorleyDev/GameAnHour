import { EventHandler } from "./events/eventhandler.service";
import { App } from "./App";

export type AppConstructor = new (events: EventHandler, shutdown: () => void) => App;
