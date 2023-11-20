import fs from 'node:fs/promises'
import path from 'node:path'
import Module from "node:module";

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

const bigSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
}

const angularEslintSchemaPair = await runExtractor({
  extractorFile: './lib/extractors/angular-eslint.js',
  repoPath: './submodules/angular-eslint'
})
if (angularEslintSchemaPair) {
  bigSchema.properties = {
    ...bigSchema.properties,
    [angularEslintSchemaPair[0]]: angularEslintSchemaPair[1],
  }
}

const eslintPluginImportSchemaPair = await runExtractor({
  extractorFile: './lib/extractors/eslint-plugin-import.js',
  repoPath: './submodules/eslint-plugin-import'
})
if (eslintPluginImportSchemaPair) {
  bigSchema.properties = {
    ...bigSchema.properties,
    [eslintPluginImportSchemaPair[0]]: eslintPluginImportSchemaPair[1],
  }
}

await fs.writeFile('schema.json', JSON.stringify(bigSchema, null, '\t'))
