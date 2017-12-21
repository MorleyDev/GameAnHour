import "@morleydev/pauper/render/jsx/render";

import * as React from "react";

import { Circle, Point2 } from "@morleydev/pauper/models/shapes.model";
import { Clear, Fill, FrameCollection, Origin, Rotate } from "@morleydev/pauper/render/render-frame.model";
import { RGB, RGBA } from "@morleydev/pauper/models/colour.model";
import { concat, range } from "@morleydev/functional-pipe/iterable/generators";

import { $$ } from "@morleydev/functional-pipe";
import { EntityId } from "@morleydev/pauper/ecs/entity-base.type";
import { flatMap } from "@morleydev/functional-pipe/iterable/operators";

export const Game = (props: {}): JSX.Element => (
	<clear colour={RGB(0, 0, 0)}>
		<origin coords={Point2(256, 256)}>
			<BallColourFader />
		</origin>
	</clear>
);

class BallColourFader extends React.Component<{}, { colour: RGBA }> {
	private colourWheel: RGBA[] = [];
	private timer: any = null;

	constructor(props: { colours: ReadonlyArray<RGBA> }) {
		super(props);
		this.state = {
			colour: RGBA(0, 0, 0, 1)
		};
	}

	public componentWillMount() {
		this.timer = setInterval(() => this.setState(state => ({ colour: RGBA(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1) })), 50);
	}

	public componentWillUnmount() {
		clearInterval(this.timer);
	}

	public render() {
		console.log(this.state.colour)
		return <fill shape={Circle(0, 0, 25)} colour={this.state.colour} />;
	}
}
