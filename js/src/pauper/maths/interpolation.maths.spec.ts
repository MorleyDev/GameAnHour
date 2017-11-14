import { linearInterpolation, cosineInterpolation, exponentialInterpolation } from "./interpolation.maths";
import { test } from "tap";

/* tslint:disable */
test("pauper/maths/interpolation.maths", test => {
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

		test.equal(linearInterpolation(1, 2)(0.25), 1.25);
		test.equal(linearInterpolation(1, 2)(0.5), 1.5);
		test.equal(linearInterpolation(1, 2)(0.75), 1.75);
		test.end();
	});

	test.test("exponentialInterpolation :: Number -> (Number, Number) -> Number -> Number", test => {
		const within = (low: number, high: number) =>
			(value: number) => test.is(
				value >= low && value <= high, true,
				`${value} should be between ${low} and ${high}`
			);

		test.equal(exponentialInterpolation(1)(100, 200)(0), 100);
		test.equal(exponentialInterpolation(2)(200, 100)(0), 200);
		test.equal(exponentialInterpolation(3)(100, 200)(1), 200);
		test.equal(exponentialInterpolation(4)(200, 100)(1), 100);
		test.equal(exponentialInterpolation(5)(-200, 100)(1), 100);
		test.equal(exponentialInterpolation(6)(200, -100)(1), -100);
		test.equal(exponentialInterpolation(Math.E)(200, -100)(1), -100);

		test.test("exponentialInterpolation :: e -> (Number, Number) -> Number -> Number", test => {
			within(1.0019, 1.0020)(exponentialInterpolation(Math.E)(1, 2)(0.1));
			within(1.02, 1.03)(exponentialInterpolation(Math.E)(1, 2)(0.25));
			within(1.15, 1.16)(exponentialInterpolation(Math.E)(1, 2)(0.5));
			within(1.45, 1.46)(exponentialInterpolation(Math.E)(1, 2)(0.75));
			within(1.74, 1.76)(exponentialInterpolation(Math.E)(1, 2)(0.9));
			test.end();
		});
		test.test("exponentialInterpolation :: 2 -> (Number, Number) -> Number -> Number", test => {
			within(1.009, 1.011)(exponentialInterpolation(2)(1, 2)(0.1));
			within(1.06, 1.07)(exponentialInterpolation(2)(1, 2)(0.25));
			within(1.24, 1.26)(exponentialInterpolation(2)(1, 2)(0.5));
			within(1.56, 1.57)(exponentialInterpolation(2)(1, 2)(0.75));
			within(1.809, 1.811)(exponentialInterpolation(2)(1, 2)(0.9));
			test.end();
		});
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
