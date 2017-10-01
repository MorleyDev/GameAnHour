import { Vector2 } from "./vector.maths";
import * as tape from "tape";

import {
    abs,
    add,
    divide,
    dotProduct,
    invert,
    magnitude,
    magnitudeSquared,
    multiply,
    normal,
    normalise,
    subtract,
} from "./vector.maths.func";
import { Vector2Type } from "./vector.maths.type";
import { Unit } from "./vector.maths.values";

tape("core/maths/vector.maths", test => {
	const make = (x: number, y: number) => ({ x, y });

	const within = (test: tape.Test, low: number, high: number) =>
		(value: number) =>
			test.true(
				value >= low && value <= high,
				`${value} should be between ${low} and ${high}`
			);

	const between = (test: tape.Test, low: Vector2Type, high: Vector2Type) =>
		(value: Vector2Type) =>
			test.true(
				value.x >= low.x && value.y >= low.y && value.x <= high.x && value.y <= high.y,
				`(${value.x}, ${value.y}) should be between (${low.x}, ${low.y}) and (${high.x}, ${high.y})`
		);

	test.test("basic creation", test => {
		const expected = { x: Math.random(), y: Math.random() };
		test.deepEqual(make(expected.x, expected.y), expected);
		test.end();
	});

	test.test("unit vector", test => {
		within(test, 1, 1.0001)(magnitudeSquared(Unit));
		test.deepEqual(magnitude(Unit), 1, "unit vector has magnitude of 1");
		test.end();
	});

	test.test("absolute", test => {
		test.deepEqual(abs(make(-5, -2)), make(5, 2));
		test.deepEqual(abs(make(5, -2)), make(5, 2));
		test.deepEqual(abs(make(-5, 2)), make(5, 2));
		test.end();
	});

	test.test("invert", test => {
		test.deepEqual(invert(make(-5, -2)), make(5, 2));
		test.deepEqual(invert(make(5, -2)), make(-5, 2));
		test.deepEqual(invert(make(-5, 2)), make(5, -2));
		test.end();
	});

	test.test("magnitude", test => {
		within(test, 1.414213, 1.414214)(magnitude({ x: 1, y: 1 }));
		within(test, 5.385164, 5.385165)(magnitude({ x: -5, y: 2 }));
		test.end();
	});

	test.test("magnitude^2", test => {
		test.equal(magnitudeSquared({ x: -5, y: 2 }), 29);
		test.equal(magnitudeSquared({ x: 1, y: 1 }), 2);
		test.end();
	});

	test.test("add", test => {
		test.deepEqual(add(make(3, 5), make(5, 9)), make(8, 14));
		test.end();
	});
	test.test("subtract", test => {
		test.deepEqual(subtract(make(3, 9), make(5, 4)), make(-2, 5));
		test.end();
	});
	test.test("multiply", test => {
		test.deepEqual(multiply(make(3, 9), 2), make(6, 18));
		test.end();
	});
	test.test("divide", test => {
		test.deepEqual(divide(make(3, 9), 2), make(1.5, 4.5));
		test.end();
	});

	test.test("normalise", test => {
		between(test, make(0.4472, 0.8944), make(0.4473, 0.8945))( normalise(make(10, 20)) );
		within(test, 0.999, 1.001)(  magnitude( normalise(make(10, 20)) ) );
		test.end();
	});

	test.test("dot product", test => {
		test.equal( dotProduct(make(9, 4), make(3, 5)), 47 );
		test.equal( dotProduct(make(9, -4), make(3, 5)), 7 );
		test.equal( dotProduct(make(9, 4), make(-3, 5)), -7 );
		test.end();
	});

	test.test("normal", test => {
		test.deepEqual( normal(make(9, 4)), make(-4, 9) );
		test.deepEqual( normal(make(-9, 4)), make(-4, -9) );
		test.deepEqual( normal(make(9, -4)), make(4, 9) );
		test.deepEqual( normal(make(0, 0)), make(0, 0) );
		test.deepEqual( normal(make(9, 9)), make(-9, 9) );
		test.end();
	});

	test.end();
});
