(function () {
    function _pointFromArgs(args) {
        return point.apply(window, args);
    }

    function _pointsFromArgs(args, count) {
        var pts = [];
        for (var i = 0, j = 0; i < count; i++, j++) {
            if (args[j].x !== undefined && args[j].y !== undefined) {
                pts.push([args[j].x, args[j].y]);
            }
            else if (args[j][0] !== undefined && args[j][1] !== undefined) {
                pts.push([args[j][0], args[j][1]]);
            }
            else {
                pts.push([args[j], args[j + 1]]);
                ++j;
            }
        }
        return pts;
    }

    function _localFromArgs(args, count) {
        if (count === void 0) { count = 1; }
        var pts = [];
        for (var i = 0, j = 0; i < count; i++, j++) {
            if (args[j].x !== undefined && args[j].y !== undefined) {
                pts.push([args[j].x, args[j].y]);
            }
            else if (args[j][0] !== undefined && args[j][1] !== undefined) {
                pts.push([args[j][0], args[j][1]]);
            }
            else {
                pts.push([args[j], args[j + 1]]);
                ++j;
            }
        }
        return pts[j] ? true : false;
    }

    function translate() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var pt = _pointFromArgs(args);
        return 'translate(' + pt[0] + (pt[1] ? (', ' + pt[1]) : '') + ')';
    }

    function rotate(a) {
        return 'rotate(' + a + ')';
    }

    function scale() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var pt = _pointFromArgs(args);
        return 'scale(' + pt[0] + (pt[1] ? (', ' + pt[1]) : '') + ')';
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

    function moveto() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var pt = _pointFromArgs(args);
        var local = _localFromArgs(args);
        return (local ? 'm' : 'M') + pt[0] + ',' + pt[1];
    }

    function lineto() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var pt = _pointFromArgs(args);
        var local = _localFromArgs(args);
        return (local ? 'l' : 'L') + pt[0] + ',' + pt[1];
    }

    function curveto() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var pts = _pointsFromArgs(args, 3);
        var local = _localFromArgs(args, 3);
        return (local ? 'c' : 'C') + pts[0][0] + ',' + pts[0][1] + ' ' + pts[1][0] + ',' + pts[1][1] + ' ' + pts[2][0] + ',' + pts[2][1];
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

    function point() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args[0].x !== undefined && args[0].y !== undefined) {
            return [args[0].x, args[0].y];
        }
        else if (args[0][0] !== undefined && args[0][1] !== undefined) {
            return [args[0][0], args[0][1]];
        }
        else {
            return [args[0], args[1]];
        }
    }

    function topRoundedRect(x, y, width, height, radius) {
        return 'M' + (x + width / 2) + ',' + (y + height) + 'h' + -width + 'v' + (radius - height) + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + -radius + 'h' + (width - 2 * radius) + 'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + radius + 'v' + (height - radius) + 'z';
    }

    function dist(v1, v2) {
        v1 = point(v1);
        v2 = point(v2);
        return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]));
    }

    function screenPosition(selector) {
        var mat = d3.select(selector)[0][0].getScreenCTM();
        return [mat.e, mat.f];
    }

    function position(selector, offset) {
        var mat;
        if (selector.getCTM) {
            mat = selector.getCTM();
        }
        else {
            var element = d3.select(selector)[0][0];
            if (element.getCTM) {
                mat = element.getCTM();
            }
            else {
                mat = element[0].getCTM();
            }
        }
        var pt = offset ? [mat.e - offset[0], mat.f - offset[1]] : [mat.e, mat.f];
        return pt;
    }

    var consts = {
        selectedClass: 'selected',
        connectClass: 'connect-node',
        graphClass: 'graph',
        activeEditId: 'active-editing',
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ENTER_KEY: 13,
        ESCAPE_KEY: 27,
        nodeWidth: 180,
        nodeHeight: 100,
        nodeLabelHeight: 40,
        nodeCornerRadius: 20,
        nodeMargin: 40,
        pinSize: 16,
        pinSpacing: 24
    };

    // define graphcreator object
    var GraphCreator = (function () {
        function GraphCreator(svg, nodes, edges, inputs, outputs) {
            var self = this;
            self.state = {};
            self.searchResults = [];
            this.setIdCt = function (idct) { return self.idct = idct; };
            this.dragmove = function (d) {
                var state = self.state, func = self.func, svgG = self.svgG;
                if (state.pinDrag) {
                    var sourcePos = (d.func && d.func.outputs) ? add(d, [consts.nodeWidth / 2, (state.mouseDownPin - (d.func.outputs.length - 1) / 2) * consts.pinSpacing]) : [0, -25 * (func.inputs.length - 1) + state.mouseDownPin * 50];
                    var targetPos = d3.mouse(svgG.node());
                    var ctrlPt1 = avg(sourcePos, targetPos);
                    ctrlPt1[1] = sourcePos[1];
                    var ctrlPt2 = avg(sourcePos, targetPos);
                    ctrlPt2[1] = targetPos[1];
                    ctrlPt1[0] = sourcePos[0] + Math.max(Math.abs(sourcePos[1] - targetPos[1]), Math.abs(ctrlPt1[0] - sourcePos[0]));
                    ctrlPt2[0] = targetPos[0] - Math.max(Math.abs(sourcePos[1] - targetPos[1]), Math.abs(ctrlPt2[0] - targetPos[0]));
                    self.dragLine.attr('d', moveto(sourcePos) + curveto(ctrlPt1, ctrlPt2, targetPos));
                } else {
                    d.x += d3.event.dx;
                    d.y += d3.event.dy;
                    self.updateGraph();
                }
            };
            this.replaceSelectNode = function (d3Node, nodeData) {
                d3Node.classed(consts.selectedClass, true);
                if (self.state.selectedNode) {
                    self.removeSelectFromNode();
                }
                self.state.selectedNode = nodeData;
            };
            this.pinMouseUp = function (d3node, node, pin) {
                var state = self.state, func = self.func;
                // reset the states
                if (!state.pinDrag) {
                    return;
                }
                state.pinDrag = false;
                if (d3node)
                    d3node.classed(consts.connectClass, false);
                var mouseDownNode = state.mouseDownNode;
                var mouseDownPin = state.mouseDownPin;
                self.dragLine.classed('hidden', true);
                if (!node || mouseDownNode !== node) {
                    // we're in a different node: create new edge for mousedown edge and add to graph
                    var newEdge = {
                        sourceNode: mouseDownNode,
                        sourcePin: mouseDownPin,
                        targetNode: node,
                        targetPin: pin
                    };
                    var redundantEdges = self.edgeElements.filter(function (d) {
                        return d.sourceNode === newEdge.sourceNode && d.sourcePin === newEdge.sourcePin && d.targetNode === newEdge.targetNode && d.targetPin === newEdge.targetPin;
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
                            var outgoingEdges = func.edges.filter(function (edge) {
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
                        func.edges = func.edges.filter(function (d) {
                            return !(d.targetNode === newEdge.targetNode && d.targetPin === newEdge.targetPin);
                        });
                        func.edges.push(newEdge);
                        self.updateGraph(true);
                    }
                }
                state.mouseDownNode = null;
            };
            this.createGuid = function () { return ++self.guid; };
            this.nodeMouseUp = function (d3node, d) {
            };
            this.svgMouseDown = function () { return self.state.graphMouseDown = true; };
            this.svgMouseUp = function () {
                var state = self.state, func = self.func;
                if (state.justScaleTransGraph) {
                    // dragged not clicked
                    state.justScaleTransGraph = false;
                }
                else if (state.graphMouseDown && d3.event.shiftKey) {
                    // clicked not dragged from svg
                    var xycoords = d3.mouse(self.svgG.node()), d = {
                        id: self.idct++,
                        func: {
                            id: null,
                            name: '(click here)',
                            inputs: [
                                1
                            ],
                            outputs: [
                                1
                            ]
                        },
                        x: xycoords[0],
                        y: xycoords[1]
                    };
                    func.nodes.push(d);
                    self.updateGraph();
                }
                else if (state.pinDrag) {
                    // dragged from node
                    state.pinDrag = false;
                    self.dragLine.classed('hidden', true);
                }
                state.graphMouseDown = false;
            };
            this.svgKeyDown = function () {
                var state = self.state,
                    func = self.func;
                // make sure repeated key presses don't register for each keydown
                if (state.lastKeyDown !== -1)
                    return;
                state.lastKeyDown = d3.event.keyCode;
                var selectedNode = state.selectedNode, selectedEdge = state.selectedEdge;
                switch (d3.event.keyCode) {
                    case consts.BACKSPACE_KEY:
                    case consts.DELETE_KEY:
                        if (!$('.function-name').is(':focus')) {
                            d3.event.preventDefault();
                            if (selectedNode) {
                                func.nodes.splice(func.nodes.indexOf(selectedNode), 1);
                                self.spliceLinksForNode(selectedNode);
                                state.selectedNode = null;
                                self.updateGraph();
                            }
                            else if (selectedEdge) {
                                func.edges.splice(func.edges.indexOf(selectedEdge), 1);
                                state.selectedEdge = null;
                                self.updateGraph();
                            }
                        }
                        break;
                }
            };
            this.svgKeyUp = function () { return self.state.lastKeyDown = -1; };
            this.updateGraph = function (ioUpdated) {
                if (ioUpdated === void 0) { ioUpdated = false; }
                var svg = self.svg, state = self.state, func = self.func;

                // Update existing nodes.
                self.nodeElements = self.nodeElements.data(func.nodes, function (d) { return d.id; });
                self.nodeElements.attr('transform', function (d) { return translate(d); });
                // Add new nodes.
                var newNodes = self.nodeElements.enter().append('g').classed('node', true);
                newNodes
                    .attr('transform', function (d) { return translate(d); })
                    .on('mouseover', function (d) {
                        if (state.pinDrag) {
                            d3.select(this).classed(consts.connectClass, true);
                        }
                    })
                    .on('mouseout', function (d) {
                        d3.select(this).classed(consts.connectClass, false);
                    })
                    .on('mousedown', function (d) {
                        d3.event.stopPropagation();
                        self.nodeMouseDown.call(this, d3.select(this), d);
                    })
                    .on('mouseup', function (d) {
                        self.nodeMouseUp.call(this, d3.select(this), d);
                    })
                    .call(self.drag);
                var nodeShapes = newNodes.append('rect')
                    .classed('node-shape', true)
                    .attr('width', consts.nodeWidth)
                    .attr('rx', consts.nodeCornerRadius)
                    .attr('ry', consts.nodeCornerRadius);

                // Browser Compatibility is an Exquisite Pain in the Ass
                if (window.chrome) {
                    nodeShapes.style('filter', 'url(#borderGlow)');
                } else {
                    nodeShapes.style('-webkit-filter', 'url(#borderGlow)');
                    nodeShapes.style('-webkit-svg-shadow', '0px 0px 16px #00ffff');
                }

                newNodes.append('g').classed('node-inputs', true).selectAll().data(function (d) { return d.func.inputs; });
                newNodes.append('g').classed('node-outputs', true).selectAll().data(function (d) { return d.func.inputs; });
                var inputs = self.nodeElements
                    .select('.node-inputs')
                    .selectAll('.node-input')
                    .data(function (d) { return d.func.inputs; });

                var newInputs = inputs.enter()
                    .append('g')
                    .classed('pin', true)
                    .classed('node-input', true)
                    .attr('transform', function (d, i) {
                        return translate(0, i * consts.pinSpacing);
                    })
                    .on('mouseup', function (d, i) {
                        self.pinMouseUp.call(this, d3.select(this), d3.select(this.parentNode).datum(), i);
                    });

                newInputs
                    .append('circle')
                    .attr('r', consts.pinSize / 2);

                var newValueIndicators = newInputs
                    .append('g')
                    .classed('pin-value', true)
                    .attr('transform', translate(-consts.pinSize / 2, 0))
                    .on('click', function(d, i, j) {
                        $('#valueModal').modal('show');
                        self.editNodeIndex = j;
                        self.editPinIndex = i;
                    });

                newValueIndicators.append('rect')
                    .attr('width', 50)
                    .attr('height', 20)
                    .attr('x', -55)
                    .attr('y', -10)
                    .attr('rx', 5)
                    .attr('ry', 5);

                inputs.exit().remove();

                var outputs = self.nodeElements
                    .select('.node-outputs')
                    .selectAll('.node-output')
                    .data(function (d) { return d.func.outputs; });

                outputs.enter()
                    .append('g')
                    .classed('pin', true)
                    .classed('node-output', true)
                    .attr('transform', function (d, i) {
                        return translate(0, i * consts.pinSpacing);
                    })
                    .on('mousedown', function (d, i) {
                        self.pinMouseDown.call(self, d3.select(this.parentNode).datum(), i);
                    })
                    .append('circle').attr('r', consts.pinSize / 2);

                outputs.exit().remove();

                svg.selectAll('.node')
                    .selectAll('.node-shape')
                    .attr('height', function (d) {
                        return Math.max(d.func.inputs.length, d.func.outputs.length) * consts.pinSpacing + 2 * consts.nodeMargin;
                    })
                    .attr('transform', function (d) {
                        return translate(-consts.nodeWidth / 2, -(Math.max(d.func.inputs.length, d.func.outputs.length) * consts.pinSpacing + 2 * consts.nodeMargin) / 2);
                    });
                svg.selectAll('.node')
                    .selectAll('.node-inputs').attr('transform', function (d) {
                        return translate(-consts.nodeWidth / 2, -(d.func.inputs.length - 1) * consts.pinSpacing / 2);
                    });
                svg.selectAll('.node')
                    .selectAll('.node-outputs')
                    .attr('transform', function (d) {
                        return translate(consts.nodeWidth / 2, -(d.func.outputs.length - 1) * consts.pinSpacing / 2);
                    });
                // Remove paths that from or to non-existent nodes.
                self.edgeElements
                    .filter(function (d) {
                        var sourcePins = d.sourceNode ? d.sourceNode.func.outputs : func.inputs;
                        var targetPins = d.targetNode ? d.targetNode.func.inputs : func.outputs;
                        return d.sourcePin >= sourcePins.length || d.targetPin >= targetPins.length;
                    })
                    .remove();

                // Add crap to all the new nodes.
                newNodes.each(function (node, i) {
                    var nodeElement = d3.select(this);
                    var header = nodeElement
                        .append('g')
                        .classed('node-header', true);
                    /*header.append('path')
                        .attr('d', topRoundedRect(0, 0, consts.nodeWidth, consts.nodeLabelHeight,
                            consts.nodeCornerRadius));*/
                    var label = header.append('g')
                        .classed('node-label', true)
                        .on('mousedown', function () {
                            d3.event.stopPropagation();
                        })
                        .on('click', function () {
                            d3.select(this).editText({
                                width: consts.nodeWidth,
                                zoom: self.zoom,
                                handlers: {
                                    start: function () {
                                        state.editNode = i;
                                        self.searchResults = [];
                                        self.updateGraph();
                                    },
                                    done: function () {
                                        state.editNode = null;

                                        var fn = self.searchResults[self.selectedSearchResult];
                                        node.func = fn || node.func;
                                        nodeElement.select('.node-function-name').text(node.func.name);
                                        self.updateGraph();
                                    },
                                    update: function (value) {
                                        if (!value) {
                                            self.searchResults = [];
                                            self.updateGraph();
                                            return;
                                        }
                                        $.when($.getJSON('/search/', {q: value})).then(function (data) {
                                            self.searchResults = data.results;
                                            self.selectedSearchResult = 0;
                                            self.updateGraph();
                                            nodeElement.select('.search-result')
                                                .classed('selected', function (d, i) {
                                                    return i === self.selectedSearchResult;
                                                });
                                        });
                                    },
                                    keyDown: function (keyCode) {
                                        if (keyCode === 38) {
                                            self.selectedSearchResult = (((self.selectedSearchResult - 1)
                                                % self.searchResults.length) + self.searchResults.length)
                                                % self.searchResults.length;
                                            nodeElement.selectAll('.search-result')
                                                .classed('selected', function (d, i) {
                                                    return i === self.selectedSearchResult;
                                                });
                                        } else if (keyCode === 40) {
                                            self.selectedSearchResult = (self.selectedSearchResult + 1)
                                                % self.searchResults.length;
                                            nodeElement.selectAll('.search-result')
                                                .classed('selected', function (d, i) {
                                                    return i === self.selectedSearchResult;
                                                });
                                        }
                                    }
                                }
                            });
                        });
                    /*label.append('rect')
                        .attr('x', -(consts.nodeWidth - consts.nodeCornerRadius * 4) / 2)
                        .attr('y', 10)
                        .attr('rx', 10)
                        .attr('ry', 10)
                        .attr('width', consts.nodeWidth - consts.nodeCornerRadius * 4)
                        .attr('height', consts.nodeLabelHeight * 0.5)
                        .style('fill', 'rgba(255, 255, 255, 0)')
                        .style('stroke', 'rgba(255, 255, 255, 255)')
                        .style('stroke-width', 1);*/
                    label.append('text')
                        .attr('transform', translate(0, consts.nodeLabelHeight * 0.5))
                        .classed('node-function-name', true)
                        .attr('w', consts.nodeWidth)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .text(node.func.name);
                    var deleteBtn = header.append('g')
                        .classed('node-delete', true)
                        .attr('transform', function (d, i) {
                            return translate(consts.nodeWidth / 2 - consts.nodeCornerRadius, consts.nodeCornerRadius);
                        })
                        .on('click', function (d) {
                            self.deleteNode.call(self, d.id);
                        });
                    deleteBtn
                        .append('circle')
                        .attr('r', 12);
                    deleteBtn
                        .append('text')
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .html('&times;');

                    header.append('g')
                        .classed('search-results', true)
                        .attr('transform', translate(0, 0));
                });

                self.nodeElements.each(function (node, i) {

                    var nodeElement = d3.select(this);

                    if (i !== self.state.editNode) return;

                    var results = nodeElement.select('.search-results').selectAll('.search-result')
                        .data(self.searchResults, function (d) { return d.name; });

                    var newResults = results.enter()
                        .append('g')
                        .classed('search-result', true)
                        .on('click', function (fn) {
                            node.func = fn || node.func;
                            nodeElement.select('.node-function-name').text(fn.name);
                            self.updateGraph();
                        });

                    results
                        .attr('transform', function (d, i) {
                            return translate(0, 2 * consts.nodeCornerRadius + 20 * i);
                        })
                        .on('mouseover', function(d, i) {
                            self.selectedSearchResult = i;
                            results.classed('selected', function(d, i) {
                                return i === self.selectedSearchResult;
                            });
                        });

                    newResults.append('rect')
                        .attr('x', -consts.nodeWidth / 2 + 15)
                        .attr('width', consts.nodeWidth - 30)
                        .attr('height', 20)
                        .attr('rx', 10)
                        .attr('ry', 10);

                    newResults.append('text')
                        .attr('y', 10)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .text(function (d) { return d.name; });

                    results.exit().remove();
                });

                var editNodeData = self.func.nodes[self.state.editNode];

                var results = d3.select('.search-results').selectAll('.search-result')
                    .data(self.searchResults, function (d) { return d.name; });

                var newResults = results.enter()
                    .append('g')
                    .classed('search-result', true)
                    .attr('transform', function (d, i) {
                        return translate(0, 2 * consts.nodeCornerRadius + 20 * i);
                    });

                newResults.append('rect')
                    .style('fill', 'black')
                    .attr('x', -consts.nodeWidth / 2)
                    .attr('width', consts.nodeWidth)
                    .attr('height', 15);

                newResults
                    .append('text')
                    .attr('y', 7.5)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .text(function (d) { return d.name; });

                var oldResults = results.exit();

                oldResults.remove();

                // Update all the existing nodes.
                self.nodeElements.select('.search-results')
                    .style('visibility', function (d, i) {
                        var state = self.state;
                        return i === state.editNode ? 'visible' : 'hidden';
                    });

                self.nodeElements.select('.node-header')
                    .attr('transform', function (d, i) {
                        return translate(0, -(Math.max(
                            d.func.inputs.length,
                            d.func.outputs.length) * consts.pinSpacing + 2 * consts.nodeMargin) / 2);
                    });

                // Remove old nodes.
                var oldNodes = self.nodeElements.exit();
                oldNodes.selectAll('rect, g')
                    .transition()
                    .style('opacity', 0);
                oldNodes
                    .transition()
                    .attr('transform', function (d, i) { return translate(d) + scale(0.75); })
                    .remove();
                // Inputs
                self.inputElements = self.inputElements.data(func.inputs, function (d) { return d.id; });
                var newInputs = self.inputElements
                    .enter()
                    .insert('g')
                    .classed('input', true)
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.inputs.length - 1) + 50 * i);
                    })
                    .call(self.drag);
                newInputs.append('circle').attr('r', 0).transition().attr('r', 20);
                self.inputElements
                    .on('mousedown', function (d, i) {
                        return self.pinMouseDown.call(self, null, i);
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.inputs.length - 1) + 50 * i);
                    });
                self.inputElements.exit().selectAll('circle').transition().attr('r', 0).remove();
                // Outputs
                self.outputElements = self.outputElements.data(func.outputs, function (d) { return d.id; });
                var newOutputs = self.outputElements
                    .enter()
                    .insert('g')
                    .classed('output', true)
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.outputs.length - 1) + 50 * i);
                    });
                newOutputs.append('circle').attr('r', 0).transition().attr('r', 20);
                self.outputElements
                    .on('mouseup', function (d, i) {
                        self.pinMouseUp.call(self, d3.select(this), null, i);
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.outputs.length - 1) + 50 * i);
                    });
                self.outputElements.exit().selectAll('circle').transition().attr('r', 0).remove();
                // IO add/delete buttons
                var pinAddDeleteButtonRadius = 12;
                self.inputDeleteButtons = self.inputDeleteButtons.data(func.inputs, function (d) { return d.id; });
                var newInputDeleteButtons = self.inputDeleteButtons
                    .enter()
                    .append('g')
                    .classed('pin-add-delete', true)
                    .classed('pin-delete', true)
                    .classed('vanish', true);
                newInputDeleteButtons.append('circle').attr('r', pinAddDeleteButtonRadius);
                newInputDeleteButtons.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .html('&times;');
                self.inputDeleteButtons
                    .on('mousedown', function (d, i) {
                        d3.event.stopPropagation();
                        func.edges = func.edges.filter(function (edge) {
                            if (edge.sourceNode)
                                return true;
                            if (edge.sourcePin === i)
                                return false;
                            if (edge.sourcePin > i)
                                edge.sourcePin--;
                            return true;
                        });
                        func.inputs.splice(i, 1);
                        self.updateGraph(true);
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.inputs.length - 1) + 50 * i);
                    });
                self.inputDeleteButtons.exit().remove();
                var inputAddSpots = func.inputs.concat(['end']);
                self.inputAddButtons = self.inputAddButtons.data(inputAddSpots, function (d) { return d.id; });
                var newInputAddButtons = self.inputAddButtons.enter().append('g')
                    .classed('pin-add-delete', true)
                    .classed('pin-add', true)
                    .classed('vanish', true);
                newInputAddButtons.append('circle').attr('r', pinAddDeleteButtonRadius);
                newInputAddButtons.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .text('+');
                self.inputAddButtons
                    .call(self.drag).on('mousedown', function (d, i) {
                        func.inputs.splice(i, 0, {
                            id: self.createGuid(),
                            types: [3]
                        });
                        func.edges.forEach(function (edge) {
                            if (!edge.sourceNode && edge.sourcePin >= i)
                                edge.sourcePin++;
                        });
                        self.updateGraph(true);
                        self.pinMouseDown.call(self, null, i);
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, 25 * (2 * i - func.inputs.length));
                    });
                self.inputAddButtons.exit().remove();
                self.outputDeleteButtons = self.outputDeleteButtons.data(func.outputs, function (d) { return d.id; });
                var newOutputDeleteButtons = self.outputDeleteButtons.enter().append('g')
                    .classed('pin-add-delete', true)
                    .classed('pin-delete', true)
                    .classed('vanish', true);
                newOutputDeleteButtons.append('circle')
                    .attr('r', pinAddDeleteButtonRadius);
                newOutputDeleteButtons.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .html('&times;');
                self.outputDeleteButtons
                    .on('mousedown', function (d) {
                        var i = func.outputs.indexOf(d);
                        func.edges = func.edges.filter(function (edge) {
                            if (edge.targetNode)
                                return true;
                            if (edge.targetPin === i)
                                return false;
                            if (edge.targetPin > i)
                                edge.targetPin--;
                            return true;
                        });
                        func.outputs.splice(i, 1);
                        self.updateGraph(true);
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.outputs.length - 1) + 50 * i);
                    });
                self.outputDeleteButtons.exit().remove();
                var outputAddSpots = func.outputs.concat([{ id: -1 }]);
                self.outputAddButtons = self.outputAddButtons.data(outputAddSpots, function (d) { return d.id; });
                var newOutputAddButtons = self.outputAddButtons.enter().append('g')
                    .classed('pin-add-delete', true)
                    .classed('pin-add', true)
                    .classed('vanish', true);
                newOutputAddButtons.append('circle')
                    .attr('r', pinAddDeleteButtonRadius);
                newOutputAddButtons.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .text('+');
                self.outputAddButtons
                    .on('mousedown', function (d) {
                        d3.event.stopPropagation();
                        var i = func.outputs.indexOf(d);
                        i = i < 0 ? func.outputs.length : i;
                        func.outputs.splice(i, 0, {
                            id: self.createGuid(),
                            types: [3]
                        });
                        func.edges.forEach(function (edge) {
                            if (edge.targetNode)
                                return;
                            if (edge.targetPin >= i)
                                edge.targetPin++;
                        });
                        self.updateGraph(true);
                    })
                    .on('mouseup', function (d) {
                        var i = func.outputs.indexOf(d);
                        i = i < 0 ? func.outputs.length : i;
                        if (self.state.pinDrag) {
                            func.outputs.splice(i, 0, {
                                id: self.createGuid(),
                                types: [3]
                            });
                            func.edges.forEach(function (edge) {
                                if (edge.targetNode)
                                    return;
                                if (edge.targetPin >= i)
                                    edge.targetPin++;
                            });
                            self.pinMouseUp.call(self, null, null, i);
                        }
                    })
                    .transition()
                    .attr('transform', function (d, i) { return translate(0, 25 * (2 * i - func.outputs.length)); });
                self.outputAddButtons.exit().remove();

                // Remove edges to pins that no longer exist.
                var originalNumEdges = func.edges.length;
                func.edges = func.edges.filter(function (edge) {
                    var validSource = edge.sourceNode
                        ? edge.sourcePin < edge.sourceNode.func.outputs.length
                        : edge.sourcePin < func.inputs.length;
                    var validTarget = edge.targetNode
                        ? edge.targetPin < edge.targetNode.func.inputs.length
                        : edge.targetPin < func.outputs.length;
                    return validSource && validTarget;
                });

                var nowNumEdges = func.edges.length;

                self.edgeElements = self.edgeElements.data(func.edges, function (d) {
                    return (d.sourceNode ? d.sourceNode.id : '-')
                        + '/' + d.sourcePin + '+'
                        + (d.targetNode ? d.targetNode.id : '-') + '/' + d.targetPin;
                });
                // update existing paths
                var pathFn = function (d) {
                    var sourcePos = d.sourceNode
                        ? add(d.sourceNode, [
                            consts.nodeWidth / 2,
                            (d.sourcePin - (d.sourceNode.func.outputs.length - 1) / 2) * consts.pinSpacing
                        ])
                        : [0, -25 * (func.inputs.length - 1) + 50 * d.sourcePin];
                    var targetPos = d.targetNode
                        ? add(d.targetNode, [
                            -consts.nodeWidth / 2,
                            (d.targetPin - (d.targetNode.func.inputs.length - 1) / 2) * consts.pinSpacing])
                        : [1000, -25 * (func.outputs.length - 1) + 50 * d.targetPin];
                    var ctrlPt1 = avg(sourcePos, targetPos);
                    ctrlPt1[1] = sourcePos[1];
                    var ctrlPt2 = avg(sourcePos, targetPos);
                    ctrlPt2[1] = targetPos[1];
                    ctrlPt1[0] = sourcePos[0]
                        + Math.max(Math.abs(sourcePos[1] - targetPos[1]), Math.abs(ctrlPt1[0] - sourcePos[0]));
                    ctrlPt2[0] = targetPos[0]
                        - Math.max(Math.abs(sourcePos[1] - targetPos[1]), Math.abs(ctrlPt2[0] - targetPos[0]));
                    return moveto(sourcePos) + curveto(ctrlPt1, ctrlPt2, targetPos);
                };
                // add new paths
                self.edgeElements.enter()
                    .append('path')
                    .classed('link', true)
                    .on('mousedown', function (d) {
                        this.pathMouseDown.call(this, d3.select(this), d);
                    })
                    .on('mouseup', function () { state.mouseDownLink = null; });
                self.edgeElements
                    .classed(consts.selectedClass, function (d) { return d === state.selectedEdge; });
                if (ioUpdated) {
                    self.edgeElements.transition().attr('d', pathFn);
                } else {
                    self.edgeElements.attr('d', pathFn);
                }

                // remove old links
                self.edgeElements.exit()
                    .style('stroke-width', 0)
                    .transition()
                    .remove();

                inputs.classed('connected', function (d, i) {
                    var node = d3.select(this.parentNode).datum();
                    for (var iEdge in func.edges) {
                        var edge = func.edges[iEdge];
                        if (edge.targetNode === node && edge.targetPin === i) {
                            return true;
                        }
                    }
                    return false;
                });

                outputs.classed('connected', function (d, i) {
                    var node = d3.select(this.parentNode).datum();
                    for (var iEdge in func.edges) {
                        var edge = func.edges[iEdge];
                        if (edge.sourceNode === node && edge.sourcePin === i) {
                            return true;
                        }
                    }
                    return false;
                });

                self.inputElements
                    .classed('connected', function (d, i) {
                        for (var iEdge in func.edges) {
                            var edge = func.edges[iEdge];
                            if (!edge.sourceNode && edge.sourcePin === i) {
                                return true;
                            }
                        }
                        return false;
                    });

                self.outputElements
                    .classed('connected', function (d, i) {
                        for (var iEdge in func.edges) {
                            var edge = func.edges[iEdge];
                            if (!edge.targetNode && edge.targetPin === i) {
                                return true;
                            }
                        }
                        return false;
                    });

                // Update displayed function name.
                $('.function-name').text(func.name);
            };
            this.guid = 800;
            this.func = {
                name: 'New Function',
                id: '',
                nodes: nodes || [],
                edges: edges || [],
                inputs: inputs || [],
                outputs: outputs || []
            };
            this.idct = 0;
            this.state = {
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
            this.svg = svg;
            this.svgG = svg.append('g').attr('class', consts.graphClass);
            var svgG = this.svgG;
            // displayed when pinDrag between nodes
            this.dragLine = svgG.append('svg:path').attr('class', 'link dragline hidden').attr('d', moveto(0, 0) + lineto(0, 0)).style('marker-end', 'url(#mark-end-arrow)');
            // svg nodes and edges
            this.edgeElements = svgG.append('g').selectAll('g');
            this.nodeElements = svgG.append('g').selectAll('g');
            this.inputGroup = svgG.append('g').classed('inputs', true).attr('transform', translate(0, 0)).on('mousedown', function () {
                d3.event.stopPropagation();
            });
            this.outputGroup = svgG.append('g').classed('outputs', true).attr('transform', translate(1000, 0));
            this.inputElements = this.inputGroup.append('g').selectAll('g');
            this.outputElements = this.outputGroup.append('g').selectAll('g');
            this.inputAddButtonGroup = this.inputGroup.append('g').attr('transform', translate(0, 0));
            this.inputDeleteButtonGroup = this.inputGroup.append('g').attr('transform', translate(-25, 0));
            this.outputAddButtonGroup = this.outputGroup.append('g').attr('transform', translate(0, 0));
            this.outputDeleteButtonGroup = this.outputGroup.append('g').attr('transform', translate(25, 0));
            this.inputAddButtons = this.inputAddButtonGroup.selectAll('g');
            this.inputDeleteButtons = this.inputDeleteButtonGroup.selectAll('g');
            this.outputAddButtons = this.outputAddButtonGroup.selectAll('g');
            this.outputDeleteButtons = this.outputDeleteButtonGroup.selectAll('g');
            this.drag = d3.behavior.drag().on('drag', function (d, i) {
                self.state.justDragged = true;
                self.dragmove.call(self, d, i);
            }).on('dragend', function () {
            });
            // listen for key events
            d3.select(window)
                .on('keydown', function () {
                    return self.svgKeyDown.call(self);
                })
                .on('keyup', function () {
                    return self.svgKeyUp.call(self);
                });
            svg
                .on('mousedown', function (d) {
                    return self.svgMouseDown.call(self, d);
                })
                .on('mouseup', function (d) {
                    return self.svgMouseUp.call(self, d);
                });
            // listen for pinDrag
            var dragSvg = d3.behavior.zoom()
                .on('zoom', function () {
                    //if (d3.event.sourceEvent.shiftKey) {
                    //    // TODO  the internal d3 state is still changing
                    //    return false;
                    //} else {
                    self.zoomed.call(self);
                    //}
                    return true;
                })
                .on('zoomend', function () {
                    d3.select('body').style('cursor', 'auto');
                });
            svg.call(dragSvg).on('dblclick.zoom', null);
            // listen for resize
            window.onresize = function () { return self.updateWindow(svg); };
            svg.on('mousemove', function () {
                d3.selectAll('.pin-add-delete').classed('vanish', function () {
                    var buttonPosition = screenPosition(this);
                    var d = dist(buttonPosition, d3.event);
                    return d > 50 * self.zoom;
                });
            });
        }
        GraphCreator.prototype.selectElementContents = function (el) {
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        };
        GraphCreator.prototype.spliceLinksForNode = function (node) {
            var func = this.func,
                toSplice = func.edges.filter(function (l) { return l.sourceNode === node || l.targetNode === node; });
            toSplice.map(function (l) { return func.edges.splice(func.edges.indexOf(l), 1); });
        };
        GraphCreator.prototype.removeSelectFromNode = function () {
            var state = this.state;
            this.nodeElements.filter(function (cd) {
                return cd.id === state.selectedNode.id;
            }).classed(consts.selectedClass, false);
            state.selectedNode = null;
        };
        GraphCreator.prototype.removeSelectFromEdge = function () {
            var state = this.state;
            this.edgeElements.filter(function (cd) { return cd === state.selectedEdge; }).classed(consts.selectedClass, false);
            state.selectedEdge = null;
        };
        GraphCreator.prototype.pathMouseDown = function (d3path, d) {
            var state = self.state;
            d3.event.stopPropagation();
            state.mouseDownLink = d;
            if (state.selectedNode) {
                self.removeSelectFromNode();
            }
            var prevEdge = state.selectedEdge;
            if (!prevEdge || prevEdge !== d) {
            }
            else {
                self.removeSelectFromEdge();
            }
        };
        GraphCreator.prototype.nodeMouseDown = function (d) {
        };
        GraphCreator.prototype.pinMouseDown = function (node, pin) {
            var state = this.state, func = this.func;
            //d3.event.stopPropagation();
            state.mouseDownNode = node;
            state.mouseDownPin = pin;
            state.pinDrag = true;
            var sourcePos = node
                ? add(node, [consts.nodeWidth / 2, (pin - (node.func.outputs.length - 1) / 2) * consts.pinSpacing])
                : [0, -25 * (func.inputs.length - 1) + pin * 50];
            this.dragLine.classed('hidden', false).attr('d', moveto(sourcePos) + lineto(sourcePos));
        };
        GraphCreator.prototype.zoomed = function () {
            this.state.justScaleTransGraph = true;
            this.translate = point(d3.event.translate);
            this.zoom = d3.event.scale;
            $('.node-title-edit').blur();
            d3.select('.' + consts.graphClass).attr('transform', translate(d3.event.translate) + scale(d3.event.scale));
        };
        GraphCreator.prototype.updateWindow = function (svg) {
            var docEl = document.documentElement, bodyEl = document.getElementsByTagName('body')[0];
            var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
            var y = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;
            svg.attr('width', x).attr('height', y);
        };
        GraphCreator.prototype.deleteNode = function (nodeId) {
            var nodeIndex = -1;
            var func = this.func;
            for (var i = 0; i < func.nodes.length; i++) {
                var node = func.nodes[i];
                if (node.id === nodeId) {
                    nodeIndex = i;
                    break;
                }
            }
            if (nodeIndex < 0) {
                return;
            }
            func.nodes.splice(nodeIndex, 1);
            func.edges = func.edges.filter(function (edge) {
                return (!edge.sourceNode || edge.sourceNode.id !== nodeId)
                    && (!edge.targetNode || edge.targetNode.id !== nodeId);
            });
            this.updateGraph();
        };
        return GraphCreator;
    })();
    /**** MAIN ****/
    var docEl = document.documentElement, bodyEl = document.getElementsByTagName('body')[0];
    var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth, height = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;
    var xLoc = 300, yLoc = 0;
    // initial node data
    var nodes = [
        {
            id: 0,
            func: {
                id: null,
                name: 'new concept',
                inputs: [
                    { type: 3, value: 11 },
                    { type: 3, value: 22 },
                    { type: 3, value: 33 },
                    { type: 3, value: 44 },
                    { type: 3, value: 55 },
                    { type: 3, value: 66 }
                ],
                outputs: [
                    { type: 3, value: 0 },
                    { type: 3, value: 0 }
                ]
            },
            x: xLoc + 300,
            y: yLoc
        },
        {
            id: 1,
            func: {
                id: null,
                name: 'old concept',
                inputs: [
                    { type: 3, value: 111 },
                    { type: 3, value: 222 }
                ],
                outputs: [
                    { type: 3, value: 0 },
                    { type: 3, value: 0 },
                    { type: 3, value: 0 },
                    { type: 3, value: 0 },
                    { type: 3, value: 0 },
                    { type: 3, value: 0 }
                ]
            },
            x: xLoc,
            y: yLoc
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
        { id: 0, types: [3] },
        { id: 1, types: [3] }
    ];
    var outputs = [
        { id: 0, types: [3] },
        { id: 1, types: [3] },
        { id: 2, types: [3] },
        { id: 3, types: [3] },
        { id: 4, types: [3] },
        { id: 5, types: [3] }
    ];
    /** MAIN SVG **/
    $(function () {
        var svg = d3.select('body').append('svg').classed('editor', true);

        // Set up filters
        var defs = svg.append('defs');

        // create filter with id #drop-shadow
        // height=130% so that the shadow is not clipped
        var filter = defs.append('filter')
            .attr('id', 'borderGlow')
            .attr('height', '130%')
            .attr('width', '130%');

        // SourceAlpha refers to opacity of graphic that this filter will be applied to
        // convolve that with a Gaussian with standard deviation 3 and store result
        // in blur
        filter.append('feGaussianBlur')
            .attr('in', 'StrokePaint')
            .attr('stdDeviation', 8)
            .attr('result', 'blur');

        filter.append('feMorphology')
            .attr('in', 'blur')
            .attr('operator', 'dilate')
            .attr('radius', 8)
            .attr('result', 'dilatedBlur');

        filter.append('feMorphology')
            .attr('in', 'dilatedBlur')
            .attr('operator', 'erode')
            .attr('radius', 3)
            .attr('result', 'erodedDilatedBlur');

        // overlay original SourceGraphic over translated blurred opacity by using
        // feMerge filter. Order of specifying inputs is important!
        var feMerge = filter.append('feMerge');

        feMerge.append('feMergeNode')
            .attr('in', 'erodedDilatedBlur');
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');

        // nice to have
        d3.selection.prototype.moveToFront = function () {
            return this.each(function () {
                this.parentNode.appendChild(this);
            });
        };
        d3.selection.prototype.editText = function (options) {
            var handlers = options.handlers || {};
            var width = options.width;
            var align = options.align;
            var zoom = options.zoom || 1;
            return this.each(function () {
                var d3node = d3.select(this);
                var htmlEl = d3node.node();
                var nodeBCR = htmlEl.getBoundingClientRect();

                d3node.selectAll('text').style('display', 'none');

                var oldTitle = d3node.selectAll('text').text();

                // replace with editable text
                var x = (nodeBCR.left + nodeBCR.right) / 2;
                var y = nodeBCR.top - nodeBCR.height / 2 + 8 * zoom;
                var w = (width || nodeBCR.width) * zoom;
                var fontSize = parseInt(d3node.select('text').style('font-size'));
                var input = d3.select('body')
                    .selectAll('input.node-title-edit')
                    .data([1])
                    .enter()
                    .append('input')
                    .attr('value', oldTitle)
                    .classed('node-title-edit', true)
                    .attr('id', consts.activeEditId)
                    .style('left', (x - w / 2) + 'px')
                    .style('top', y + 'px')
                    .style('height', nodeBCR.height)
                    .style('width', w + 'px')
                    .style('font-size', (fontSize * zoom) + 'px')
                    .on('mousedown', function () {
                        d3.event.stopPropagation();
                    })
                    .on('keydown', function () {
                        d3.event.stopPropagation();
                        if (d3.event.keyCode == consts.ENTER_KEY) {
                            this.blur();
                        } else if (d3.event.keyCode == consts.ESCAPE_KEY) {
                            $(this).text(oldTitle);
                            this.blur();
                        }

                        if (!$(this).is(':focus')) return;

                        if (handlers.keyDown) {
                            handlers.keyDown(d3.event.keyCode, this);
                        }

                        if (handlers.update) {
                            var $this = $(this);
                            clearTimeout(window.pendingSearch);
                            window.pendingSearch = setTimeout(function () {
                                window.pendingSearch = null;
                                var newText = $this.val();
                                if (newText === this.textContent) return;
                                this.textContent = newText;
                                handlers.update(newText);
                            }, 250);
                        }
                    })
                    .on('blur', function () {
                        var text = $(this).val();
                        this.textContent = null;
                        d3.select(this).remove();
                        d3node.selectAll('text').style('display', null);
                        clearTimeout(window.pendingSearch);
                        if (handlers.done) handlers.done(text);
                    });

                $('.node-title-edit').select();

                if (handlers.start) {
                    handlers.start();
                }
            });
        };

        $('[data-type]').hide();
        $('#valueType').on('change', function () {
            var selected = $(this).find('option:selected').val().toLowerCase();
            $('[data-type]').hide();
            $('[data-type="' + selected + '"]').show();
        });

        var graph = new GraphCreator(svg, nodes, edges, inputs, outputs);
        graph.setIdCt(2);
        graph.updateGraph();
        graph.updateWindow(svg);
        var save = function () {
            var func = graph.func;
            var funcData = {
                id: func.id,
                name: func.name,
                inputs: func.inputs.map(function (pin) { return pin.types; }),
                outputs: func.outputs.map(function (pin) { return pin.types; }),
                nodes: func.nodes.map(function (node) {
                    return {
                        id: node.id,
                        functionId: node.func.id
                    };
                }),
                edges: func.edges.map(function (edge) {
                    return {
                        sourceNode: edge.sourceNode ? edge.sourceNode.id : null,
                        sourcePin: edge.sourcePin,
                        targetNode: edge.targetNode ? edge.targetNode.id : null,
                        targetPin: edge.targetPin
                    };
                })
            };
            $.when($.post('/save_function/', JSON.stringify(funcData))).then(function (result) {
                console.log(result);
                graph.func.id = result.result;
            });
        };

        $('.save-btn').click(save);
        $.prototype.onSubmit = function (fn) {
            var self = this;
            var $self = $(self);
            var submit = function () {
                var val = $self.val();
                if (/\S/.test(val)) {
                    fn.apply(self, [$self.val()]);
                }
            };
            this.keypress(function (e) {
                if (e.keyCode === 13) {
                    submit();
                }
            });
            this.blur(submit);
            return this;
        };
        $.prototype.onEscape = function (fn) {
            this.keydown(function (e) {
                if (e.keyCode === 27) {
                    fn.apply(this, [$(this).val()]);
                }
            });
            return this;
        };
        var editFunctionName = function () {
            var nameLabel = $('.function-name');
            var nameTextbox = $('<input type="text" class="function-name" value="' + graph.func.name + '"></input>')
                .onSubmit(function (value) {
                    graph.func.name = value.trim().replace(/\s+/g, ' ');
                    $(this).replaceWith(nameLabel);
                    nameLabel.text(value).click(editFunctionName);
                })
                .onEscape(function () {
                    $(this).replaceWith(nameLabel);
                    nameLabel.click(editFunctionName);
                });
            nameLabel.replaceWith(nameTextbox);
            nameTextbox.focus().select();
        };
        $('.function-name').click(editFunctionName);
        $(document).keydown(function (e) {
            if ((e.which == 115 || e.which == 83) && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                save();
                return false;
            }
            return true;
        });
    });
})();
