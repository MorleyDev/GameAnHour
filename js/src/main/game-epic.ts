import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { filter, ignoreElements, map, mergeMap } from "rxjs/operators";

import { AssetDrivers, InputDrivers, PhysicsDrivers } from "@morleydev/pauper/app-drivers";
import { Millisecond } from "@morleydev/pauper/models/time.model";
import { GameAction } from "./game.model";
import { MouseButton } from "@morleydev/pauper/models/mouse-button.model";

export const epic =
	(drivers: PhysicsDrivers & InputDrivers & AssetDrivers) =>
		(action$: Observable<GameAction>) => merge<GameAction>(
			interval(20).pipe(
				mergeMap(() => [
					({ type: "@@TICK", deltaTime: 20 * Millisecond }),
					({ type: "@@ADVANCE_PHYSICS", deltaTime: 20 * Millisecond })
				])),
			action$.pipe(
				filter(action => action.type === "PlaySoundEffect"),
				map(action => (action as ({ readonly type: "PlaySoundEffect"; readonly sound: string })).sound),
				map(sound => drivers.loader.getSoundEffect(sound)),
				map(sound => drivers.audio.playSoundEffect(sound, 0.1)),
				ignoreElements()
			),
			drivers.mouse.mouseDown(MouseButton.Left)
				.pipe(
					map(({ x, y }) => ({ type: "PlayerTryJumpAction", position: { x: x - 256, y: y - 256 } }))
				)
		);
