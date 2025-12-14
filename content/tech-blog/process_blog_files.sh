#!/bin/bash

# Process all files that start with a date pattern
for file in [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.md; do
    if [ -f "$file" ]; then
        # Extract the filename without the date prefix
        new_name=$(echo "$file" | sed 's/^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-//')
        
        # Get the base name without extension for the url property
        url_name=$(echo "$new_name" | sed 's/\.md$//')
        
        echo "Processing: $file -> $new_name"
        
        # Rename the file
        mv "$file" "$new_name"
        
        # Add url property to frontmatter
        # First, check if the file has frontmatter
        if head -1 "$new_name" | grep -q "^---$"; then
            # Create a temporary file with the updated frontmatter
            {
                # Print the opening ---
                head -1 "$new_name"
                
                # Process the frontmatter section
                tail -n +2 "$new_name" | awk -v url="$url_name" '
                /^---$/ { 
                    print "url: \"" url "\""
                    print $0
                    exit
                }
                { print }
                '
                
                # Print the rest of the file after the closing ---
                tail -n +2 "$new_name" | awk '/^---$/ { found=1; next } found { print }'
            } > "${new_name}.tmp"
            
            mv "${new_name}.tmp" "$new_name"
        fi
    fi
done 