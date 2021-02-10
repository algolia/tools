import moment from 'moment';

const styles = {
    long: 'DD MMM YYYY, h:mma',
    short: 'YYYY-MM-DD',
    niceShort: 'DD MMM',
    niceShortWithYear: 'DD MMM YYYY'
};

export default function formatDate(date, style = 'long') {
    return moment(date).format(styles[style] || style);
}

export function timeFromNow(date) {
    return moment(date).fromNow();
}

export function toISODate(date) {
    return moment(date).toISOString();
}

export function diffDays(date, fromDate = new Date()) {
    return Math.round(moment.duration(moment(fromDate).diff(moment(date))).asDays());
}