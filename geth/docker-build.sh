#!/bin/bash

docker build -t tranx_playload_geth .
docker run -tid --restart=always --name tranx_playload_geth -p 8545:8545 tranx_playload_geth
