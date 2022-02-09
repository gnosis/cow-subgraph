#!/usr/bin/env bash

set -e

npx truffle migrate
yarn deploy --gasPrice '1000000000'
#yarn truffle-exec scripts/ganache/setup_thegraph_data.ts
