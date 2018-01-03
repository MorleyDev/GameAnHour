import { attachComponent, createEntity } from "@morleydev/pauper/ecs/entity-component.reducer";

import { $$ } from "@morleydev/functional-pipe";
import { EntitiesState } from "@morleydev/pauper/ecs/entities.state";
import { GameState } from "./game-state";

export const initialState: GameState =
	$$({ })
		.$(EntitiesState)
		.$$(s => s);
