import { test } from "tap";

import { Vector2 } from "./vector.maths";
import { abs, add, constraint, crossProduct, divide, dot, dotProduct, invert, linearInterpolation, magnitude, magnitudeSquared, multiply, normal, normalise, subtract, cosineInterpolation } from "./vector.maths.func";
import { Vector2Type } from "./vector.maths.type";
import { Unit } from "./vector.maths.values";

/* tslint:disable */

test("core/maths/vector.maths", test => {
	const make = (x: number, y: number) => Vector2(x, y);

	const within = (tap: typeof test, low: number, high: number) =>
		(value: number) =>
			tap.true(
				value >= low && value <= high,
				`${value} should be between ${low} and ${high}`
			);

	const between = (tap: typeof test, low: Vector2Type, high: Vector2Type) =>
		(value: Vector2Type) =>
			tap.true(
				value.x >= low.x && value.y >= low.y && value.x <= high.x && value.y <= high.y,
				`(${value.x}, ${value.y}) should be between (${low.x}, ${low.y}) and (${high.x}, ${high.y})`
			);

	test.test("Vector2 :: (Number, Number) -> Vector2", test => {
		const expected = { x: Math.random(), y: Math.random() };
		test.deepEqual(make(expected.x, expected.y), expected);
		test.end();
	});

	test.test("Unit :: Vector2", test => {
		within(test, 1, 1.0001)(magnitudeSquared(Unit));
		test.deepEqual(magnitude(Unit), 1, "unit vector has magnitude of 1");
		test.end();
	});

	test.test("abs :: Vector2 -> Vector2", test => {
		test.deepEqual(abs(make(-5, -2)), make(5, 2));
		test.deepEqual(abs(make(5, -2)), make(5, 2));
		test.deepEqual(abs(make(-5, 2)), make(5, 2));
		test.end();
	});

	test.test("invert :: Vector2 -> Vector2", test => {
		test.deepEqual(invert(make(-5, -2)), make(5, 2));
		test.deepEqual(invert(make(5, -2)), make(-5, 2));
		test.deepEqual(invert(make(-5, 2)), make(5, -2));
		test.end();
	});

	test.test("magnitude :: Vector2 -> Number", test => {
		within(test, 1.414213, 1.414214)(magnitude({ x: 1, y: 1 }));
		within(test, 5.385164, 5.385165)(magnitude({ x: -5, y: 2 }));
		test.end();
	});

	test.test("magnitude^2 :: Vector2 -> Number", test => {
		test.equal(magnitudeSquared({ x: -5, y: 2 }), 29);
		test.equal(magnitudeSquared({ x: 1, y: 1 }), 2);
		test.end();
	});

	test.test("add :: (Vector2, Vector2) -> Vector2", test => {
		test.deepEqual(add(make(3, 5), make(5, 9)), make(8, 14));
		test.end();
	});
	test.test("subtract :: (Vector2, Vector2) -> Vector2", test => {
		test.deepEqual(subtract(make(3, 9), make(5, 4)), make(-2, 5));
		test.end();
	});
	test.test("multiply :: (Vector2, Number) -> Vector2", test => {
		test.deepEqual(multiply(make(3, 9), 2), make(6, 18));
		test.end();
	});
	test.test("divide :: (Vector2, Number) -> Vector2", test => {
		test.deepEqual(divide(make(3, 9), 2), make(1.5, 4.5));
		test.end();
	});

	test.test("normalise :: Vector2 -> Vector2", test => {
		between(test, make(0.4472, 0.8944), make(0.4473, 0.8945))(normalise(make(10, 20)));
		within(test, 0.999, 1.001)(magnitude(normalise(make(10, 20))));
		test.end();
	});

	test.test("dot :: (Vector2, Vector2) -> Vector2", test => {
		test.deepEqual(dot(make(0.25, 0.5), make(1.5, -0.25)), make(0.375, -0.125));
		test.end();
	});

	test.test("dotProduct :: (Vector2, Vector2) -> Number", test => {
		test.equal(dotProduct(make(9, 4), make(3, 5)), 47);
		test.equal(dotProduct(make(9, -4), make(3, 5)), 7);
		test.equal(dotProduct(make(9, 4), make(-3, 5)), -7);
		test.end();
	});

	test.test("crossProduct :: (Vector2, Vector2) -> Number", test => {
		test.equal(crossProduct(make(2, 5), make(-6, 4)), 38);
		test.end();
	});

	test.test("normal :: (Vector2) -> Vector2", test => {
		test.deepEqual(normal(make(9, 4)), make(-4, 9));
		test.deepEqual(normal(make(-9, 4)), make(-4, -9));
		test.deepEqual(normal(make(9, -4)), make(4, 9));
		test.deepEqual(normal(make(0, 0)), make(0, 0));
		test.deepEqual(normal(make(9, 9)), make(-9, 9));
		test.end();
	});

	test.test("constraint :: (Vector2, Vector2) -> Vector2 -> Vector2", test => {
		const constraintTo = constraint(make(-10, -10), make(10, 10));
		test.deepEqual(constraintTo(make(0, 0)), make(0, 0));
		test.deepEqual(constraintTo(make(-20, 0)), make(-10, 0));
		test.deepEqual(constraintTo(make(20, 0)), make(10, 0));
		test.deepEqual(constraintTo(make(0, -20)), make(0, -10));
		test.deepEqual(constraintTo(make(0, 20)), make(0, 10));
		test.deepEqual(constraintTo(make(20, 20)), make(10, 10));
		test.deepEqual(constraintTo(make(-20, -20)), make(-10, -10));
		test.end();
	});

	test.test("linearInterpolation :: (Vector2, Vector2) -> Number -> Vector2", test => {
		test.deepEqual(linearInterpolation(make(10, 5), make(20, 25))(0), make(10, 5));
		test.deepEqual(linearInterpolation(make(10, 5), make(20, 25))(1), make(20, 25));
		test.deepEqual(linearInterpolation(make(10, 5), make(-20, -25))(1), make(-20, -25));
		test.deepEqual(linearInterpolation(make(10, 5), make(-20, 25))(1), make(-20, 25));

		test.deepEqual(linearInterpolation(make(10, 5), make(20, 25))(0.25), make(12.5, 10));
		test.deepEqual(linearInterpolation(make(10, 5), make(20, 25))(0.5), make(15, 15));
		test.deepEqual(linearInterpolation(make(10, 5), make(20, 25))(0.75), make(17.5, 20));
		test.end()
	});

	test.test("cosineInterpolation :: (Vector2, Vector2) -> Number -> Vector2", test => {
		test.deepEqual(cosineInterpolation(make(10, 5), make(20, 25))(0), make(10, 5));
		test.deepEqual(cosineInterpolation(make(10, 5), make(20, 25))(1), make(20, 25));
		test.deepEqual(cosineInterpolation(make(10, 5), make(-20, -25))(1), make(-20, -25));
		test.deepEqual(cosineInterpolation(make(10, 5), make(-20, 25))(1), make(-20, 25));

		between(test, make(11.4, 7.9), make(11.6, 8.1))(cosineInterpolation(make(10, 5), make(20, 25))(0.25));
		between(test, make(14.9, 14.9), make(15.1, 15.1))(cosineInterpolation(make(10, 5), make(20, 25))(0.5));
		between(test, make(18.4, 21.9), make(18.6, 22.1))(cosineInterpolation(make(10, 5), make(20, 25))(0.75));
		test.end()
	});

	test.end();
});
