var m = [20, 120, 20, 120],
  w = 1300 - m[1] - m[3],
  h = 600 - m[0] - m[2],
  i = 0,
  root;

var tree = d3.layout.tree().size([h, w]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) {
    return [d.y, d.x];
  });

var vis = d3.select("#tree")
  .append("svg:svg")
  .attr("width", w + m[1] + m[3])
  .attr("height", h + m[0] + m[2])
  .append("svg:g")
  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

d3.json("flare.json", function(json) {
  root = json;
  root.x0 = h / 2;
  root.y0 = 0;

  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }

  // Initialize the display to show a few nodes.
  root.children.forEach(toggleAll);
  toggle(root.children[0]);
  toggle(root.children[0].children[0]);

  update(root);
});

function update(source) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * 200;
  });

  // Update the nodes…
  var node = vis.selectAll("g.node")
    .data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", function(d) {
      toggle(d);
      update(d);
    });


  nodeEnter.append("path")
    .style("fill", function(d) {
      if (d.type == "query" || d.type == "gene") {
        return "#FFA500"
      } else {
        return "rgba(0, 100, 255, 0.5)"
      }
    })
    .attr("d", d3.svg.symbol().size(function(d) {
        if (d.type == "go-root") {
          return 200;
        } else if (d.type == "query") {
          return 1200;
        } else if (d.type == "go-term") {
          if (d.children !== undefined) {
            return d.children.length * 200;
          } else if (d._children !== undefined) {
            return d._children.length * 200;
          } else {
            return 200;
          }
        } else {
          return 200;
        }
      })
      .type(
        function(d) {
          if (d.type == "go-root") {
            return "square";
          } else {
            return "circle";
          }
        }
      )
    );

  nodeEnter.append("svg:text")
    .attr("x", function(d) {
      if (d.type == "query") {
        return "1em";
      } else {
        return d.children || d._children ? -25 : 25;
      }
    })
    .attr("dy", function(d) {
      if (d.type == "query") {
        return "2em";
      } else {
        return "0.35em";
      }
    })
    .attr("text-anchor", function(d) {
      return d.children || d._children ? "end" : "start";
    })
    .text(function(d) {
      console.log(d);
      if (d.children !== undefined && d.type == "go-term") {
        return d.name + " (" + d.children.length + ")";
      } else if (d._children !== undefined && d.type == "go-term") {
        return d.name + " (" + d._children.length + ")";
      } else {
        return d.name;
      }
    })
    .style("fill-opacity", 1e-6)
    .style("font-size", function(d) {
      if (d.type == "query") {
        return "1.8em";
      } else {
        return "0.8em";
      }
    });

  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  nodeUpdate.select("square")
    .attr("width", function(d) {
      if (d.type === "go-root") {
        return 20;
      } else {
        return 5;
      }
    })
    .style("fill", function(d) {
      if (d.type === "go-root") {
        return "#ff0044";
      } else {
        return "red";
      }
    });

  nodeUpdate.select("text")
    .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select("circle")
    .attr("r", 1e-6);

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);

  var link = vis.selectAll("path.link")
    .data(tree.links(nodes), function(d) {
      return d.target.id;
    });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
      var o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr("d", function(d) {
      var o = {
        x: source.x,
        y: source.y
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}