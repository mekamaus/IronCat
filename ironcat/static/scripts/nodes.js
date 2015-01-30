$(function() {

    function translate(x, y) {
        if (x.x !== undefined && x.y !== undefined) {
            y = x.y;
            x = x.x;
        } else if (x.length && x.length >= 2) {
            y = x[1];
            x = x[0];
        }
        return 'translate(' + x + (y ? (', ' + y) : '') + ')';
    }

    function rotate(a) {
        return 'rotate(' + a + ')';
    }

    function scale(x, y) {
        return 'scale(' + x + (y ? (', ' + y) : '') + ')';
    }

    function matrix(a, b, c, d, e, f) {
        return 'matrix(' + a + ', ' + b + ', ' + c + ', ' + d + ', ' + e + ', ' + f + ')';
    }

    function skewX(a) {
        return 'skewX(' + a + ')';
    }

    function skewY(a) {
        return 'skewY(' + a + ')';
    }

    function moveto(x, y, local) {
        if (x.x !== undefined && x.y !== undefined) {
            local = y;
            y = x.y;
            x = x.x;
        } else if (x.length && x.length >= 2) {
            local = y;
            y = x[1];
            x = x[0];
        }
        return (local ? 'm' : 'M') + x + ',' + y;
    }

    function lineto(x, y, local) {
        if (x.x !== undefined && x.y !== undefined) {
            local = y;
            y = x.y;
            x = x.x;
        } else if (x.length && x.length >= 2) {
            local = y;
            y = x[1];
            x = x[0];
        }
        return (local ? 'l' : 'L') + x + ',' + y;
    }

    function curveto(x1, y1, x2, y2, x, y, local) {
        if (x1.x !== undefined && x1.y !== undefined) {
            local = y;
            y = x;
            x = y2;
            y2 = x2;
            x2 = y1;
            y1 = x1.y;
            x1 = x1.x;
        } else if (x1.length && x1.length >= 2) {
            local = y;
            y = x;
            x = y2;
            y2 = x2;
            x2 = y1;
            y1 = x1[1];
            x1 = x1[0];
        }
        if (x2.x !== undefined && x2.y !== undefined) {
            local = y;
            y = x;
            x = y2;
            y2 = x2.y;
            x2 = x2.x;
        } else if (x2.length && x2.length >= 2) {
            local = y;
            y = x;
            x = y2;
            y2 = x2[1];
            x2 = x2[0];
        }
        if (x.x !== undefined && x.y !== undefined) {
            local = y;
            y = x.y;
            x = x.x;
        } else if (x.length && x.length >= 2) {
            local = y;
            y = x[1];
            x = x[0];
        }
        return (local ? 'c' : 'C') + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x + ',' + y;
    }

    function add(v1, v2) {
        if (v1.x !== undefined && v1.y !== undefined) {
            v1 = [v1.x, v1.y];
        }
        if (v2.x !== undefined && v2.y !== undefined) {
            v2 = [v2.x, v2.y];
        }
        return [v1[0] + v2[0], v1[1] + v2[1]];
    }

    function avg(v1, v2) {
        if (v1.x !== undefined && v1.y !== undefined) {
            v1 = [v1.x, v1.y];
        }
        if (v2.x !== undefined && v2.y !== undefined) {
            v2 = [v2.x, v2.y];
        }
        return [(v1[0] + v2[0]) / 2, (v1[1] + v2[1]) / 2];
    }

    function sub(v1, v2) {
        if (v1.x !== undefined && v1.y !== undefined) {
            v1 = [v1.x, v1.y];
        }
        if (v2.x !== undefined && v2.y !== undefined) {
            v2 = [v2.x, v2.y];
        }
        return [v1[0] - v2[0], v1[1] - v2[1]];
    }

    function rectangle(x, y, w, h) {
        return x + ' ' + y + ' ' + w + ' ' + h;
    }

    function point(x, y) {
        if (x.x !== undefined && x.y !== undefined) {
            return [x.x, x.y];
        } else if (x[0] !== undefined && x[1] !== undefined) {
            return [x[0], x[1]];
        } else {
            return [x, y];
        }
    }

    var d3 = window.d3;

    // define graphcreator object
    var GraphCreator = function(svg, nodes, edges, inputs, outputs) {
        var thisGraph = this;

        thisGraph.function = {
            name: 'New Function',
            id: '',
            nodes: nodes || [],
            edges: edges || [],
            inputs: inputs || [],
            outputs: outputs || []
        };

        thisGraph.idct = 0;

        thisGraph.nodes = nodes || [];
        thisGraph.edges = edges || [];

        thisGraph.inputs = inputs || [];
        thisGraph.outputs = outputs || [];

        thisGraph.state = {
            selectedNode: null,
            selectedEdge: null,
            mouseDownNode: null,
            mouseDownLink: null,
            justDragged: false,
            justScaleTransGraph: false,
            lastKeyDown: -1,
            pinDrag: false,
            selectedText: null
        };

        // define arrow markers for graph links
        var defs = svg.append('svg:defs');
        defs.append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', rectangle(0, -5, 10, 10))
            .attr('refX', thisGraph.consts.pinSize / 2 + 3)
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', moveto(0, -5) + lineto(10, 0) + lineto(0, 5));

        // define arrow markers for leading arrow
        defs.append('svg:marker')
            .attr('id', 'mark-end-arrow')
            .attr('viewBox', rectangle(0, -5, 10, 10))
            .attr('refX', 7)
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', moveto(0, -5) + lineto(10, 0) + lineto(0, 5));

        thisGraph.svg = svg;
        thisGraph.svgG = svg.append('g')
            .attr('class', thisGraph.consts.graphClass);
        var svgG = thisGraph.svgG;

        // displayed when pinDrag between nodes
        thisGraph.dragLine = svgG.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', moveto(0, 0) + lineto(0, 0))
            .style('marker-end', 'url(#mark-end-arrow)');

        // svg nodes and edges
        thisGraph.edgeElements = svgG.append('g').selectAll('g');
        thisGraph.nodeElements = svgG.append('g').selectAll('g');

        thisGraph.inputGroup = svgG.append('g');
        thisGraph.outputGroup = svgG.append('g');

        thisGraph.inputElements = thisGraph.inputGroup
            .classed('inputs', true)
            .on('mousedown', function () { d3.event.stopPropagation(); })
            .selectAll('g');
        thisGraph.outputElements = thisGraph.outputGroup
            .classed('outputs', true)
            .attr('transform', translate(1000, 0))
            .selectAll('g');

        thisGraph.drag = d3.behavior.drag()
            .on('drag', function(d, i) {
                thisGraph.state.justDragged = true;
                thisGraph.dragmove.call(thisGraph, d, i);
            })
            .on('dragend', function() {
                // todo check if edge-mode is selected
            });

        // listen for key events
        d3.select(window)
            .on('keydown', function() {
                thisGraph.svgKeyDown.call(thisGraph);
            })
            .on('keyup', function() {
                thisGraph.svgKeyUp.call(thisGraph);
            });
        svg
            .on('mousedown', function(d) {
                thisGraph.svgMouseDown.call(thisGraph, d);
            })
            .on('mouseup', function(d) {
                thisGraph.svgMouseUp.call(thisGraph, d);
            });

        // listen for pinDrag
        var dragSvg = d3.behavior.zoom()
            .on('zoom', function() {
                if (d3.event.sourceEvent.shiftKey) {
                    // TODO  the internal d3 state is still changing
                    return false;
                } else {
                    thisGraph.zoomed.call(thisGraph);
                }
                return true;
            })
            .on('zoomstart', function() {
                var ael = d3.select('#' + thisGraph.consts.activeEditId).node();
                if (ael) {
                    ael.blur();
                }
                if (!d3.event.sourceEvent.shiftKey) {
                    d3.select('body').style('cursor', 'move');
                }
            })
            .on('zoomend', function() {
                d3.select('body').style('cursor', 'auto');
            });

        svg.call(dragSvg).on('dblclick.zoom', null);

        // listen for resize
        window.onresize = function() {
            thisGraph.updateWindow(svg);
        };
    };

    GraphCreator.prototype.setIdCt = function(idct){
        this.idct = idct;
    };

    GraphCreator.prototype.consts =  {
        selectedClass: 'selected',
        connectClass: 'connect-node',
        graphClass: 'graph',
        activeEditId: 'active-editing',
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ENTER_KEY: 13,
        nodeWidth: 100,
        nodeHeight: 100,
        nodeCornerRadius: 8,
        nodeMargin: 20,
        pinSize: 16,
        pinSpacing: 24
    };

    /* PROTOTYPE FUNCTIONS */

    GraphCreator.prototype.dragmove = function(d, i) {
        var thisGraph = this,
            consts = thisGraph.consts,
            state = thisGraph.state;
        if (thisGraph.state.pinDrag) {
            var sourcePos = d.outputs
                ? add(d, [consts.nodeWidth / 2, (state.mouseDownPin - (d.outputs.length - 1) / 2) * consts.pinSpacing])
                : [0, -25 * (thisGraph.inputs.length - 1) + i * 50];
            var targetPos = d3.mouse(thisGraph.svgG.node());
            var ctrlPt1 = avg(sourcePos, targetPos);
            ctrlPt1[1] = sourcePos[1];
            var ctrlPt2 = avg(sourcePos, targetPos);
            ctrlPt2[1] = targetPos[1];
            ctrlPt1[0] = sourcePos[0] + Math.max(
                Math.abs(sourcePos[1] - targetPos[1]),
                Math.abs(ctrlPt1[0] - sourcePos[0]));
            ctrlPt2[0] = targetPos[0] - Math.max(
                Math.abs(sourcePos[1] - targetPos[1]),
                Math.abs(ctrlPt2[0] - targetPos[0]));
            thisGraph.dragLine.attr('d', moveto(sourcePos) + curveto(ctrlPt1, ctrlPt2, targetPos));
        } else {
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            thisGraph.updateGraph();
        }
    };

    /* select all text in element: taken from http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element */
    GraphCreator.prototype.selectElementContents = function(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };


    /* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
    GraphCreator.prototype.insertTitleLinebreaks = function (gEl, title) {
        var words = title.split(/\s+/g),
            nwords = words.length;
        var el = gEl.append('text')
            .attr('text-anchor','middle')
            .attr('dy', '-' + (nwords - 1) * 7.5);

        for (var i = 0; i < words.length; i++) {
            var tspan = el.append('tspan').text(words[i]);
            if (i > 0) {
                tspan.attr('x', 0).attr('dy', '15');
            }
        }
    };


    // remove edges associated with a node
    GraphCreator.prototype.spliceLinksForNode = function(node) {
        var thisGraph = this,
            toSplice = thisGraph.edges.filter(function(l) {
                return (l.sourceNode === node || l.targetNode === node);
            });
        toSplice.map(function(l) {
            thisGraph.edges.splice(thisGraph.edges.indexOf(l), 1);
        });
    };

    GraphCreator.prototype.replaceSelectEdge = function(d3Path, edgeData){
        var thisGraph = this;
        d3Path.classed(thisGraph.consts.selectedClass, true);
        if (thisGraph.state.selectedEdge){
            thisGraph.removeSelectFromEdge();
        }
        thisGraph.state.selectedEdge = edgeData;
    };

    GraphCreator.prototype.replaceSelectNode = function(d3Node, nodeData){
        var thisGraph = this;
        d3Node.classed(this.consts.selectedClass, true);
        if (thisGraph.state.selectedNode){
            thisGraph.removeSelectFromNode();
        }
        thisGraph.state.selectedNode = nodeData;
    };

    GraphCreator.prototype.removeSelectFromNode = function(){
        var thisGraph = this;
        thisGraph.nodeElements.filter(function(cd) { return cd.id === thisGraph.state.selectedNode.id; })
            .classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedNode = null;
    };

    GraphCreator.prototype.removeSelectFromEdge = function(){
        var thisGraph = this;
        thisGraph.edgeElements.filter(function(cd){
            return cd === thisGraph.state.selectedEdge;
        }).classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedEdge = null;
    };

    GraphCreator.prototype.pathMouseDown = function(d3path, d) {
        var thisGraph = this,
            state = thisGraph.state;
        d3.event.stopPropagation();
        state.mouseDownLink = d;

        if (state.selectedNode) {
            thisGraph.removeSelectFromNode();
        }

        var prevEdge = state.selectedEdge;
        if (!prevEdge || prevEdge !== d) {
            thisGraph.replaceSelectEdge(d3path, d);
        } else {
            thisGraph.removeSelectFromEdge();
        }
    };

    // mousedown on node
    GraphCreator.prototype.nodeMouseDown = function(d3node, d) {
        var thisGraph = this,
            state = thisGraph.state;
        state.mouseDownNode = d;
    };

    // mousedown on pin
    GraphCreator.prototype.pinMouseDown = function(d3node, node, pin) {
        var thisGraph = this,
            consts = thisGraph.consts,
            state = thisGraph.state;
        //d3.event.stopPropagation();
        state.mouseDownNode = node;
        state.mouseDownPin = pin;
        state.pinDrag = true;
        var sourcePos = node
            ? add(node, [consts.nodeWidth / 2, (pin - (node.outputs.length - 1) / 2) * consts.pinSpacing])
            : [0, pin * 50];
        thisGraph.dragLine.classed('hidden', false)
            .attr('d', moveto(sourcePos) + lineto(sourcePos));
    };

    GraphCreator.prototype.pinMouseUp = function(d3node, node, pin) {
        var thisGraph = this,
            state = thisGraph.state,
            consts = thisGraph.consts;
        // reset the states
        if (!state.pinDrag) {
            return;
        }
        state.pinDrag = false;
        d3node.classed(consts.connectClass, false);

        var mouseDownNode = state.mouseDownNode;
        var mouseDownPin = state.mouseDownPin;

        thisGraph.dragLine.classed('hidden', true);
        if (!node || mouseDownNode !== node) {
            // we're in a different node: create new edge for mousedown edge and add to graph
            var newEdge = {
                sourceNode: mouseDownNode,
                sourcePin: mouseDownPin,
                targetNode: node,
                targetPin: pin
            };
            var redundantEdges = thisGraph.edgeElements.filter(function(d) {
                return d.sourceNode === newEdge.sourceNode
                    && d.sourcePin === newEdge.sourcePin
                    && d.targetNode === newEdge.targetNode
                    && d.targetPin === newEdge.targetPin;
            });
            var cycleFormed = false;
            if (newEdge.sourceNode && newEdge.targetNode) {
                // Do a BFS to see if target node actually directs to source node.
                var visitedNodes = [];
                var frontierNodes = [];
                frontierNodes.push(newEdge.targetNode);
                while (frontierNodes.length && !cycleFormed) {
                    var currNode = frontierNodes.shift();
                    visitedNodes.push(currNode);
                    var outgoingEdges = thisGraph.edges.filter(function (edge) {
                        return edge.sourceNode === currNode;
                    });
                    for (var i in outgoingEdges) {
                        var edge = outgoingEdges[i];
                        var targetNode = edge.targetNode;
                        if (targetNode === newEdge.sourceNode) {
                            cycleFormed = true;
                            break;
                        }
                        if (targetNode && visitedNodes.indexOf(targetNode) < 0) {
                            frontierNodes.push(targetNode);
                        }
                    }
                }
            }
            if (!redundantEdges[0].length && !cycleFormed) {
                thisGraph.edges = thisGraph.edges.filter(function(d) {
                    return !(d.targetNode === newEdge.targetNode && d.targetPin === newEdge.targetPin);
                });
                thisGraph.edges.push(newEdge);
                thisGraph.updateGraph();
            }
        }

        state.mouseDownNode = null;
    }

    /* place editable text on node in place of svg text */
    GraphCreator.prototype.changeTextOfNode = function(d3node, d) {
        var thisGraph = this,
            consts = thisGraph.consts,
            htmlEl = d3node.node();
        d3node.selectAll('text').remove();
        var nodeBCR = htmlEl.getBoundingClientRect(),
            curScale = nodeBCR.width/consts.nodeWidth*2,
            placePad  =  5*curScale,
            useHW = curScale > 1 ? nodeBCR.width*0.71 : consts.nodeWidth*0.71;
        // replace with editableconent text
        var d3txt = thisGraph.svg.selectAll('foreignObject')
            .data([d])
            .enter()
            .append('foreignObject')
            .attr('x', nodeBCR.left + placePad)
            .attr('y', nodeBCR.top + placePad)
            .attr('height', 2*useHW)
            .attr('width', useHW)
            .append('xhtml:p')
            .attr('id', consts.activeEditId)
            .attr('contentEditable', 'true')
            .attr('font-family', 'Josefin Sans')
            .text(d.title)
            .on('mousedown', function(d) {
                d3.event.stopPropagation();
            })
            .on('keydown', function(d) {
                d3.event.stopPropagation();
                if (d3.event.keyCode == consts.ENTER_KEY && !d3.event.shiftKey){
                    this.blur();
                }
            })
            .on('blur', function(d) {
                d.title = this.textContent;
                thisGraph.insertTitleLinebreaks(d3node, d.title);
                d3.select(this.parentElement).remove();
                $.getJSON('/get_function/', { name: d.title }).success(function (result) {
                    if (result.success) {
                        var fn = result.function;
                        console.log('Got function', fn);
                        d.inputs = fn.input_types;
                        d.outputs = fn.output_types;
                        d.functionId = fn.id;
                        thisGraph.updateGraph();
                    }
                });
            });
        return d3txt;
    };

    // mouseup on nodes
    GraphCreator.prototype.nodeMouseUp = function(d3node, d) {
        var thisGraph = this,
            state = thisGraph.state,
            consts = thisGraph.consts;
        // reset the states
        state.pinDrag = false;
        d3node.classed(consts.connectClass, false);

        var mouseDownNode = state.mouseDownNode;

        if (!mouseDownNode) return;

        thisGraph.dragLine.classed('hidden', true);

        if (mouseDownNode !== d) {
            // we're in a different node: create new edge for mousedown edge and add to graph
            var newEdge = { source: mouseDownNode, target: d };
            var filtRes = thisGraph.edgeElements.filter(function(d){
                if (d.sourceNode === newEdge.targetNode && d.targetNode === newEdge.sourceNode) {
                    thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
                }
                return d.sourceNode === newEdge.sourceNode && d.targetNode === newEdge.targetNode;
            });
            if (!filtRes[0].length) {
                thisGraph.edges.push(newEdge);
                thisGraph.updateGraph();
            }
        } else {
            // we're in the same node
            if (state.justDragged) {
                // dragged, not clicked
                state.justDragged = false;
            } else {
                // clicked, not dragged
                if (d3.event.shiftKey) {
                    // shift-clicked node: edit text content
                    var d3txt = thisGraph.changeTextOfNode(d3node, d);
                    var txtNode = d3txt.node();
                    thisGraph.selectElementContents(txtNode);
                    txtNode.focus();
                } else {
                    if (state.selectedEdge) {
                        thisGraph.removeSelectFromEdge();
                    }
                    var prevNode = state.selectedNode;

                    if (!prevNode || prevNode.id !== d.id) {
                        thisGraph.replaceSelectNode(d3node, d);
                    } else {
                        thisGraph.removeSelectFromNode();
                    }
                }
            }
        }
        state.mouseDownNode = null;
    }; // end of circles mouseup

    // mousedown on main svg
    GraphCreator.prototype.svgMouseDown = function() {
        this.state.graphMouseDown = true;
    };

    // mouseup on main svg
    GraphCreator.prototype.svgMouseUp = function() {
        var thisGraph = this,
            state = thisGraph.state;

        if (state.justScaleTransGraph) {
            // dragged not clicked
            state.justScaleTransGraph = false;
        } else if (state.graphMouseDown && d3.event.shiftKey){
            // clicked not dragged from svg
            var xycoords = d3.mouse(thisGraph.svgG.node()),
                d = {
                    id: thisGraph.idct++,
                    title: 'new concept',
                    x: xycoords[0],
                    y: xycoords[1],
                    inputs: [
                        1
                    ],
                    outputs: [
                        1
                    ]
                };
            thisGraph.nodes.push(d);
            thisGraph.updateGraph();
            // make title of text immediently editable
            var d3txt = thisGraph.changeTextOfNode(thisGraph.nodeElements.filter(function(dval) {
                return dval.id === d.id;
            }), d),
                txtNode = d3txt.node();
            thisGraph.selectElementContents(txtNode);
            txtNode.focus();
        } else if (state.pinDrag) {
            // dragged from node
            state.pinDrag = false;
            thisGraph.dragLine.classed('hidden', true);
        }
        state.graphMouseDown = false;
    };

    // keydown on main svg
    GraphCreator.prototype.svgKeyDown = function() {
        var thisGraph = this,
            state = thisGraph.state,
            consts = thisGraph.consts;
        // make sure repeated key presses don't register for each keydown
        if(state.lastKeyDown !== -1) return;

        state.lastKeyDown = d3.event.keyCode;
        var selectedNode = state.selectedNode,
            selectedEdge = state.selectedEdge;

        switch(d3.event.keyCode) {
        case consts.BACKSPACE_KEY:
        case consts.DELETE_KEY:
            d3.event.preventDefault();
            if (selectedNode){
                thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
                thisGraph.spliceLinksForNode(selectedNode);
                state.selectedNode = null;
                thisGraph.updateGraph();
            } else if (selectedEdge){
                thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);
                state.selectedEdge = null;
                thisGraph.updateGraph();
            }
            break;
        }
    };

    GraphCreator.prototype.svgKeyUp = function() {
        this.state.lastKeyDown = -1;
    };

    // call to propagate changes to graph
    GraphCreator.prototype.updateGraph = function() {
        var thisGraph = this,
            consts = thisGraph.consts,
            state = thisGraph.state;

        thisGraph.edgeElements = thisGraph.edgeElements.data(thisGraph.edges, function(d) {
            return (d.sourceNode ? d.sourceNode.id : '-') + '/' + d.sourcePin + '+' + (d.targetNode ? d.targetNode.id : '-') + '/' + d.targetPin;
        });
        var paths = thisGraph.edgeElements;
        // update existing paths
        var pathFn = function(d) {
            var sourcePos = d.sourceNode
                ? add(
                    d.sourceNode,
                    [consts.nodeWidth / 2, (d.sourcePin - (d.sourceNode.outputs.length - 1) / 2) * consts.pinSpacing]
                )
                : [0, -25 * (thisGraph.inputs.length - 1) + 50 * d.sourcePin];
            var targetPos = d.targetNode
                ? add(
                    d.targetNode,
                    [-consts.nodeWidth / 2, (d.targetPin - (d.targetNode.inputs.length - 1) / 2) * consts.pinSpacing]
                )
                : [1000, -25 * (thisGraph.outputs.length - 1) + 50 * d.targetPin];
            var ctrlPt1 = avg(sourcePos, targetPos);
            ctrlPt1[1] = sourcePos[1];
            var ctrlPt2 = avg(sourcePos, targetPos);
            ctrlPt2[1] = targetPos[1];
            ctrlPt1[0] = sourcePos[0] + Math.max(
                Math.abs(sourcePos[1] - targetPos[1]),
                Math.abs(ctrlPt1[0] - sourcePos[0]));
            ctrlPt2[0] = targetPos[0] - Math.max(
                Math.abs(sourcePos[1] - targetPos[1]),
                Math.abs(ctrlPt2[0] - targetPos[0]));
            return moveto(sourcePos) + curveto(ctrlPt1, ctrlPt2, targetPos);
        };
        paths.style('marker-end', 'url(#end-arrow)')
            .classed(consts.selectedClass, function(d) { return d === state.selectedEdge; })
            .attr('d', pathFn);

        // add new paths
        paths.enter()
            .append('path')
            .style('marker-end', 'url(#end-arrow)')
            .classed('link', true)
            .attr('d', pathFn)
            .on('mousedown', function(d) {
                thisGraph.pathMouseDown.call(thisGraph, d3.select(this), d);
            })
            .on('mouseup', function(d) {
                state.mouseDownLink = null;
            });

        // remove old links
        paths.exit()
            .remove();

        // Update existing nodes.
        thisGraph.nodeElements = thisGraph.nodeElements.data(thisGraph.nodes, function(d) { return d.id; });
        thisGraph.nodeElements.attr('transform', function(d) { return translate(d); });

        // Add new nodes.
        var newNodes = thisGraph.nodeElements.enter()
            .append('g')
            .classed('node', true);

        newNodes
            .attr('transform', function(d) { return translate(d); })
            .on('mouseover', function(d) {
                if (state.pinDrag) {
                    d3.select(this).classed(consts.connectClass, true);
                }
            })
            .on('mouseout', function(d) {
                d3.select(this).classed(consts.connectClass, false);
            })
            .on('mousedown', function(d) {
                d3.event.stopPropagation();
                thisGraph.nodeMouseDown.call(thisGraph, d3.select(this), d);
            })
            .on('mouseup', function(d) {
                thisGraph.nodeMouseUp.call(thisGraph, d3.select(this), d);
            })
            .call(thisGraph.drag);

        newNodes.append('rect')
            .classed('node-shape', true)
            .attr('width', consts.nodeWidth)
            .attr('rx', consts.nodeCornerRadius)
            .attr('ry', consts.nodeCornerRadius)
            .attr('fill', '#ddd')
            .attr('stroke', '#000')
            .attr('stroke-width', 2);

        newNodes.append('g')
            .classed('node-inputs', true)
            .selectAll()
            .data(function (d) { return d.inputs; });

        newNodes.append('g')
            .classed('node-outputs', true)
            .selectAll()
            .data(function (d) { return d.outputs; });

        var inputs = thisGraph.nodeElements.selectAll('.node-inputs').selectAll('circle')
            .data(function (d) { return d.inputs; });

        inputs.enter()
            .append('circle')
            .attr('r', consts.pinSize / 2)
            .attr('transform', function (d, i) {
                return translate(0, i * consts.pinSpacing);
            })
            .classed('pin', true)
            .on('mouseup', function(d, i) {
                thisGraph.pinMouseUp.call(thisGraph, d3.select(this), d3.select(this.parentNode).datum(), i);
            });
        inputs.exit()
            .remove();

        var outputs = thisGraph.nodeElements.selectAll('.node-outputs').selectAll('circle')
            .data(function (d) {
                return d.outputs;
            });

        outputs.enter()
            .append('circle')
            .attr('r', consts.pinSize / 2)
            .attr('transform', function (d, i) {
                return translate(0, i * consts.pinSpacing);
            })
            .classed('pin', true)
            .on('mousedown', function (d, i) {
                thisGraph.pinMouseDown.call(thisGraph, d3.select(this), d3.select(this.parentNode).datum(), i);
            });
        outputs.exit()
            .remove();

        svg.selectAll('.node').selectAll('.node-shape')
            .attr('height', function (d) {
                return Math.max(d.inputs.length, d.outputs.length) * consts.pinSpacing + 2 * consts.nodeMargin;
            })
            .attr('transform', function(d) {
                return translate(
                    -consts.nodeWidth / 2,
                    -(Math.max(d.inputs.length, d.outputs.length) * consts.pinSpacing + 2 * consts.nodeMargin) / 2);
            });

        svg.selectAll('.node').selectAll('.node-inputs').attr('transform', function (d) {
            return translate(-consts.nodeWidth / 2, -(d.inputs.length - 1) * consts.pinSpacing / 2);
        });

        svg.selectAll('.node').selectAll('.node-outputs').attr('transform', function (d) {
            return translate(consts.nodeWidth / 2, -(d.outputs.length - 1) * consts.pinSpacing / 2);
        });

        // Remove paths that from or to non-existent nodes.
        thisGraph.edgeElements
            .filter(function (d) {
                var sourcePins = d.sourceNode ? d.sourceNode.outputs : thisGraph.inputs;
                var targetPins = d.targetNode ? d.targetNode.inputs : thisGraph.outputs;
                return d.sourcePin >= sourcePins.length || d.targetPin >= targetPins.length;
            })
            .remove();

        newNodes.each(function(d) {
            thisGraph.insertTitleLinebreaks(d3.select(this), d.title);
        });

        // Remove old nodes.
        thisGraph.nodeElements.exit().remove();

        // Update existing inputs.
        thisGraph.inputElements = thisGraph.inputElements.data(thisGraph.inputs);

        // Add new inputs.
        var newInputs = thisGraph.inputElements.enter()
            .append('g')
            .classed('input', true);

        newInputs
            .attr('transform', function (d, i) { return translate(0, 50 * i); })
            .call(thisGraph.drag)
            .append('circle')
            .attr('r', 20)
            .on('mousedown', function (d, i) {
                thisGraph.pinMouseDown.call(thisGraph, d3.select(this), null, i);
            });

        var pinAddDeleteButtonRadius = 12;

        var inputDeleteButtons = newInputs.append('g')
            .attr('transform', translate(-36, 0))
            .classed('pin-delete', true)
            .on('mousedown', function (d, i) {
                thisGraph.edges = thisGraph.edges.filter(function (edge) {
                    if (edge.sourceNode) return true;
                    if (edge.sourcePin === i) return false;
                    if (edge.sourcePin > i) edge.sourcePin--;
                    return true;
                });
                thisGraph.inputs.splice(i, 1);
                thisGraph.updateGraph();
            });

        inputDeleteButtons.append('circle')
            .attr('r', pinAddDeleteButtonRadius);

        inputDeleteButtons.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('-');

        var inputAddButtons = newInputs.append('g')
            .attr('transform', translate(-24, -25))
            .classed('pin-add', true)
            .on('mousedown', function (d, i) {
                thisGraph.inputs.push(1);
                thisGraph.edges.forEach(function (edge) {
                    if (edge.sourceNode) return;
                    if (edge.sourcePin >= i) edge.sourcePin++;
                });
                thisGraph.updateGraph();
                thisGraph.pinMouseDown.call(thisGraph, null, null, i);
            });

        inputAddButtons.append('circle')
            .attr('r', pinAddDeleteButtonRadius);

        inputAddButtons.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('+');

        thisGraph.inputElements.exit().remove();

        // Update existing outputs.
        thisGraph.outputElements = thisGraph.outputElements.data(thisGraph.outputs);

        // Add new outputs.
        var newOutputs = thisGraph.outputElements.enter()
            .append('g')
            .classed('output', true);

        newOutputs
            .attr('transform', function (d, i) { return translate(0, 50 * i); })
            .append('circle')
            .attr('r', 20)
            .on('mouseup', function (d, i) {
                thisGraph.pinMouseUp.call(thisGraph, d3.select(this), null, i);
            });

        var outputDeleteButtons = newOutputs.append('g')
            .attr('transform', translate(36, 0))
            .classed('pin-delete', true)
            .on('mousedown', function (d, i) {
                thisGraph.edges = thisGraph.edges.filter(function (edge) {
                    if (edge.targetNode) return true;
                    if (edge.targetPin === i) return false;
                    if (edge.targetPin > i) edge.targetPin--;
                    return true;
                });
                thisGraph.outputs.splice(i, 1);
                thisGraph.updateGraph();
            });

        outputDeleteButtons.append('circle')
            .attr('r', pinAddDeleteButtonRadius);

        outputDeleteButtons.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('-');

        var outputAddButtons = newOutputs.append('g')
            .attr('transform', translate(24, -25))
            .classed('pin-add', true)
            .on('mousedown', function (d, i) {
                thisGraph.outputs.push(1);
                thisGraph.edges.forEach(function (edge) {
                    if (edge.targetNode) return;
                    if (edge.targetPin >= i) edge.targetPin++;
                });
                thisGraph.updateGraph();
            });

        outputAddButtons.append('circle')
            .attr('r', pinAddDeleteButtonRadius)

        outputAddButtons.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('+');

        thisGraph.outputElements.exit().remove();

        // Reposition input and output groups
        thisGraph.inputGroup.attr('transform', translate(0, -25 * (thisGraph.inputs.length - 1)));
        thisGraph.outputGroup.attr('transform', translate(0, -25 * (thisGraph.outputs.length - 1)));

        // Update displayed function name.
        $('.function-name').text(graph.function.name);
    };

    GraphCreator.prototype.zoomed = function() {
        this.state.justScaleTransGraph = true;
        d3.select('.' + this.consts.graphClass)
            .attr('transform', translate(d3.event.translate) + scale(d3.event.scale));
    };

    GraphCreator.prototype.updateWindow = function(svg) {
        var docEl = document.documentElement,
            bodyEl = document.getElementsByTagName('body')[0];
        var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
        var y = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;
        svg.attr('width', x).attr('height', y);
    };

    /**** MAIN ****/

    var docEl = document.documentElement,
        bodyEl = document.getElementsByTagName('body')[0];

    var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
        height = window.innerHeight || docEl.clientHeight|| bodyEl.clientHeight;

    var xLoc = width/2 - 25,
        yLoc = 100;

    // initial node data
    var nodes = [
        {
            title: 'new concept',
            id: 0,
            x: xLoc + 300,
            y: yLoc,
            functionId: 'asdf',
            inputs: [
                1,
                1,
                1,
                1,
                1,
                1
            ],
            outputs: [
                1,
                1
            ]
        },
        {
            title: 'new concept',
            id: 1,
            x: xLoc,
            y: yLoc,
            functionId: '1234',
            inputs: [
                1,
                1
            ],
            outputs: [
                1,
                1,
                1,
                1,
                1,
                1
            ]
        }
    ];
    var edges = [
        {
            sourceNode: nodes[1],
            sourcePin: 5,
            targetNode: nodes[0],
            targetPin: 3
        },
        {
            sourceNode: nodes[1],
            sourcePin: 4,
            targetNode: nodes[0],
            targetPin: 2
        },
        {
            sourceNode: nodes[1],
            sourcePin: 2,
            targetNode: nodes[0],
            targetPin: 4
        },
        {
            sourcePin: 0,
            targetNode: nodes[1],
            targetPin: 0
        }
    ];

    var inputs = [
        { x: 0, y: 0 },
        { x: 0, y: 100 }
    ];

    var outputs = [
        { x: 400, y: 0 },
        { x: 400, y: 50 },
        { x: 400, y: 100 },
        { x: 400, y: 150 },
        { x: 400, y: 200 },
        { x: 400, y: 250 }
    ];

    /** MAIN SVG **/
    //var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
    var svg = d3.select('body').append('svg');
    var graph = new GraphCreator(svg, nodes, edges, inputs, outputs);
    graph.setIdCt(2);
    graph.updateGraph();
    graph.updateWindow(svg);

    var save = function () {
        console.log('saving... done');
    };

    $('.save-btn').click(save);

    $.fn.onSubmit = function(func) {
        this.bind('keypress', fn = function(e) {
            if (e.keyCode == 13) {
                func.apply(this, [$(this).val()]);
            }
        });
        this.blur(function () {
            func.apply(this, [$(this).val()]);
        });
        return this;
    };

    var editFunctionName = function () {
        var nameLabel = $('.function-name');
        var nameTextbox = $('<input type="text" class="function-name" value="' + graph.function.name + '"></input>')
            .onSubmit(function (value) {
                graph.function.name = value;
                $(this).replaceWith(nameLabel);
                nameLabel
                    .text(value)
                    .click(editFunctionName);
            });
        nameLabel.replaceWith(nameTextbox);
        nameTextbox.focus().select();
    };

    $('.function-name').click(editFunctionName);

    $(document).keydown(function(e) {
        if ((e.which == '115' || e.which == '83' ) && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            save();
            return false;
        }
        return true;
    });
});
