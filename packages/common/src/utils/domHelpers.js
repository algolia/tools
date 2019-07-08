export default function goToAnchor(anchor) {
    const url = window.location.href;
    window.location.href = anchor;
    window.history.replaceState(null, null, url);
}