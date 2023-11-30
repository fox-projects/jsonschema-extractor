import Module from "node:module";
import path from "node:path";

export async function extractSchema() {
	/** @type {Record<string, Record<string, { description?: string, [key: string]: unknown } | unknown >>} */
	const schemas = {}

	for (const info of [
		// {
		// 	id: 'stylelint',
		// 	requireDir: './node_modules/stylelint/lib/rules',
		// },
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-order',
		},
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-scss',
		},
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-a11y',
		},
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-no-unsupported-browser-features',
		},
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-prettier',
		},
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-react-native',
		},
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-selector-bem-pattern',
		},
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-plugin-defensive-css',
		},
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-declaration-block-no-ignored-properties',
		},
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint-declaration-strict-value',
		}
	]) {
		const require = Module.createRequire(import.meta.url);
		const module = require(
			require.resolve(path.join(process.cwd(), info.requireDir))
		)
		let ruleObjs = module?.default || module
		if (!Array.isArray(ruleObjs)) {
			ruleObjs = [ruleObjs]
		}
		for (const ruleObj of ruleObjs) {
			schemas[`${ruleObj.ruleName}`] = {}
		}
	}

	return schemas
}
