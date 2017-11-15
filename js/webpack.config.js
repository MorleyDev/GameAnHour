const webpack = require("webpack");
const isProd = process.argv.indexOf("--env.prod") >= 0;
const { resolve } = require("path");

// Full optimisation is dangerous due to the loop optimiser
const fullOptimisation = {
	test: /\.(j|t)sx?$/,
	use: [{
		loader: "babel-loader",
		options: {
			presets: [
				["@babel/preset-env", { loose: true, targets: { browsers: "last 2 versions", node: "current" } }],
				["@babel/stage-3", { loose: true }]
			],
			plugins: [
				"closure-elimination",
				"preval",
				"loop-optimizer",
				"tailcall-optimization",
				"module:fast-async"
			]
		}
	}, "ts-loader"]
};

// Standard will not remove .map and .forEach, so is safer, but less performant
const standardOptimisation = {
	test: /\.(j|t)sx?$/,
	use: [{
		loader: "babel-loader",
		options: {
			presets: [
				["@babel/preset-env", { loose: true }],
				["@babel/stage-3", { loose: true }]
			],
			plugins: [
				"closure-elimination",
				"preval",
				"tailcall-optimization",
				"module:fast-async"
			]
		}
	}, "ts-loader"]
};
const safeFullOptimisationDirectories = [
	resolve(__dirname, "src")
];

module.exports = {
	devtool: isProd ? undefined : "inline-source-map",
	entry: {
		"index": "./src/index.ts",
		"engine/sfml/primary": "./src/engine/sfml/primary.ts",
		"engine/sfml/secondary": "./src/engine/sfml/secondary.ts",
		"engine/sfml/worker": "./src/engine/sfml/worker.ts"
	},
	output: {
		filename: "dist/[name].js"
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},
	module: {
		rules: [
			{
				...fullOptimisation,
				include: safeFullOptimisationDirectories
			},
			{
				...standardOptimisation,
				exclude: [resolve(__dirname, "node_modules")].concat(safeFullOptimisationDirectories)
			}
		]//.concat(isProd ? [{ ...standardOptimisation, include: [resolve(__dirname, "node_modules")] }] : [])
	},
	devServer: {
		hot: true,
		noInfo: true,
		host: "0.0.0.0",
		disableHostCheck: true,
		port: 8080,
		inline: true
	},
	plugins: (isProd
		? [
		]
		: [
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NamedModulesPlugin()
		]
	)
}
