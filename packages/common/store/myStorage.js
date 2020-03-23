export default function(options, storage, key) {
    options = options || {};
    storage = options.storage || (window && window.localStorage);
    key = options.key || 'vuex';
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

            store.replaceState(savedState);
        }

        store.subscribe(function(mutation, state) {
            setState(key, state, storage);
        });
    };
}
