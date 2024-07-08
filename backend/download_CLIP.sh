#!/bin/bash

# Check if the CLIP models directory exists
if [ ! -d "./backend/src/models/fashion-clip" ]; then
  # Create the directory if it doesn't exist

  echo Creating...
  mkdir ./backend/src/models/fashion-clip
  # Clone the repository into the directory
  git clone https://huggingface.co/patrickjohncyh/fashion-clip ./backend/src/models/fashion-clip --verbose --depth=1

find ./backend/src/fashion-clip/ -type f -o -type d -name .git -delete

echo CLIP directory exists
fi