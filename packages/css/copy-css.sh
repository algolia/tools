TARGET_DIRS=(
    "../apps/public/"
    "../index-differ/public/"
    "../index-manager/public/"
    "../logs/public/"
    "../metaparams/public/"
    "../relevance-testing/public/"
    "../index-analyzer/public/"
    "../insights-ui/public/"
    "../transform/public/"
)

for DIR in "${TARGET_DIRS[@]}"; do
    # Copy all.css if it exists
    if [ -f ./dist/all.css ]; then
        cp ./dist/all.css "$DIR";
    fi

    # Copy all.css.map if it exists
    if [ -f ./dist/all.css.map ]; then
        cp ./dist/all.css.map "$DIR";
    fi

    cp ./favicon.ico "$DIR";
done
