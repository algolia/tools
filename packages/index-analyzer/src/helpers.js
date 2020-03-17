export function percent (nb, count) {
    if (count === 0) return '0%';
    const percentage = nb * 100 / count;
    return `${Math.round((percentage + Number.EPSILON) * 100) / 100}%`;
}
