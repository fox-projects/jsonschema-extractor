import Module from 'node:module'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { loadRules } from 'tslint'

/**
 * @typedef {object} ExtractionInfo
 * @property {string} extractorFile
 * @property {string} repoPath
 */

/**
 * @param {ExtractionInfo} info
 * @returns {Promise<Record<PropertyKey, unknown> | undefined>}
 */
async function runExtractor(info) {
	try {
		const { extract: extractionFn } = await import(info.extractorFile)
		process.chdir(info.repoPath)
		const schemaPair = await extractionFn()
		return schemaPair
	} catch (err) {
		console.error(err)
		console.log('Continuing...')
	} finally {
		process.chdir('../../')
	}
}

export async function extractSchema() {
	/** @type {any} */
	const schema = {
		$id: 'https://json.schemastore.org/partial-eslint-plugins.json',
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		definitions: {
			ruleBoolean: {
				description: 'Severity level. Value of true is equivalent to "default".',
				type: 'boolean',
			},
			ruleString: {
				$comment: "Value 'warn' is UNDOCUMENTED.",
				description: 'Severity level. Level "error" will cause exit code 2.',
				type: 'string',
				enum: ['default', 'error', 'warning', 'warn', 'off', 'none'],
				default: 'default',
			},
		},
		properties: {},
	}

	const info = {
		id: 'tslint',
		requireDir: './node_modules/tslint/lib/rules',
	}

	const require = Module.createRequire(import.meta.url)

	for (const stat of await fs.readdir(path.join(process.cwd(), info.requireDir), {
		withFileTypes: true,
	})) {
		if (stat.isDirectory()) continue
		if (stat.name.endsWith('.ts')) continue

		const filepath = path.join(stat.path, stat.name)
		const module = require(require.resolve(filepath))

		const meta = module.Rule.metadata
		schema.properties[meta.ruleName] = {
			description: meta.description,
			anyOf: [
				{
					$ref: '#/definitions/ruleString',
				},
				{
					...meta.options,
				},
				// Use of boolean is legacy
				{
					$ref: '#/definitions/ruleBoolean',
				},
				// Use of array is legacy
				{
					type: 'array',
					minItems: 2,
					maxItems: 2,
					items: [
						{
							$ref: '#/definitions/ruleBoolean',
						},
						{
							...meta.options,
						},
					],
				},
				{
					...meta.options,
				},
			],
		}
	}

	return schema
}
