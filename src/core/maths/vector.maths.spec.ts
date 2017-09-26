import { Vector2 } from "./vector.maths";
import * as tape from "tape";

tape("core/maths/vector.maths", test => {
	const within = (test: tape.Test, low: number, high: number) => (value: number) => test.true(value >= low && value <= high, `${value} should be between ${low} and ${high}`);

	test.test("basic creation", test => {
		const expected = { x: Math.random(), y: Math.random() };
		test.deepEqual(Vector2(expected.x, expected.y), expected);
		test.end();
	});

	test.test("unit vector", test => {
		within(test, 1, 1.0001)(Vector2.magnitudeSquared(Vector2.unit));
		test.deepEqual(Vector2.magnitude(Vector2.unit), 1, "unit vector has magnitude of 1");
		test.end();
	});

	test.test("absolute", test => {
		test.deepEqual(Vector2.abs(Vector2(-5, -2)), Vector2(5, 2));
		test.deepEqual(Vector2.abs(Vector2(5, -2)), Vector2(5, 2));
		test.deepEqual(Vector2.abs(Vector2(-5, 2)), Vector2(5, 2));
		test.end();
	});

	test.test("invert", test => {
		test.deepEqual(Vector2.invert(Vector2(-5, -2)), Vector2(5, 2));
		test.deepEqual(Vector2.invert(Vector2(5, -2)), Vector2(-5, 2));
		test.deepEqual(Vector2.invert(Vector2(-5, 2)), Vector2(5, -2));
		test.end();
	});

	test.test("magnitude", test => {
		within(test, 1.414213, 1.414214)(Vector2.magnitude({ x: 1, y: 1 }));
		within(test, 5.385164, 5.385165)(Vector2.magnitude({ x: -5, y: 2 }));
		test.end();
	});

	test.test("magnitude^2", test => {
		test.equal(Vector2.magnitudeSquared({ x: -5, y: 2 }), 29);
		test.equal(Vector2.magnitudeSquared({ x: 1, y: 1 }), 2);
		test.end();
	});

	test.test("add", test => {
		test.deepEqual(Vector2.add(Vector2(3, 5), Vector2(5, 9)), Vector2(8, 14));
		test.end();
	});
	test.test("subtract", test => {
		test.deepEqual(Vector2.subtract(Vector2(3, 9), Vector2(5, 4)), Vector2(-2, 5));
		test.end();
	});
	test.test("multiply", test => {
		test.deepEqual(Vector2.multiply(Vector2(3, 9), 2), Vector2(6, 18));
		test.end();
	});
	test.test("divide", test => {
		test.deepEqual(Vector2.divide(Vector2(3, 9), 2), Vector2(1.5, 4.5));
		test.end();
	});

	test.end();
});
