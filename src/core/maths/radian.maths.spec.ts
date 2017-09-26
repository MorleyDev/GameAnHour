import { Radian } from "./radian.maths";
import * as tape from "tape";

tape("core/maths/radian.maths", test => {
	const within = (low: number, high: number) =>
		(value: number) => test.is(value >= low && value <= high, true, `${value} should be between ${low} and ${high}`);

	test.equal(Radian(0), 0);
	within(0.174533, 0.174534)( Radian(10) );
	within(0.785398, 0.785399)( Radian(45) );
	within(1.5707, 1.5708)( Radian(90) );
	within(3.14159, 3.14160)( Radian(180) );
	test.end();
});
