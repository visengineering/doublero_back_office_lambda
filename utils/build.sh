#!/usr/bin/env bash

cwd=$(git rev-parse --show-toplevel)

cd $cwd/shared/common-util
npm run build

cd $cwd/utils
npm run build
