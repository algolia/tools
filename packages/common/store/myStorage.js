export default function(options, key) {
    options = options || {};
    key = options.key || 'vuex';
    const storage = window && window.sessionStorage;
    const timeBeforeSaving = 500;
    let timeout = null;

    function getState(key, storage, value) {
        try {
            return (value = storage.getItem(key)) && typeof value !== 'undefined'
                ? JSON.parse(value)
                : undefined;
        } catch (err) {}

        return undefined;
    }

    function setState(key, state, storage) {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            let reducedState = state;
            if (options.reducer) {
                reducedState = options.reducer(state);
            }
            storage.setItem(key, JSON.stringify(reducedState))
        }, timeBeforeSaving);
    }

    return function(store) {
        const savedState = getState(key, storage);

        if (typeof savedState === 'object' && savedState !== null) {
            let k;
            for (k in store.state) {
                if (savedState[k] === undefined) {
                    savedState[k] = store.state[k];
                }
            }

            for (k in store.state.panels) {
                if (savedState.panels[k] === undefined) {
                    savedState.panels[k] = store.state.panels[k];
                }
            }

            store.replaceState(savedState);
        }

        store.subscribe(function(mutation, state) {
            setState(key, state, storage);
        });
    };
}
