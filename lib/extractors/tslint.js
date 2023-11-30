import Module from "node:module";
import * as path from "node:path";
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
	/** @type {Record<string, Record<string, { description?: string, [key: string]: unknown } | unknown >>} */
	const schemas = {}

	const info = {
		id: 'tslint',
		requireDir: './node_modules/tslint/lib/rules',
	}

	const require = Module.createRequire(import.meta.url);

	for (const stat of await fs.readdir(path.join(process.cwd(), info.requireDir), { withFileTypes: true })) {
		if (stat.isDirectory()) continue
		if (stat.name.endsWith('.ts')) continue

		const filepath = path.join(stat.path, stat.name)
		const module = require(
			require.resolve(filepath)
		)

		const meta = module.Rule.metadata
		schemas[meta.ruleName] = {
			description: meta.description,
			type: 'object',
			properties: {
				...meta.options
			}
		}
	}

	return schemas
}
