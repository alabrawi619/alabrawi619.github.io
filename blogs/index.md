---
layout: blog-doc
title: Blogs
description: Folder-organised notes. Sections in the sidebar are driven by the sub-directories under blogs/.
---

Welcome to the blogs area. Every Markdown file you drop under
`blogs/<section>/<name>.md` shows up automatically in the sidebar, grouped by
its section folder.

- `blogs/cloud/aws.md` &rarr; **cloud** section
- `blogs/cyber/nmap.md` &rarr; **cyber** section

Add a new folder to create a new section, or a new `.md` file to add an entry
to an existing one. Give each file a `layout: blog-doc` and a `title:` in its
front matter and it will appear in the navigation.
