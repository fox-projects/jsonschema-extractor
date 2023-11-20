import fs from 'node:fs/promises'
import path from 'node:path'
import Module from "node:module";

export async function extract() {
    const schema = {
        type: 'object',
        properties: {},
        additionalProperties: false
    }

    for (const dirent of await fs.readdir('./packages/eslint-plugin/dist/rules', { withFileTypes: true} )) {
        /**
         * @typedef {object} RuleMeta
         * @property {string} type
         * @property {Record<PropertyKey, unknown>} docs
         * @property {string} fixable
         * @property {Array} schema
         * @property {Record<PropertyKey, unknown>} messages
         */

        /**
         * @typedef {object} Rule
         * @property {RuleMeta} meta
         * @property {Array} defaultOptions
         * @property {() => unknown} create
         */

        const require = Module.createRequire(import.meta.url);
        const module = require(path.join(process.cwd(), dirent.path, dirent.name))

        /** @type {string} */
        const ruleName = module.RULE_NAME
        
        /** @type {Rule} */
        const rule = module.default

        schema.properties[ruleName] = rule?.meta?.schema?.[0] || {}
    }
   
    return [
        '@angular-eslint/eslint-plugin', {
            type: 'object',
            properties: schema
        }
    ]
}
