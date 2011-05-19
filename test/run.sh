#!/bin/sh
/bin/echo -n "Enter AWS key: " && read AWS_KEY && \
/bin/echo -n "Enter AWS secret: " && read AWS_SECRET && \
expresso "test/test.js" "$AWS_KEY" "$AWS_SECRET"
