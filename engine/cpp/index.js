SFML_SetRenderer(function () {
	return [
		["clear", { r: 255, g: 0, b: 0, a: 1 }],
		[
			[
				"origin",
				{ x: 256, y: 256 },
				[
					["rotate", 0, [
						["fill", [
							{ x: 10, y: 10 },
							{ x: 100, y: 100 },
							{ x: 10, y: 100 }
						], { r: 0, g: 0, b: 255, a: 1 }]
					]]
				]
			],
			["stroke", [{ x: 100, y: 100 }, { x: 200, y: 150 }], { r: 0, g: 255, b: 0, a: 1 }],
			["stroke", { x: 300, y: 300, radius: 50 }, { r: 100, g: 200, b: 100, a: 1 }]
		]
	];
});
