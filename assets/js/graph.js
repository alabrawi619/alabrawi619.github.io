/* graph.js — Obsidian-style force-directed knowledge graph (D3 v7) */
(function () {
  "use strict";

  function init() {
    var container = document.getElementById("knowledge-graph");
    if (!container || typeof window.d3 === "undefined") return;

    var src = container.getAttribute("data-src");
    var tooltip = document.getElementById("graph-tooltip");
    var emptyMsg = container.querySelector(".graph-empty");

    d3.json(src).then(function (data) {
      if (!data || !data.nodes || data.nodes.length === 0) {
        if (emptyMsg) emptyMsg.hidden = false;
        return;
      }
      // Graph has data — make sure the empty-state overlay is hidden so it can
      // never sit on top of the rendered SVG.
      if (emptyMsg) emptyMsg.hidden = true;
      render(data);
    }).catch(function () {
      if (emptyMsg) {
        emptyMsg.hidden = false;
        emptyMsg.textContent = "Unable to load graph data.";
      }
    });

    function size() {
      return {
        w: container.clientWidth || 800,
        h: container.clientHeight || 520
      };
    }

    // Neon palette (kept in sync with SCSS variables).
    var COLOR_BLOG = "#00e5ff";
    var COLOR_SECTION = "#ff2bd6";

    function render(data) {
      var dim = size();

      var svg = d3.select(container)
        .append("svg")
        .attr("class", "graph-svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, dim.w, dim.h])
        .attr("preserveAspectRatio", "xMidYMid meet");

      var root = svg.append("g");

      // Zoom / pan.
      svg.call(d3.zoom()
        .scaleExtent([0.3, 4])
        .on("zoom", function (event) { root.attr("transform", event.transform); }));

      var simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(function (d) { return d.id; }).distance(70).strength(0.6))
        .force("charge", d3.forceManyBody().strength(-220))
        .force("center", d3.forceCenter(dim.w / 2, dim.h / 2))
        .force("collide", d3.forceCollide().radius(function (d) { return radius(d) + 6; }));

      var link = root.append("g")
        .attr("class", "graph-links")
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("class", "graph-link");

      var node = root.append("g")
        .attr("class", "graph-nodes")
        .selectAll("g")
        .data(data.nodes)
        .join("g")
        .attr("class", function (d) { return "graph-node node-" + d.type; })
        .call(drag(simulation));

      node.append("circle")
        .attr("r", radius)
        .attr("fill", function (d) { return d.type === "blog" ? COLOR_BLOG : COLOR_SECTION; });

      node.append("text")
        .attr("class", "graph-label")
        .attr("dy", function (d) { return radius(d) + 12; })
        .attr("text-anchor", "middle")
        .text(function (d) { return d.label; });

      // Adjacency map for neighbour highlighting.
      var neighbors = {};
      data.links.forEach(function (l) {
        var s = typeof l.source === "object" ? l.source.id : l.source;
        var t = typeof l.target === "object" ? l.target.id : l.target;
        (neighbors[s] = neighbors[s] || {})[t] = true;
        (neighbors[t] = neighbors[t] || {})[s] = true;
      });
      function isConnected(a, b) {
        return a === b || (neighbors[a] && neighbors[a][b]);
      }

      function highlight(d) {
        svg.classed("is-hovering", true);
        node.classed("is-active", function (n) { return n.id === d.id; })
          .classed("is-neighbor", function (n) { return n.id !== d.id && isConnected(d.id, n.id); });
        link.classed("is-active", function (l) {
          var s = l.source.id || l.source, t = l.target.id || l.target;
          return s === d.id || t === d.id;
        });
      }
      function clearHighlight() {
        svg.classed("is-hovering", false);
        node.classed("is-active", false).classed("is-neighbor", false);
        link.classed("is-active", false);
      }

      node.on("mouseover", function (event, d) { showTip(event, d); highlight(d); })
        .on("mousemove", moveTip)
        .on("mouseout", function () { hideTip(); clearHighlight(); })
        .on("click", function (event, d) {
          if (d.type === "blog" && d.url) window.location.href = d.url;
        });

      simulation.on("tick", function () {
        link
          .attr("x1", function (d) { return d.source.x; })
          .attr("y1", function (d) { return d.source.y; })
          .attr("x2", function (d) { return d.target.x; })
          .attr("y2", function (d) { return d.target.y; });
        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
      });

      window.addEventListener("resize", function () {
        var d2 = size();
        svg.attr("viewBox", [0, 0, d2.w, d2.h]);
        simulation.force("center", d3.forceCenter(d2.w / 2, d2.h / 2));
        simulation.alpha(0.3).restart();
      });
    }

    function radius(d) {
      if (d.type === "section") return 5 + Math.min(d.count || 1, 6);
      return 10;
    }

    function showTip(event, d) {
      if (!tooltip) return;
      var html = d.type === "blog"
        ? "<strong>" + escapeHtml(d.label) + "</strong><span>" + escapeHtml(d.section || "") + "</span>"
        : "<strong>" + escapeHtml(d.label) + "</strong><span>" + (d.count || 0) + " blog" + ((d.count || 0) === 1 ? "" : "s") + "</span>";
      tooltip.innerHTML = html;
      tooltip.hidden = false;
      moveTip(event);
    }

    function moveTip(event) {
      if (!tooltip || tooltip.hidden) return;
      var rect = container.getBoundingClientRect();
      tooltip.style.left = (event.clientX - rect.left + 14) + "px";
      tooltip.style.top = (event.clientY - rect.top + 14) + "px";
    }

    function hideTip() {
      if (tooltip) tooltip.hidden = true;
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function drag(simulation) {
      function started(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      }
      function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
      function ended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      }
      return d3.drag().on("start", started).on("drag", dragged).on("end", ended);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
