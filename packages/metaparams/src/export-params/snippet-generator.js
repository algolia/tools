import dedent from "dedent";
import Prism from 'prismjs';
import 'prismjs/components/prism-markup-templating'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-scala'
import 'prismjs/components/prism-bash'

import templates from './templates'

const SnippetGenerator = function () {
    this.snippet = function (config) {
        const query = config.language === 'curl' ? encodeURIComponent(config.query) : config.query;
        const language = config.language === 'curl' ? 'bash': config.language;

        const s = dedent(templates.layout[config.language])
                .replace(/__METHOD__/g, dedent(templates[config.method][config.language]))
                .replace(/__QUERY__/g, query)
                .replace(/__PARAMS__/g, this.params_template(config))
                .replace(/__APP_ID__/g, config.appId)
                .replace(/__API_KEY__/g, config.apiKey)
                .replace(/__INDEX_NAME__/g, config.indexName);

        return Prism.highlight(s, Prism.languages[language], language)
    };

    this.params_template = function (config) {
        if (config.language === 'curl' && config.method === 'setSettings') {
            return JSON.stringify(config.params, null, 2);
        }

        const params = Object.keys(config.params).map((key) => {
            const value = this.getStringValue(config.params[key], config.language);
            if (config.language === 'php') {
                return `    '${key}': ${value}`;
            }
            if (config.language === 'ruby') {
                return `    :${key}: ${value}`;
            }
            if (config.language === 'python') {
                return `    "${key}": ${value}`;
            }
            if (config.language === 'javascript') {
                return `    ${key}: ${value}`;
            }
            if (config.language === 'curl') {
                return `&${key}=${encodeURIComponent(value)}`
            }
        });

        if (config.language !== 'curl') return params.join(',\n');

        return params.join('');
    };

    this.getStringValue = function (value, language) {
        if (this.isString(value)) {
            if (language === 'python') return `"${value}"`;
            return `'${value}'`;
        }

        if (typeof value === "boolean") {
            return value;
        }

        if (Number.isInteger(value)) {
            return value;
        }

        if (Array.isArray(value)) {
            return `[\n      ${value.map((v) => this.getStringValue(v, language)).join(',\n      ')}\n    ]`;
        }
    };

    this.isString = function (value) {
        return typeof value === 'string' || value instanceof String;
    };
};

export default SnippetGenerator;