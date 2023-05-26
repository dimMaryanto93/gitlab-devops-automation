#!/bin/sh
export GIT_EXISTING_REMOTE_BRANCH=$(git ls-remote origin --refs heads/review-env | wc -l);

if [ ${GIT_EXISTING_REMOTE_BRANCH} -eq 1 ]; then
  git pull origin review-env:main;
  else echo "Repository is clean!"
fi