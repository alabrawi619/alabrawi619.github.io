---
layout: blog-doc
title: Blogs
description: A connected map of notes, tools, and ideas.
blog_landing: true
---

{%- assign blog_docs = site.pages | where_exp: "p", "p.dir contains '/blogs/'" | where_exp: "p", "p.dir != '/blogs/'" -%}
{%- assign grouped = blog_docs | group_by: "blog_section" | sort: "name" -%}

<section class="graph-section" id="graph">
  <div class="graph-panel-head">
    <div>
      <span class="graph-kicker">Live map</span>
      <h2>Explore the connections</h2>
    </div>
    <div class="graph-legend" aria-label="Graph legend">
      <span class="legend-item"><span class="legend-dot legend-blog"></span>Blog</span>
      <span class="legend-item"><span class="legend-dot legend-section"></span>Section</span>
    </div>
  </div>
  <div class="graph-shell reveal">
    <div id="knowledge-graph" data-src="{{ '/graph-data.json' | relative_url }}" role="img" aria-label="Force-directed graph of blogs and sections">
      <p class="graph-empty" hidden>No blogs yet — the graph will grow as you publish.</p>
    </div>
    <div id="graph-tooltip" class="graph-tooltip" role="tooltip" hidden></div>
  </div>
  <p class="graph-hint"><span>↗</span> Drag to rearrange · Scroll to zoom · Select a cyan node to read</p>
</section>

<section class="blog-directory" aria-labelledby="directory-title">
  <div class="directory-head">
    <span class="graph-kicker">Index</span>
    <h2 id="directory-title">Browse by section</h2>
  </div>
  <div class="section-grid">
    {%- for group in grouped -%}
    <article class="section-card">
      <div class="section-card-head">
        <span class="section-number">{% if forloop.index < 10 %}0{% endif %}{{ forloop.index }}</span>
        <span class="section-count">{{ group.items.size }} {% if group.items.size == 1 %}entry{% else %}entries{% endif %}</span>
      </div>
      <h3>{{ group.name }}</h3>
      <ul>
        {%- assign items = group.items | sort: "title" -%}
        {%- for doc in items -%}
        <li><a href="{{ doc.url | relative_url }}"><span>{{ doc.title | default: doc.name }}</span><span aria-hidden="true">↗</span></a></li>
        {%- endfor -%}
      </ul>
    </article>
    {%- endfor -%}
  </div>
</section>

<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js" defer></script>
<script src="{{ '/assets/js/graph.js' | relative_url }}" defer></script>
