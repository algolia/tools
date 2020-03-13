export function percent (nb, count) {
    if (count === 0) return '0%';
    return `${(nb * 100 / count).toFixed(2)}%`;
}
