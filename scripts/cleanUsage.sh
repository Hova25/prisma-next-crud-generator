#!/bin/bash

subdirectories=( "actions" "app" "components" "lib" )

for subdir in "${subdirectories[@]}"; do
    dir="$PWD/src/$subdir"
    echo "Clean Repertory : $dir"

    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec rm -rf {} +

    while [ -n "$(find "$dir" -type d -empty)" ]; do
        find "$dir" -type d -empty -delete
    done

    echo "✅ $dir cleaned"
done

echo "✅ All directories are cleaned."