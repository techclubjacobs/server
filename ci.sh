#/usr/bin/env/sh
set -e

echo "INFO: Installing dependencies"
yarn install
echo "SUCCESS: Installing dependencies"
echo "INFO: Linting"
npx tslint --project .
echo "SUCCESS: Linting"
