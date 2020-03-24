import Papa from "papaparse";

export function percent (nb, count) {
    if (count === 0) return '0%';
    const percentage = nb * 100 / count;
    return `${Math.round((percentage + Number.EPSILON) * 100) / 100}%`;
}

export function downloadCsv(rows, fileName) {
    const csvContent = Papa.unparse(rows);

    const csvData = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
}
