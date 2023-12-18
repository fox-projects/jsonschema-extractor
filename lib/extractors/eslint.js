import Module from "node:module";
import path from "node:path";

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
		"$id": "https://json.schemastore.org/partial-eslint-plugins.json",
  		"$schema": "http://json-schema.org/draft-07/schema#",
		type: "object",
		"definitions": {
			"ruleNumber": {
				"description": "ESLint rule\n\n0 - turns the rule off\n1 - turn the rule on as a warning (doesn't affect exit code)\n2 - turn the rule on as an error (exit code is 1 when triggered)\n",
				"type": "integer",
				"minimum": 0,
				"maximum": 2
			},
			"ruleString": {
				"description": "ESLint rule\n\n\"off\" - turns the rule off\n\"warn\" - turn the rule on as a warning (doesn't affect exit code)\n\"error\" - turn the rule on as an error (exit code is 1 when triggered)\n",
				"type": "string",
				"enum": ["off", "warn", "error"]
			}
		},
		"properties": {}
	}

	for (const info of [
		{
			id: 'angular-eslint',
			requireDir: './node_modules/@angular-eslint/eslint-plugin',
		},
		{
			id: 'eslint-plugin-import',
			requireDir: './node_modules/eslint-plugin-import',
		},
		{
			id: 'eslint-plugin-unicorn',
			requireDir: './node_modules/eslint-plugin-unicorn',
		},
		{
			id: 'eslint-plugin-vue',
			requireDir: './node_modules/eslint-plugin-vue',
		},
		{
			id: 'typescript-eslint',
			requireDir: './node_modules/@typescript-eslint/eslint-plugin/dist',
		},
	]) {
		const require = Module.createRequire(import.meta.url);
		/** @typedef {import('eslint').Rule.RuleModule} RuleModule */
		/** @type {{ rules: Record<PropertyKey, RuleModule> }} */
		const module = require(
			require.resolve(path.join(process.cwd(), info.requireDir))
		)
		for (const ruleName in module.rules) {
			const meta = module.rules[ruleName].meta

			schema.properties[`${info.id}/${ruleName}`] = {}
			if (Array.isArray(meta?.schema) && meta?.schema?.[0]) {
				let ruleObject = globalThis.structuredClone(module.rules[ruleName].meta?.schema?.[0])

				ruleObject = {
					oneOf: [
						{
							$ref: '#/definitions/ruleNumber'
						},
						{
							$ref: '#/definitions/ruleString'
						},
						{
							"minItems": 2,
							"maxItems": 2,
							type: 'array',
							items: [
								{
									oneOf: [
										{
											$ref: '#/definitions/ruleNumber'
										},
										{
											$ref: '#/definitions/ruleString'
										},
									]
								},
								{
									type: 'object',
									additionalProperties: false,
									properties: ruleObject.properties ?? {}
								}

							]
						}
					]
				}
				schema.properties[`${info.id}/${ruleName}`] = ruleObject

			}

			if (meta?.docs) {
				const docs = meta?.docs
				const description = `${docs?.description ?? ''}\n${docs?.url ?? ''}`
				schema.properties[`${info.id}/${ruleName}`].description = description
			}
		}
	}

	return schema
}
