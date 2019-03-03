#!/bin/bash

node "test.js" &
pid="$!"
sleep 1
curl -XPOST http://localhost:8080/notify -d'{"hello": "world"}' --header "Content-Type: application/json"
kill "$pid"
