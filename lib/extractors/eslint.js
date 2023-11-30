import Module from "node:module";
import path from "node:path";

/**
 * @typedef {object} ExtractionInfo
 * @property {string} extractorFile
 * @property {string} repoPath
 */

/**
 * @param {ExtractionInfo} info
 * @returns {Promise<Record<PropertyKey, unknown>>}
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
		const module = require(
			require.resolve(path.join(process.cwd(), info.requireDir))
		)
		for (const ruleName in module.rules) {
			schema.properties.rules.properties[`${info.id}/${ruleName}`] = module.rules[ruleName].meta?.schema?.[0] || {}
		}
	}

	return schema
}
