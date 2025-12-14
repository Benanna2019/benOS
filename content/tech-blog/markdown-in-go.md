---
"_id": "cm4rij58700000clb5axzh9t3"
title: "Markdown in Go"
date: "2024-12-16"
slug: "markdown-in-go"
description: "Building with markdown in Go"
categories:
  ["Markdown", "Go"]
author: "Ben Patton"
authorImage: "https://cdn.sanity.io/images/nfspldzq/production/3ceeda54221c7c0614ecc51f955c7be39a1da34e-512x512.jpg"
type: "Blog"
url: "markdown-in-go"
---

I ported this blog to Go. It has been a lot of fun learning things but there have been some challenges that I did not expect. One of those being the rendering of markdown files. 

I have been using a package called goldmark and it was largely fine. But after a couple of days writing and publishing I noticed that previous blogs, as in much older blog posts were not showing up. This usually isn't a problem in JS Land due to content sites being a well established method and therefore the tools are more mature. You just don't have to think about a whole lot. 

So in Go I had to figure out how to separate frontmatter, or as I learned, the YAML from the markdown content. 

Because there was silent failure around the YAML unmarshalling/parsing I was trying many ways to parse the markdown without relying on Go. So I tried a few different methods. It gave my my first experience creating a lib and using esbuild to bundle it and put it into a static file to use by other projects in this project. It just wasn't necessary nor did it work in the end but this was only due to the custom elements and how they are rendered and that they don't have access to scripts in the document when they are rendered. I should probably write about bundling a package at some point.

The primary problem that I figured out after a day or so was that the YAML unmarshalling would silently fail if certain characters were present. In this case it was if I had a colon (:) in my markdown anywhere. The frontmatter was parsed fine but since the unmarshalling was trying to unmarshal the whole blog post it would fail. Which makes sense because we are passing everything to a YAML parser. 

I ended up having to split the file up into parts so that I could handle the frontmatter through the YAML parser and then the content through markdown.

This probably isn't the best go code but here is what I ended up with. There is a lot more to it in terms of how I am morphing the parts into the correct struct so I can pass it to my WASM custom elements but this is where the primary issue. 

```go
func ParseMarkdownFile(filename string) (*FrontMatter, string, error) {
    // Read the markdown file
    content, err := os.ReadFile(filename)
    if err != nil {
        return nil, "", fmt.Errorf("reading file: %w", err)
    }

    // Separate frontmatter from content
    parts := bytes.SplitN(content, []byte("---\n"), 3)
    if len(parts) < 3 {
        return nil, "", fmt.Errorf("invalid frontmatter format")
    }

    // Parse only the frontmatter section
    var meta FrontMatter
    err = yaml.Unmarshal(parts[1], &meta)
    if err != nil {
        return nil, "", fmt.Errorf("parsing frontmatter: %w", err)
    }

    md := goldmark.New(
        goldmark.WithExtensions(
            extension.GFM,                
            extension.Typographer,
            extension.TaskList,         
            extension.Table,             
            extension.Strikethrough,     
            highlighting.NewHighlighting(
                highlighting.WithStyle("dracula"),
            ),
        ),
        goldmark.WithParserOptions(
            parser.WithAutoHeadingID(),     
            parser.WithAttribute(),
            parser.WithHeadingAttribute(),   
        ),
        goldmark.WithRendererOptions(
            html.WithHardWraps(),            
            html.WithXHTML(),        
            html.WithUnsafe(),
        ),
    )

    var buf bytes.Buffer
    if err := md.Convert(parts[2], &buf); err != nil {
        return nil, "", fmt.Errorf("converting markdown: %w", err)
    }

    return &meta, buf.String(), nil
}
```
