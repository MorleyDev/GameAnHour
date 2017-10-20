import * as angles from "./angles.maths";
import * as tape from "tape";

/* tslint:disable */
tape("core/maths/angles.maths", test => {
	test.test("degrees to radians", test => {
		const within = (low: number, high: number) =>
			(value: number) => test.is(
				value >= low && value <= high, true,
				`${value} degrees in radius should be between ${low} and ${high}`
			);

		test.equal(angles.toRadians(0), 0);
		within(0.174533, 0.174534)(angles.toRadians(10));
		within(0.785398, 0.785399)(angles.toRadians(45));
		within(1.5707, 1.5708)(angles.toRadians(90));
		within(3.14159, 3.14160)(angles.toRadians(180));
		test.end();
	});
	test.test("radians to degrees", test => {
		const within = (low: number, high: number) =>
			(value: number) => test.is(
				value >= low && value <= high, true,
				`${value} radius in degrees should be between ${low} and ${high}`
			);

		test.equal(angles.toDegrees(0), 0);
		within(9.99, 10.01)(angles.toDegrees(0.174533));
		within(44.99, 45.01)(angles.toDegrees(0.785398));
		within(89.99, 90.01)(angles.toDegrees(1.5707));
		within(179.99, 180.01)(angles.toDegrees(3.14159));
		test.end();
	});
	test.end();
});
