import Module from 'node:module'
import path from 'node:path'

export async function extractSchema() {
	/** @type {any} */
	const schema = {
		$id: 'https://json.schemastore.org/partial-eslint-plugins.json',
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		definitions: {
			pluginNames: {
				type: 'array',
				items: {
					anyOf: [
						{
							enum: [],
						},
						{
							type: 'string',
						},
					],
				},
				uniqueItems: true,
			},
		},
		properties: {},
	}

	{
		const pluginNames = schema.definitions.pluginNames.items.anyOf[0].enum
		const url = new URL(
			'https://registry.npmjs.com/-/v1/search?text=stylelint&size=250&from=0',
		)
		const res = await fetch(url)
		const json = await res.json()
		for (const pkg of json.objects) {
			if (pkg.score.detail.popularity < 0.1) {
				continue
			}

			if (
				!(
					pkg.package.name.startsWith('stylelint-') ||
					pkg.package.name.match(/\/stylelint-/u)
				) ||
				pkg.package.name.includes('config')
			) {
				continue
			}

			pluginNames.push(pkg.package.name)
		}
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
