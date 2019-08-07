function range(a, b) {
    const r = [];
    for (let i = a; i < b; i++) r.push(i);
    return r;
}

export default function(page, nbPage) {
    this.currentPage = page;
    this.total = nbPage;
    this.padding = 3;

    this.pages = function () {
        const { total, currentPage, padding } = this;

        if (total === 0) return [0];

        const totalDisplayedPages = this.nbPagesDisplayed(padding, total);
        if (totalDisplayedPages === total) return range(0, total);

        const paddingLeft = this.calculatePaddingLeft(
            currentPage,
            padding,
            total,
            totalDisplayedPages
        );
        const paddingRight = totalDisplayedPages - paddingLeft;

        const first = currentPage - paddingLeft;
        const last = currentPage + paddingRight;

        return range(first, last);
    };

    this.nbPagesDisplayed = function (padding, total) {
        return Math.min(2 * padding + 1, total);
    };

    this.calculatePaddingLeft = function(current, padding, total, totalDisplayedPages) {
        if (current <= padding) {
            return current;
        }

        if (current >= total - padding) {
            return totalDisplayedPages - (total - current);
        }

        return padding;
    };

    this.isLastPage = function () {
        return this.currentPage === this.total - 1;
    };

    this.isFirstPage = function () {
        return this.currentPage === 0;
    };
}