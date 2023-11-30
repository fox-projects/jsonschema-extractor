import fs from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
	options: {
		extractor: {
			type: 'string',
		},
	},
})

for (const appName of ['tslint', 'stylelint', 'eslint']) {
	const { extractSchema } = await import(
		path.join(process.cwd(), `lib/extractors/${appName}.js`)
	)
	console.log(`Extracting for ${appName}...`)
	const schema = await extractSchema()

	await fs.mkdir('schemas', { recursive: true })
	await fs.writeFile(`schemas/${appName}.schema.json`, JSON.stringify(schema, null, '\t'))
}
