import * as React from "react";

import { connect } from "../utility/connect";
import { interval } from "rxjs/observable/interval";
import { map } from "rxjs/operators";

type AnimationCycleProps = {
	readonly frame: number;
	readonly children: any[];
};

export const AnimationCycle = connect(
	(props: AnimationCycleProps) => props.children[props.frame],
	(props: { framerate: number; children: any[] }) => ({ frame: interval(1000 / props.framerate).pipe(map(f => f % props.children.length)) }),
	{ frame: 0 }
);

