import Module from "node:module";
import path from "node:path";

export async function extractSchema() {
	const schema = {
		type: 'object',
		properties: {
			rules: {
				type: 'object',
				properties: {}
			}
		},
		additionalProperties: false,
	}

	for (const info of [
		{
			id: 'stylelint',
			requireDir: './node_modules/stylelint',
		},
	]) {
		const require = Module.createRequire(import.meta.url);
		const module = require(
			require.resolve(path.join(process.cwd(), info.requireDir))
		)
		for (const ruleName in module.rules) {
			// const promise = module.rules[ruleName]
			// const rule = await promise
			// console.log('promise', promise)
			// console.log('rule', rule)

			schema.properties.rules.properties[`${info.id}/${ruleName}`] = {}
		}
	}

	return schema
}
