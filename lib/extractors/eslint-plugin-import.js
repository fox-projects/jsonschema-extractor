import fs from 'node:fs/promises'
import path from 'node:path'
import Module from "node:module";

export async function extract() {
    const schema = {
        type: 'object',
        properties: {},
        additionalProperties: false
    }

    for (const dirent of await fs.readdir('./lib/rules', { withFileTypes: true} )) {
        // npm run build
        const require = Module.createRequire(import.meta.url);
        const module = require(path.join(process.cwd(), dirent.path, dirent.name))

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
         * @property {Array} schema
         */

        /**
         * @typedef {object} Rule
         * @property {RuleMeta} meta
         * @property {() => unknown} create
         */

        /** @type {string} */
        // const ruleName = module.RULE_NAME
        const ruleName = path.parse(dirent.name).name
        
        /** @type {Rule} */
        const rule = module

        schema.properties[ruleName] = rule?.meta?.schema?.[0] || {}
    }
   
    return ['eslint-plugin-import', {
            type: 'object',
            properties: schema
        }
    ]
}
