import { Vector2 } from "./vector.maths";
import { rotate2d } from "./angles.maths";
import * as angles from "./angles.maths";
import { test } from "tap";

/* tslint:disable */
test("core/maths/angles.maths", test => {
	test.test("toRadians :: Degree -> Radian", test => {
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

	test.test("toDegrees :: Radian -> Degree", test => {
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

	test.test("rotate2d :: (Vector2d, Radians) -> Vector2d", test => {
		const within = (type: string, low: number, high: number): (value: number) => void =>
			low <= high
				? (value: number) => test.true(value >= low && value <= high, `Rotated ${type} co-ordinate ${value} should be between ${low} and ${high}`)
				: within(type, high, low);

		test.test("((10, 15), 1.0472) -> (18, 16.1)", test => {
			const { x, y } = rotate2d(Vector2(10, 15), 1.0472);
			within("x", 17.95, 18.1)(x);
			within("y", -1.155, -1.165)(y);
			test.end();
		});

		test.test("((1, 1), 1.5708) -> (1, -1)", test => {
			const { x, y } = rotate2d(Vector2(1, 1), 1.5708);
			within("x", 0.99, 1.01)(x);
			within("y", -0.99, -1.01)(y);
			test.end();
		})

		test.end();
	});

	test.end();
});
