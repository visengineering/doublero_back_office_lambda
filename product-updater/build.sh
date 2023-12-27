#!/usr/bin/env bash

cwd=$(git rev-parse --show-toplevel)

cd $cwd/shared/common-util
npm run build

cd $cwd/shared/common-db
npm run build

cd $cwd/product-updater
npm run build
