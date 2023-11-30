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
	/** @type {Record<string, Record<string, { description?: string, [key: string]: unknown } | unknown >>} */
	const schemas = {}

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
			if (!schemas[info.id]) schemas[info.id] = {}
			const meta = module.rules[ruleName].meta

			schemas[info.id][`${info.id}/${ruleName}`] = {}
			if (meta?.schema?.[0]) {
				let ruleObject = {}
				ruleObject = globalThis.structuredClone(module.rules[ruleName].meta?.schema?.[0])
				const actualProperties = ruleObject.properties ?? {}

				ruleObject.properties = {
					oneOf: [
						{
							$ref: '#definition/rule1'
						},
						{
							$ref: '#definition/rule2'
						},
						{
							type: 'array',
							items: [
								{
									oneOf: [
										{
											$ref: '#definition/rule1'
										},
										{
											$ref: '#definition/rule2'
										},
									]
								},
								{
									type: 'object',
									additionalProperties: false,
									properties: actualProperties
								}

							]
						}
					]
				}
				schemas[info.id][`${info.id}/${ruleName}`] = ruleObject
			}

			if (meta?.docs) {
				const docs = meta?.docs
				const description = `${docs?.description ?? ''}\n${docs?.url ?? ''}`
				schemas[info.id][`${info.id}/${ruleName}`].description = description
			}
		}
	}

	return schemas
}
