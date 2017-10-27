import { linearInterpolation, cosineInterpolation } from "./interpolation.maths";
import { test } from "tap";

/* tslint:disable */
test("core/maths/interpolation.maths", test => {
	test.test("linearInterpolation :: (Number, Number) -> Number -> Number", test => {
		const within = (low: number, high: number) =>
			(value: number) => test.is(
				value >= low && value <= high, true,
				`${value} should be between ${low} and ${high}`
			);

		test.equal(linearInterpolation(100, 200)(0), 100);
		test.equal(linearInterpolation(200, 100)(0), 200);
		test.equal(linearInterpolation(100, 200)(1), 200);
		test.equal(linearInterpolation(200, 100)(1), 100);
		test.equal(linearInterpolation(-200, 100)(1), 100);
		test.equal(linearInterpolation(200, -100)(1), -100);

		test.equal(linearInterpolation(1, 2)(0.5), 1.5);
		test.equal(linearInterpolation(1, 2)(0.25), 1.25);
		test.equal(linearInterpolation(1, 2)(0.75), 1.75);
		test.end();
	});

	test.test("cosineInterpolation :: (Number, Number) -> Number -> Number", test => {
		const within = (low: number, high: number) =>
			(value: number) => test.is(
				value >= low && value <= high, true,
				`${value} should be between ${low} and ${high}`
			);

		test.equal(cosineInterpolation(100, 200)(0), 100);
		test.equal(cosineInterpolation(200, 100)(0), 200);
		test.equal(cosineInterpolation(100, 200)(1), 200);
		test.equal(cosineInterpolation(200, 100)(1), 100);
		test.equal(cosineInterpolation(-200, 100)(1), 100);
		test.equal(cosineInterpolation(200, -100)(1), -100);

		within(1.14, 1.15)(cosineInterpolation(1, 2)(0.25));
		within(1.49, 1.51)(cosineInterpolation(1, 2)(0.5));
		within(1.84, 1.86)(cosineInterpolation(1, 2)(0.75));
		test.end();
	});
	test.end();
});
