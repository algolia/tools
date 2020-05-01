yarn lerna run build
git add packages/**/dist/
git commit -m "update dist"
git push origin master
git push heroku master
