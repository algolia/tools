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

export function formatHumanDistance(nb) {
    return formatHumanNumber(nb, 0, ['m', 'km'], 1000);
}

export function numberWithCommas(x, precision) {
    if (typeof x !== 'number') {
        return x;
    }

    return (x || 0).toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const regexp = /^.*\(([^()]+)\)+(:.*)?$/g;
const regexp2 = /^(.*)(:.*)$/g;

export function cleanAttributeName(attribute) {
    return attribute.trim().replace(regexp, '$1').replace(regexp2, '$1');
}

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

export function cleanDeepAttributeName(attribute) {
    return attribute.split('.')[0];
}

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
        return '<span class="json-token ' + cls + '">' + match + '</span>';
    });
};

export function highlightJsonObject(json) {
    return syntaxHighlight(JSON.stringify(json, null, 2));
};

export function properHighlight(s) {
    return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&lt;b&gt;/g, '<em>').replace(/&lt;\/b&gt;/g, '</em>');
};
