/**
 * @module formatters
 * @description This module provides utility functions for formatting data.
 * Those functions are used in dangerous contexts, such as v-html, and should
 * be modified with caution, to prevent XSS.
 */


/**
 * formatHumanNumber formats a number in a human readable format.
 *
 * @param {number} bytes - The number to format.
 * @param {number?} decimals - The number of decimals to display. Default is 0.
 * @param {string[]?} sizes - The suffixes to use for the number. Default is ['', 'K', 'M', 'B', 'T'].
 * @param {number?} divider - The divider to use for the number. Default is 1000. Each suffix corresponds to a divider of 1000.
 * @returns string
 *
 * @example
 * ```
 *   const formatted = formatHumanNumber(123456789, 2, ['B', 'KiB', 'MiB', 'GiB', 'TiB'], 1024);
 *   assert.equal(formatted, '117.74MiB');
 * ```
 */
export function formatHumanNumber(
    bytes,
    decimals,
    sizes,
    divider
) {
    if (bytes === 0) return '0';
    sizes = sizes || ['', 'K', 'M', 'B', 'T'];
    divider = divider || 1000;
    decimals = decimals || 0;

    const i = Math.min(
        Math.max(0, Math.floor(Math.log(Math.abs(bytes)) / Math.log(divider))),
        sizes.length - 1
    );
    const nb = bytes / Math.pow(divider, i);

    return (Math.abs(nb) > 1000 ? numberWithCommas(nb, decimals) : nb.toFixed(decimals)) + sizes[i];
}

/**
 * formatHumanDistance formats a distance in a human readable format.
 * @param {number} nb
 * @returns string
 *
 * @example
 * ```
 *   const formatted = formatHumanDistance(123456);
 *   assert.equal(formatted, '123km');
 * ```
 */
export function formatHumanDistance(nb) {
    return formatHumanNumber(nb, 0, ['m', 'km'], 1000);
}

/**
 * numberWithCommas formats a number with commas.
 * @param {number} x - The number to format.
 * @param {number} precision - The number of decimals to display.
 * @returns string
 *
 * @example
 * ```
 *  const formatted = numberWithCommas(1234567.89, 2);
 *  assert.equal(formatted, '1,234,567.89');
 * ```
 */
export function numberWithCommas(x, precision) {
    if (typeof x !== 'number') {
        return x;
    }

    return (x || 0).toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// regexp finds all the characters between the last '(' and the last ')'
const regexp = /^.*\(([^()]+)\)+(:.*)?$/g;
// regexp2 finds all the characters before the last ':'
const regexp2 = /^(.*)(:.*)$/g;

/**
 * cleanAttributeName cleans an attribute name by removing the wrapping
 * metadata that may have been added by the search engine. (e.g. `ordered(name)`)
 *
 * @param {string} attribute
 * @returns string
 */
export function cleanAttributeName(attribute) {
    return attribute.trim().replace(regexp, '$1').replace(regexp2, '$1');
}

/**
 * humanNumber formats a number in a human readable format.
 *
 * @param {number} number - The number to format.
 * @param {number} decimals - The number of decimals to display.
 * @param {string} dec_point - The decimal separator (e.g. '.').
 * @param {string} thousands_sep - The thousands separator (e.g. ',').
 * @returns string
 *
 * @example
 * ```
 *   const formatted = humanNumber(1234567.89, 2, '.', ',');
 *   assert.equal(formatted, '1,234,567.89');
 * ```
 */
export function humanNumber(number, decimals, dec_point, thousands_sep) {
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        toFixedFix = function (n, prec) {
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            var k = Math.pow(10, prec);
            return Math.round(n * k) / k;
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

/**
 * cleanDeepAttributeName cleans a nested attributed name by retrieving the
 * first part of the attribute.
 *
 * @param {string} attribute
 * @returns string
 *
 * @example
 * ```
 *   const cleaned = cleanDeepAttributeName('name.first');
 *   assert.equal(cleaned, 'name');
 * ```
 */
export function cleanDeepAttributeName(attribute) {
    return attribute.split('.')[0];
}

let div = null;
/**
 * escapeHtml escapes a string to prevent XSS.
 * @param {string} value
 * @returns string
 *
 * @example
 * ```
 *   const escaped = escapeHtml('<script>alert("XSS")</script>');
 *   assert.equal(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
 * ```
 */
export function escapeHtml(value) {
    div = (div === null ? document.createElement('div') : div);
    div.textContent = value;
    return div.innerHTML;
}

/**
 * unescapeEm unescapes the <em> tags in a string.
 *
 * @param {string} value - The string in which to unescape the <em> tags.
 * @returns {string}
 *
 * @example
 * ```
 *   const unescaped = unescapeEm('&lt;em&gt;word&lt;/em&gt;');
 *   assert.equal(unescaped, '<em>word</em>');
 * ```
 */
export function unescapeEm(value) {
    return value.replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>');
}

/**
 * escapeAndHighlightHit escapes an instantsearch highlighted string and replaces the
 * highlighting tag with the standard highlighting tag used in the tools applications.
 * It is xss safe.
 *
 * @param {string} value - The instantsearch highlighted string to escape and highlight.
 * @param {string?} regexp - The regular expression to use to find the highlighting tags.
 * @param {string?} highlightClassName - The class name to use for the highlighting tag.
 * @returns string
 */
export function escapeAndHighlightHit(
    value = '',
    regexp = /<(\/)?ais-highlight-(\d+)>/g,
    highlightClassName = ''
) {
    const str = value.replace(regexp, '{{{$1ais-highlight-$2}}}');

    return escapeHtml(str).replace(
        /{{{(\/?)ais-highlight-[^}]*}}}/g,
        highlightClassName === '' ? '<$1em>' : `<$1em class="${highlightClassName}">`
    );
}

/**
 * syntaxHighlight highlights a JSON string.
 * It is xss safe.
 *
 * @param {string} json - The JSON string to highlight.
 * @returns string
 */
export function syntaxHighlight(json) {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="json-token ' + cls + '">' + escapeAndHighlightHit(match) + '</span>';
    });
};

export function highlightJsonObject(json) {
    return syntaxHighlight(JSON.stringify(json, null, 2));
};

/**
 * properHighlight replaces the highlighting returned by the search API for
 * synonyms with the standard highlighting tag used in the tools applications.
 * (e.g. <b>word</b> => <em>word</em>)
 *
 * USE WITH CAUTION: This function is not _generally_ XSS safe. It is only xss safe
 * if passed directly to v-html:
 *
 * If passed to v-html, the content will be treated as a textual node until it finds
 * an entity declaration. To declare an entity, the character `<` and `>` must be used.
 * These characters will be replaced by `&lt;` and `&gt;` respectively. This means that
 * no new entities can be declared. The only exception is `<b>` and `</b>` which will
 * be replaced by `<em>` and `</em>`, which is safe.
 *
 * DANGER: If passed in an attribute inside an entity, the sanitization rules are
 * not sufficient. i.e. `v-html="<img alt='{{properHighlight(s)}}'>"` is not safe.
 *
 * @param {string} s
 * @returns {string}
 */
export function properHighlight(s) {
    return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&lt;b&gt;/g, '<em>').replace(/&lt;\/b&gt;/g, '</em>');
};

/**
 * highlightStringBaseOnQuery highlights a string based on a query.
 * It is not XSS safe. The caller should escape the string before calling this
 * function, if necessary.
 *
 * @param {string} s - The string to highlight.
 * @param {string} q - The query to use for highlighting.
 * @returns string
 *
 * @example
 * ```
 *   const highlighted = highlightStringBaseOnQuery('Hello world', 'world');
 *   assert.equal(highlighted, 'Hello <em>world</em>');
 * ```
 */
export function highlightStringBaseOnQuery(s, q) {
    if (q.length <= 0) return s;

    const words = q.toLowerCase().split(' ').sort((a, b) => { return b.length - a.length;}).filter((a) => {
        return a.trim().length > 0;
    });
    let highlightedString = '';

    for (let i = 0; i < s.length; i++) {
        let foundMatch = false;
        for (let j = 0; j < words.length; j++) {
            if (s.toLowerCase().startsWith(words[j].toLowerCase(), i)) {
                highlightedString += `<em>${s.slice(i, i + words[j].length)}</em>`;
                i += words[j].length - 1;
                foundMatch = true;
                break;
            }
        }
        if (!foundMatch) highlightedString += s[i];
    }

    return highlightedString;
}
