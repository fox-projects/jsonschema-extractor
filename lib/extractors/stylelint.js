import Module from 'node:module'
import path from 'node:path'

export async function extractSchema() {
	/** @type {any} */
	const schema = {
		$id: 'https://json.schemastore.org/partial-eslint-plugins.json',
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		definitions: {},
		properties: {},
	}

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
		},
	]) {
		const require = Module.createRequire(import.meta.url)
		const module = require(require.resolve(path.join(process.cwd(), info.requireDir)))
		let ruleObjs = module?.default || module
		if (!Array.isArray(ruleObjs)) {
			ruleObjs = [ruleObjs]
		}
		for (const ruleObj of ruleObjs) {
			schema.properties[`${ruleObj.ruleName}`] = {}
		}
	}

	return schema
}
