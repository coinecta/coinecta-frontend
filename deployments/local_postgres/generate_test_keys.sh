#!/bin/bash
mkdir -p test_keys
openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 365 -out server.crt
