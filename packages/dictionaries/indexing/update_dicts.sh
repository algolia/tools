#!/bin/sh

mkdir -p ~/.ssh
echo "${GIT_SSH_KEY}" > ~/.ssh/id_rsa_github
ssh-keyscan -H github.com >> ~/.ssh/known_hosts
eval $(ssh-agent) && ssh-add ~/.ssh/id_rsa_github
ls dictionaries || git clone git@github.com:algolia/dictionaries.git
cd dictionaries && git pull origin master && cd ..
python indexing.py
ssh-agent -k
© 2019 GitHub, Inc.