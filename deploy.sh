#!/usr/bin/env bash
# This script assumes an virtualenv exists at .venv and awscli is installed in this venv

if [[ $1 == "sink" ]]; then
  echo "packaging..."
  mkdir -p out
  rm -f out/sink.zip
  zip -r out/sink.zip . -x yarn.lock -x README.md -x deploy.sh -x "*aws-sdk-layer*" -x "*node_modules*" -x "*.DS_Store*" -x "*.venv*" -x "*.idea*" -x ".gitignore" -x "*.git*" -x "*out*" -x test.js -x worker.js
  echo "deploying to λ function..."
  cd out
  ../.venv/bin/aws lambda update-function-code --function-name "rainbowApiLambda" --zip-file "fileb://sink.zip" --profile edtubedev --region "ap-south-1"
  cd ..
fi

if [[ $1 == "worker" ]]; then
  echo "packaging..."
  mkdir -p out
  rm -f out/worker.zip
  zip -r out/worker.zip . -x package.json -x yarn.lock -x README.md -x deploy.sh -x "*aws-sdk-layer*" -x "*node_modules*" -x "*.DS_Store*" -x "*.venv*" -x "*.idea*" -x ".gitignore" -x "*.git*" -x "*out*" -x test.js -x index.js
  echo "deploying to λ function..."
  cd out
  ../.venv/bin/aws lambda update-function-code --function-name "worker" --zip-file "fileb://worker.zip" --profile edtubedev --region "ap-south-1"
  cd ..
fi

if [[ $1 == "sender" ]]; then
  echo "packaging..."
  mkdir -p out
  rm -f out/sender.zip
  zip -r out/sender.zip . -x package.json -x yarn.lock -x README.md -x deploy.sh -x "*aws-sdk-layer*" -x "*node_modules*" -x "*.DS_Store*" -x "*.venv*" -x "*.idea*" -x ".gitignore" -x "*.git*" -x "*out*" -x test.js -x index.js
  echo "deploying to λ function..."
  cd out
  ../.venv/bin/aws lambda update-function-code --function-name "SmsSender" --zip-file "fileb://sender.zip" --profile edtubedev --region "ap-south-1"
  cd ..
fi
