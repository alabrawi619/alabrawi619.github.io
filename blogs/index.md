---
layout: blog-doc
title: Blogs
description: Blogs and the sections that connect them. Drag nodes, hover for details.
---

<section class="graph-section" id="graph">
  <div class="graph-shell reveal">
    <div id="knowledge-graph" data-src="{{ '/graph-data.json' | relative_url }}" role="img" aria-label="Force-directed graph of blogs and sections">
      <p class="graph-empty" hidden>No blogs yet — the graph will grow as you publish.</p>
    </div>
    <div class="graph-legend">
      <span class="legend-item"><span class="legend-dot legend-blog"></span>Blog</span>
      <span class="legend-item"><span class="legend-dot legend-section"></span>Section</span>
    </div>
    <div id="graph-tooltip" class="graph-tooltip" role="tooltip" hidden></div>
  </div>
</section>

<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js" defer></script>
<script src="{{ '/assets/js/graph.js' | relative_url }}" defer></script>
