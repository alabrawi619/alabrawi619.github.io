---
layout: blog-doc
title: Blogs
description: A connected map of notes, tools, and ideas.
blog_landing: true
---

<section class="graph-section" id="graph">
  <div class="graph-panel-head">
    <div>
      <span class="graph-kicker">Live map</span>
      <h2>Explore the connections</h2>
    </div>
    <div class="graph-legend" aria-label="Graph legend">
      <span class="legend-item"><span class="legend-dot legend-blog"></span>Blog</span>
      <span class="legend-item"><span class="legend-dot legend-tag"></span>Tag</span>
    </div>
  </div>
  <div class="graph-shell reveal">
    <div id="knowledge-graph" data-src="{{ '/graph-data.json' | relative_url }}" role="img" aria-label="Force-directed graph of blogs and tags">
      <p class="graph-empty" hidden>No blogs yet — the graph will grow as you publish.</p>
    </div>
    <div id="graph-tooltip" class="graph-tooltip" role="tooltip" hidden></div>
  </div>
  <p class="graph-hint"><span>↗</span> Drag to rearrange · Scroll to zoom · Select a cyan node to read</p>
</section>

<section class="blog-directory category-directory" aria-labelledby="directory-title">
  <div class="directory-head">
    <span class="graph-kicker">Index</span>
    <h2 id="directory-title">Categories</h2>
  </div>
  <div class="category-list">
    {%- for section in site.data.blog_sections -%}
      {%- unless section.parent -%}
      <details class="category-card" open>
        <summary>
          {%- assign total_category_count = section.descendants.size | plus: 1 -%}
          <span class="category-folder" aria-hidden="true">▰</span>
          <a href="{{ section.url | relative_url }}">{{ section.name }}</a>
          <span class="category-meta">{{ total_category_count }} {% if total_category_count == 1 %}category{% else %}categories{% endif %}, {{ section.total_count }} {% if section.total_count == 1 %}post{% else %}posts{% endif %}</span>
          <span class="category-chevron" aria-hidden="true"></span>
        </summary>
        <div class="category-children">
          {%- assign blogs = section.all_pages | sort: "title" -%}
          {%- for blog in blogs -%}
          <a class="category-row" href="{{ blog.url | relative_url }}">
            <span class="category-row-icon" aria-hidden="true">□</span>
            <span class="category-row-name">{{ blog.title | default: blog.name }}</span>
            <span class="category-row-count">1 post</span>
          </a>
          {%- endfor -%}
        </div>
      </details>
      {%- endunless -%}
    {%- endfor -%}
  </div>
</section>

<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js" defer></script>
<script src="{{ '/assets/js/graph.js' | relative_url }}" defer></script>
