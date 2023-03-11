#!/bin/bash

for i in {41010..41000} # 41080 is the highest level.
do
  echo "Getting $i"

  # Local
  # /usr/bin/curl "http://localhost:4000/indexSearch?query=scania&levels=$i"

  # CI
  # /usr/bin/curl "https://comprima.dev.cfn.iteam.se/indexSearch?query=scania&levels=$i"
  echo "\n"
done
