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
import {isString} from "../../../utils/types";

const SnippetGenerator = function () {
    this.snippet = function (config) {
        const query = config.language === 'curl' ? encodeURIComponent(config.query) : config.query;
        const language = config.language === 'curl' ? 'bash': config.language;

        const s = dedent(templates.layout[config.language])
                .replace(/__METHOD__/g, dedent(templates[config.method][config.language]))
                .replace(/__QUERY__/g, query)
                .replace(/__PARAMS__/g, this.params_template(config))
                .replace(/__CURL_SEARCH_BODY__/g, this.curlSearchBody(config))
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
            if (config.language === 'curl' && key === 'extensions') {
                return '';
            }
            const value = this.getStringValue(config.params[key], config.language);
            if (config.language === 'php') {
                return `    '${key}' => ${value}`;
            }
            if (config.language === 'ruby') {
                return `    ${key}: ${value}`;
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

    this.curlParamValue = function (value) {
        if (Array.isArray(value) || (value && typeof value === 'object')) {
            return JSON.stringify(value);
        }
        return value;
    };

    this.curlSearchBody = function (config) {
        const params = Object.keys(config.params)
            .filter((key) => key !== 'extensions')
            .map((key) => {
                return `&${key}=${encodeURIComponent(this.curlParamValue(config.params[key]))}`;
            })
            .join('');

        const body = {
            params: `query=${encodeURIComponent(config.query)}${params}`,
        };

        if (config.params.extensions !== undefined) {
            body.extensions = config.params.extensions;
        }

        return this.escapeBashSingleQuotedString(JSON.stringify(body));
    };

    this.escapeBashSingleQuotedString = function (value) {
        return value.split("'").join("'\\''");
    };

    this.getQuotedString = function (value, quote) {
        return `${quote}${String(value).replace(/\\/g, '\\\\').split(quote).join(`\\${quote}`)}${quote}`;
    };

    this.getObjectKey = function (key, language) {
        if (language === 'php') return `'${key}' =>`;
        if (language === 'ruby') return `${key}:`;
        if (language === 'python') return `"${key}":`;
        return `${key}:`;
    };

    this.getNullValue = function (language) {
        if (language === 'python') return 'None';
        if (language === 'ruby') return 'nil';
        return 'null';
    };

    this.getBooleanValue = function (value, language) {
        if (language === 'python') return value ? 'True' : 'False';
        return value ? 'true' : 'false';
    };

    this.getStringValue = function (value, language, indentLevel = 1) {
        if (isString(value)) {
            if (language === 'python') return this.getQuotedString(value, '"');
            return this.getQuotedString(value, "'");
        }

        if (value === null) {
            return this.getNullValue(language);
        }

        if (typeof value === "boolean") {
            return this.getBooleanValue(value, language);
        }

        if (typeof value === 'number') {
            return value;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return '[]';
            const indent = '    '.repeat(indentLevel);
            const childIndent = '    '.repeat(indentLevel + 1);
            return `[\n${childIndent}${value.map((v) => this.getStringValue(v, language, indentLevel + 1)).join(`,\n${childIndent}`)}\n${indent}]`;
        }

        if (value && typeof value === 'object') {
            const open = language === 'php' ? '[' : '{';
            const close = language === 'php' ? ']' : '}';
            if (Object.keys(value).length === 0) return `${open}${close}`;
            const indent = '    '.repeat(indentLevel);
            const childIndent = '    '.repeat(indentLevel + 1);
            const entries = Object.keys(value).map((key) => {
                return `${childIndent}${this.getObjectKey(key, language)} ${this.getStringValue(value[key], language, indentLevel + 1)}`;
            });
            return `${open}\n${entries.join(',\n')}\n${indent}${close}`;
        }
    };
};

export default SnippetGenerator;
