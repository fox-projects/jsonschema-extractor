import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * @typedef {object} RuleMetaDocs
 * @property {string} category
 * @property {string} description
 * @property {string} url
 */

/**
 * @typedef {object} RuleMeta
 * @property {string} type
 * @property {RuleMetaDocs} docs
 * @property {string} fixable
 * @property {Array<unknown>} schema
 */

/**
 * @typedef {object} Rule
 * @property {RuleMeta} meta
 * @property {() => unknown} create
 */

/**
 * @typedef {object} Plugin
 * @property {Record<string, Rule>} rules
 */


for (const appName of ['stylelint', 'eslint']) {
	const { extractSchema } = await import(path.join(process.cwd(), `lib/extractors/${appName}.js`))
	const schema = await extractSchema()

	await fs.mkdir('schemas', {recursive: true })
	await fs.writeFile(`schemas/${appName}.schema.json`, JSON.stringify(schema, null, '\t'))
}
