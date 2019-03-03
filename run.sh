#!/bin/bash

cd "$( dirname "$0" )"

PATH="$PATH:/opt/node/node-v11.10.1-linux-x64/bin"
export PATH

./get_new_file_and_rotate.sh
