import Module from 'node:module'
import path from 'node:path'

export async function extractSchema() {
	/** @type {any} */
	const schema = {
		$id: 'https://json.schemastore.org/partial-eslint-plugins.json',
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		definitions: {},
		properties: {
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
	}

	{
		const pluginNames = schema.properties.pluginNames.items.anyOf[0].enum
		const url = new URL(
			'https://registry.npmjs.com/-/v1/search?text=babel-plugin&size=250&from=0',
		)
		const res = await fetch(url)
		const json = await res.json()
		for (const pkg of json.objects) {
			if (pkg.score.detail.popularity < 0.1) {
				continue
			}

			pluginNames.push(pkg.package.name)
		}
	}

	return schema
}
