#!/bin/bash

for i in {41080..41000}
do
  echo "Getting $i"
  /usr/bin/curl "http://localhost:14000/indexSearch?query=scania&levels=$i"
  echo "\n"
done
