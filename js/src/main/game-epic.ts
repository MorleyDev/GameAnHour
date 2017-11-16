import { Observable } from "rxjs/Observable";
import { fromPromise } from "rxjs/observable/fromPromise";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { filter, ignoreElements, map, mergeMap } from "rxjs/operators";

import { AppDrivers, PhysicsDrivers, InputDrivers, AssetDrivers } from "../pauper/app-drivers";
import { EntityId } from "../pauper/ecs/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../pauper/ecs/entity-component.actions";
import { Circle, Point2 } from "../pauper/models/shapes.model";
import { Millisecond, Seconds } from "../pauper/models/time.model";
import { HardBodyComponent } from "../pauper/physics/component/HardBodyComponent";
import { RenderedComponent } from "./components/RenderedComponent";
import { GameAction } from "./game.model";

export const epic =
	(drivers: PhysicsDrivers & InputDrivers & AssetDrivers) =>
		(action$: Observable<GameAction>) =>
			merge<GameAction>(
				interval(20)
					.pipe(
						mergeMap(() => [
							({ type: "@@TICK", deltaTime: 20 * Millisecond }),
							({ type: "@@ADVANCE_PHYSICS", deltaTime: 20 * Millisecond })
						])),
				drivers.mouse.mouseUp().pipe(
					mergeMap(() => {
						const id = EntityId();
						const physics = HardBodyComponent(Point2((Math.random() * 306 + 106) | 0, 25), Circle(0, 0, (Math.random() * 12.5 + 2.5) | 0), { density: (Math.random() * 40 + 10) | 0, elasticity: ((Math.random() * 100) | 0) / 100 });
						return [
							CreateEntityAction(id),
							AttachComponentAction(id, physics),
							AttachComponentAction(id, RenderedComponent(255 * physics.elasticity | 0, 255 - physics.density | 0, 255 | 0))
						];
					})
				),
				action$.pipe(
					filter(action => action.type === "PlaySoundEffect"),
					map(action => (action as ({ readonly type: "PlaySoundEffect"; readonly sound: string })).sound),
					map(sound => drivers.loader.getSoundEffect(sound)),
					map(sound => drivers.audio.playSoundEffect(sound, 0.1)),
					ignoreElements()
				)
			);
