(function ($, undefined) {
    // Find out whether we are using a touch screen.
    window.touch = (function () {
        try {
            document.createEvent('TouchEvent');
            return true;
        } catch (e) {
            return false;
        }
    })();

    function getId(node) {
        return !node ? null : node.id !== undefined ? node.id : '(fake)' + node.fakeId;
    }

    var mouseDownEvent = window.touch ? 'touchstart' : 'mousedown';
    var mouseUpEvent = window.touch ? 'touchend' : 'mouseup';
    var keyPressEvent = 'keydown';

    var consts = {
        selectedClass: 'selected',
        connectClass: 'connect-node',
        graphClass: 'graph',
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ENTER_KEY: 13,
        ESCAPE_KEY: 27,
        nodeWidth: 180,
        nodeHeight: 100,
        nodeLabelHeight: 40,
        nodeCornerRadius: 20,
        nodeMargin: 40,
        pinSize: 18,
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
                    var sourcePos = d.outputs ? add(d, [consts.nodeWidth / 2, (state.mouseDownPin - (d.outputs.length - 1) / 2) * consts.pinSpacing]) : [0, -25 * (func.inputs.length - 1) + state.mouseDownPin * 50];
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
                        fakeId: self.idct++,
                        name: 'New Edge ' + (self.idct - 1),
                        sourceNode: mouseDownNode,
                        sourcePin: mouseDownPin,
                        targetNode: node,
                        targetPin: pin,
                        modified: true
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
                        // Remove other edges with the same target.
                        func.edges = func.edges.filter(function (d) {
                            return !(d.targetNode === newEdge.targetNode && d.targetPin === newEdge.targetPin);
                        });
                        // Add the new edge.
                        func.edges.push(newEdge);
                        self.updateGraph(true);
                    }
                }
                state.mouseDownNode = null;
            };
            this.createGuid = function () { return ++self.guid; };
            this.nodeMouseUp = function (d3node, d) {
            };
            this.deselectAll = function () {
                var self = this;
                self.state.selectedNodes = [];
                self.state.selectedEdges = [];
                self.svg.selectAll('.link, .node').classed('selected', false);
                self.state.graphMouseDown = true;
            };
            this.svgMouseUp = function () {
                var state = self.state, func = self.func;
                if (state.justScaleTransGraph) {
                    // dragged not clicked
                    state.justScaleTransGraph = false;
                }
                else if (state.graphMouseDown && d3.event.shiftKey) {
                    // Add new node
                    var xycoords = d3.mouse(self.svgG.node()),
                        newNode = {
                            fakeId: self.idct++,
                            name: 'New Node ' + self.idct - 1,
                            func: {
                                name: '(click here)',
                                inputs: [
                                    {
                                        types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                                        value: {type: 3, value: '1'}
                                    }
                                ],
                                outputs: [
                                    {types: [0, 1, 2, 3, 4, 5, 6, 7, 8]}
                                ]
                            },
                            x: xycoords[0],
                            y: xycoords[1],
                            inputs: [
                                {
                                    types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                                    value: {type: 3, value: '1'}
                                }
                            ],
                            outputs: [
                                {types: [0, 1, 2, 3, 4, 5, 6, 7, 8]}
                            ],
                            modified: true
                        };
                    func.nodes.push(newNode);
                    self.updateGraph();
                }
                else if (state.pinDrag) {
                    // dragged from node
                    state.pinDrag = false;
                    self.dragLine.classed('hidden', true);
                }
                state.graphMouseDown = false;
            };
            this.svgKeyPress = function () {
                var self = this,
                    state = self.state,
                    func = self.func;
                var selectedNodes = state.selectedNodes;
                var selectedEdges = state.selectedEdges;
                switch (d3.event.keyCode) {
                    case consts.BACKSPACE_KEY:
                    case consts.DELETE_KEY:
                        if (!$('input:focus').length) {
                            d3.event.preventDefault();
                            if (selectedNodes.length || selectedEdges.length) {
                                if (selectedEdges.length) {
                                    selectedEdges.forEach(function (edge) {
                                        func.edges.splice(func.edges.indexOf(edge), 1);
                                    });
                                    state.selectedEdges = [];
                                }
                                if (selectedNodes.length) {
                                    selectedNodes.forEach(function (node) {
                                        self.deleteNode.call(self, node);
                                    });
                                    state.selectedNodes = [];
                                }
                                self.updateGraph();
                            }
                        }
                        break;
                }
            };
            this.updateGraph = function (ioUpdated) {
                if (ioUpdated === void 0) { ioUpdated = false; }
                var svg = self.svg, state = self.state, func = self.func;

                // Update existing nodes.
                self.nodeElements = self.nodeElements.data(func.nodes, function (d) { return getId(d); });
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
                    .on(mouseDownEvent, function (d) {
                        d3.event.stopPropagation();
                        self.nodeMouseDown.call(self, d3.select(this), d);
                    })
                    .on(mouseUpEvent, function (d) {
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

                newNodes.append('g')
                    .classed('node-inputs', true)
                    .selectAll()
                    .data(function (d) { return d.inputs; });
                newNodes.append('g')
                    .classed('node-outputs', true)
                    .selectAll()
                    .data(function (d) { return d.outputs; });

                var inputs = self.nodeElements
                    .select('.node-inputs')
                    .selectAll('.node-input')
                    .data(function (d) { return d.inputs; });

                var newNodeInputs = inputs.enter()
                    .append('g')
                    .classed('pin', true)
                    .classed('node-input', true)
                    .attr('transform', function (d, i) {
                        return translate(0, i * consts.pinSpacing);
                    })
                    .on(mouseUpEvent, function (d, i) {
                        self.pinMouseUp.call(this, d3.select(this), d3.select(this.parentNode).datum(), i);
                    });

                newNodeInputs
                    .append('circle')
                    .attr('r', consts.pinSize / 2);

                var newValueIndicators = newNodeInputs
                    .append('g')
                    .classed('pin-value', true)
                    .attr('transform', translate(-consts.pinSize / 2, 0))
                    .clickToEdit({
                        editClass: 'edit',
                        errorClass: 'error',
                        width: 50,
                        constraint: function (d, value) {
                            if (d.value.type === 0) {
                                return !value;
                            } else if (d.value.type === 3) {
                                return value && isFinite(value);
                            }
                            return true;
                        },
                        handlers: {
                            start: function () {
                                self.deselectAll();
                            },
                            done: function (d, value, valid) {
                                if (valid) {
                                    // Set modified flag for node
                                    var nodeDatum = d3.select(this.parentNode.parentNode).datum();
                                    nodeDatum.modified = true;

                                    var type = d.value.type;
                                    if (type === 0) {
                                        value = '';
                                    } else if (type === 3) {
                                        value = parseFloat(value).toString();
                                    }
                                    d.value.value = value;
                                    d3.select(this).select('text').text(value);
                                }
                            }
                        }
                    });

                var typeOptions = [
                    { name: 'None', icon: '#noneType' },
                    { name: 'Error', icon: '#errorType' },
                    { name: 'String', icon: '#stringType' },
                    { name: 'Number', icon: '#numberType' },
                    { name: 'Boolean', icon: '#booleanType' },
                    { name: 'Object', icon: '#objectType' },
                    { name: 'Set', icon: '#setType' },
                    { name: 'List', icon: '#listType' },
                    { name: 'Function', icon: '#functionType' }
                ];

                newValueIndicators.append('circle')
                    .attr('r', consts.pinSize / 2)
                    .style('fill', 'rgba(0, 0, 0, 0)')
                    .style('stroke', 'none')
                    .attr('transform', translate(consts.pinSize / 2, 0));

                newValueIndicators.append('use')
                    .classed('input-default-type-icon', true)
                    .attr('transform', translate(consts.pinSize / 2, 0));

                d3.selectAll('.node').selectAll('use.input-default-type-icon')
                    .attr('xlink:href', function (d) { return typeOptions[d.value.type].icon; });

                newValueIndicators.append('rect')
                    .attr('width', 50)
                    .attr('height', 20)
                    .attr('x', -55)
                    .attr('y', -10)
                    .attr('rx', 5)
                    .attr('ry', 5);

                newValueIndicators.append('text')
                    .attr('text-anchor', 'end')
                    .attr('dominant-baseline', 'middle')
                    .attr('transform', translate(-10, 0))
                    .text(function (d) {
                        return d.value.value;
                    });

                var valueTypeIndicators = newValueIndicators.append('g')
                    .classed('value-types', true);

                var typeSelectorRadius = consts.pinSpacing * typeOptions.length / 2 / Math.PI;

                valueTypeIndicators.append('circle')
                    .attr('r', typeSelectorRadius)
                    .style('stroke-width', consts.pinSpacing + 6);

                var valueTypeIndicatorOptions = valueTypeIndicators.selectAll('g')
                    .data(typeOptions);


                var newValueTypeIndicatorOptionIcons = valueTypeIndicatorOptions.enter()
                    .append('g')
                    .classed('value-type', true)
                    .on(mouseDownEvent, function (d, i) {
                        var parentData = d3.select(this.parentNode).datum();
                        parentData.value.type = i;
                        window.preventEditableBlur = true;
                        self.updateGraph();
                    });

                newValueTypeIndicatorOptionIcons.append('circle')
                    .attr('r', consts.pinSpacing / 2 - 0.5);

                newValueTypeIndicatorOptionIcons.append('use')
                    .attr('xlink:href', function (d) { return d.icon; });

                valueTypeIndicatorOptions.exit()
                    .remove();

                inputs.exit().remove();

                d3.selectAll('.value-types').selectAll('.value-type')
                    .classed('active', function (d, i) {
                        var parentValueType = d3.select(this.parentNode).datum().value.type;
                        return parentValueType === i;
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        var type = d3.select(this.parentNode).datum().value.type;
                        var t = 2 * Math.PI * i / typeOptions.length;
                        var t2 = 360 * type / typeOptions.length;
                        return translate(typeSelectorRadius * Math.cos(t), typeSelectorRadius * Math.sin(t))
                            + rotate(t2);
                    });

                d3.selectAll('.value-types')
                    .transition()
                    .attr('transform', function (d) {
                        var t = 360 * d.value.type / typeOptions.length;
                        return translate(-typeSelectorRadius - 72, 0) + rotate(-t);
                    });

                var outputs = self.nodeElements
                    .select('.node-outputs')
                    .selectAll('.node-output')
                    .data(function (d) { return d.outputs; });

                outputs.enter()
                    .append('g')
                    .classed('pin', true)
                    .classed('node-output', true)
                    .attr('transform', function (d, i) {
                        return translate(0, i * consts.pinSpacing);
                    })
                    .on(mouseDownEvent, function (d, i) {
                        self.pinMouseDown.call(self, d3.select(this.parentNode).datum(), i);
                    })
                    .append('circle').attr('r', consts.pinSize / 2);

                outputs.exit().remove();

                svg.selectAll('.node')
                    .selectAll('.node-shape')
                    .attr('height', function (d) {
                        return Math.max(d.inputs.length, d.outputs.length) * consts.pinSpacing + 2 * consts.nodeMargin;
                    })
                    .attr('transform', function (d) {
                        return translate(-consts.nodeWidth / 2, -(Math.max(d.inputs.length, d.outputs.length) * consts.pinSpacing + 2 * consts.nodeMargin) / 2);
                    });
                svg.selectAll('.node')
                    .selectAll('.node-inputs').attr('transform', function (d) {
                        return translate(-consts.nodeWidth / 2, -(d.inputs.length - 1) * consts.pinSpacing / 2);
                    });
                svg.selectAll('.node')
                    .selectAll('.node-outputs')
                    .attr('transform', function (d) {
                        return translate(consts.nodeWidth / 2, -(d.outputs.length - 1) * consts.pinSpacing / 2);
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
                    var label = header.append('g')
                        .classed('node-label', true)
                        .on(mouseDownEvent, function () {
                            d3.event.stopPropagation();
                        })
                        .clickToEdit({
                            width: consts.nodeWidth,
                            editClass: 'node-title-edit',
                            handlers: {
                                start: function () {
                                    state.editNode = i;
                                    self.searchResults = [];
                                    self.updateGraph();
                                },
                                done: function () {
                                    state.editNode = null;

                                    var fn = self.searchResults[self.selectedSearchResult] || node.func;
                                    node.func = fn;
                                    // Give the node a shallow copy of the function's inputs and outputs.
                                    node.inputs = fn.inputs.slice(0);
                                    node.outputs = fn.outputs.slice(0);
                                    nodeElement.select('.node-function-name').text(fn.name);
                                    self.updateGraph();

                                    // Set the modified flag for the node.
                                    node.modified = true;
                                },
                                update: function (d, value) {
                                    if (!value) {
                                        self.searchResults = [];
                                        self.updateGraph();
                                        return;
                                    }
                                    $.when($.getJSON('/search/', {q: value})).then(function (data) {
                                        if (!data.success) {
                                            console.error(data.error);
                                            return;
                                        }
                                        self.searchResults = data.results;
                                        self.selectedSearchResult = 0;
                                        self.updateGraph();
                                        nodeElement.select('.search-result')
                                            .classed('selected', function (d, i) {
                                                return i === self.selectedSearchResult;
                                            });
                                    });
                                },
                                keyPress: function (d, keyCode) {
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
                            self.deleteNode.call(self, d);
                        });
                    deleteBtn
                        .append('circle')
                        .attr('r', 12);
                    deleteBtn
                        .append('use')
                        .attr('xlink:href', '#removeSymbol');

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
                            d.inputs.length,
                            d.outputs.length) * consts.pinSpacing + 2 * consts.nodeMargin) / 2);
                    });

                // Remove old nodes.
                var oldNodes = self.nodeElements.exit();
                oldNodes.selectAll('rect, g')
                    .transition()
                    .style('opacity', 0);
                oldNodes
                    .transition()
                    .attr('transform', function (d) { return translate(d) + scale(0.75); })
                    .remove();
                // Inputs
                self.inputElements = self.inputElements.data(func.inputs, function (d) { return d.id; });
                var newInputs = self.inputElements
                    .enter()
                    .insert('g')
                    .classed('input', true);

                newInputs.call(self.drag);

                newInputs
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.inputs.length - 1) + 50 * i) + scale(0);
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.inputs.length - 1) + 50 * i);
                    });
                newInputs.append('circle').attr('r', 20);
                self.inputElements
                    .on(mouseDownEvent, function (d, i) {
                        return self.pinMouseDown.call(self, null, i);
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.inputs.length - 1) + 50 * i);
                    });
                self.inputElements.exit()
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.inputs.length) + 50 * i) + scale(0);
                    })
                    .remove();
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
                    .on(mouseUpEvent, function (d, i) {
                        self.pinMouseUp.call(self, d3.select(this), null, i);
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.outputs.length - 1) + 50 * i);
                    });
                self.outputElements.exit()
                    .transition()
                    .attr('transform', function (d, i) {
                        return translate(0, -25 * (func.inputs.length) + 50 * i) + scale(0);
                    })
                    .remove();
                // IO add/delete buttons
                var pinAddDeleteButtonRadius = 12;
                self.inputDeleteButtons = self.inputDeleteButtons.data(func.inputs, function (d) { return d.id; });
                var newInputDeleteButtons = self.inputDeleteButtons
                    .enter()
                    .append('g')
                    .classed('pin-add-delete', true)
                    .classed('pin-delete', true)
                    .classed('vanish', !window.touch);
                newInputDeleteButtons.append('circle').attr('r', pinAddDeleteButtonRadius);
                newInputDeleteButtons.append('use')
                    .attr('xlink:href', '#removeSymbol');
                self.inputDeleteButtons
                    .on(mouseDownEvent, function (d, i) {
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
                newInputAddButtons.append('use')
                    .attr('xlink:href', '#addSymbol');
                self.inputAddButtons
                    .call(self.drag).on(mouseDownEvent, function (d, i) {
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
                newOutputDeleteButtons.append('use')
                    .attr('xlink:href', '#removeSymbol');
                self.outputDeleteButtons
                    .on(mouseDownEvent, function (d) {
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
                newOutputAddButtons.append('use')
                    .attr('xlink:href', '#addSymbol');
                self.outputAddButtons
                    .on(mouseDownEvent, function (d) {
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
                    .on(mouseUpEvent, function (d) {
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
                    .on(mouseDownEvent, function (d) {
                        self.pathMouseDown.call(self, d3.select(this), d);
                    })
                    .on(mouseUpEvent, function () { state.mouseDownLink = null; });
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
                selectedNodes: [],
                selectedEdges: [],
                mouseDownNode: null,
                mouseDownLink: null,
                justScaleTransGraph: false,
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
            this.inputGroup = svgG.append('g').classed('inputs', true).attr('transform', translate(0, 0)).on(mouseDownEvent, function () {
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
                self.dragmove.call(self, d, i);
            });
            // listen for key events
            d3.select(window)
                .on('keydown', function () {
                    return self.svgKeyPress.call(self);
                });
            svg
                .on(mouseDownEvent, function () {
                    self.deselectAll();
                    return true;
                })
                .on(mouseUpEvent, function (d) {
                    return self.svgMouseUp.call(self, d);
                });
            // listen for pinDrag
            var dragSvg = d3.behavior.zoom()
                .scaleExtent([0.5, 2])
                .on('zoom', function () {
                    self.zoomed.call(self);
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
                    if (window.touch) return false;
                    var buttonPosition = screenPosition(this);
                    var d = dist(buttonPosition, d3.event);
                    return d > 50 * (window.editorZoom || 1);
                });
            });
        }
        GraphCreator.prototype.spliceLinksForNode = function (node) {
            var func = this.func,
                toSplice = func.edges.filter(function (l) { return l.sourceNode === node || l.targetNode === node; });
            toSplice.map(function (l) { return func.edges.splice(func.edges.indexOf(l), 1); });
        };
        GraphCreator.prototype.pathMouseDown = function (d3path, d) {
            var state = this.state;
            d3.event.stopPropagation();
            if (!d3.event.shiftKey) {
                d3.selectAll('.node, .link').classed('selected', false);
                state.selectedNodes = [];
                state.selectedEdges = [];
            }
            d3path.classed('selected', true).moveToFront();
            if (state.selectedEdges.indexOf(d) < 0) {
                state.selectedEdges.push(d);
            }
        };
        GraphCreator.prototype.nodeMouseDown = function (d3node, d) {
            var state = this.state;
            d3.event.stopPropagation();
            if (!d3.event.shiftKey) {
                d3.selectAll('.node, .link').classed('selected', false);
                state.selectedNodes = [];
                state.selectedEdges = [];
            }
            d3node.classed('selected', true).moveToFront();
            if (state.selectedNodes.indexOf(d) < 0) {
                state.selectedNodes.push(d);
            }
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
            window.editorZoom = d3.event.scale;
            $('.node-title-edit').blur();
            d3.select('.' + consts.graphClass).attr('transform', translate(d3.event.translate) + scale(d3.event.scale));
        };
        GraphCreator.prototype.updateWindow = function (svg) {
            var docEl = document.documentElement, bodyEl = document.getElementsByTagName('body')[0];
            var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
            var y = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;
            svg.attr('width', x).attr('height', y);
        };
        GraphCreator.prototype.deleteNode = function (node) {
            var nodeId = getId(node);
            var nodeIndex = -1;
            var func = this.func;
            for (var i = 0; i < func.nodes.length; i++) {
                var currNode = func.nodes[i];
                if (getId(currNode) === nodeId) {
                    nodeIndex = i;
                    break;
                }
            }
            if (nodeIndex < 0) {
                return;
            }
            func.nodes.splice(nodeIndex, 1);
            func.edges = func.edges.filter(function (edge) {
                return (!edge.sourceNode || getId(edge.sourceNode) !== nodeId)
                    && (!edge.targetNode || getId(edge.targetNode) !== nodeId);
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
            fakeId: 0,
            name: 'Node 1',
            func: {
                id: null,
                name: 'sin',
                inputs: [
                    {
                        types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                        value: {type: 3, value: '11'}
                    }
                ],
                outputs: [
                    {types: [0, 1, 2, 3, 4, 5, 6, 7, 8]}
                ]
            },
            inputs: [
                {
                    types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                    value: {type: 3, value: '11'}
                }
            ],
            outputs: [
                {types: [0, 1, 2, 3, 4, 5, 6, 7, 8]}
            ],
            x: xLoc + 300,
            y: yLoc,
            modified: true
        },
        {
            fakeId: 1,
            name: 'Node 2',
            func: {
                id: null,
                name: '+',
                inputs: [
                    {
                        types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                        value: {type: 3, value: '111'}
                    },
                    {
                        types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                        value: {type: 3, value: '222'}
                    }
                ],
                outputs: [
                    {types: [0, 1, 2, 3, 4, 5, 6, 7, 8]}
                ]
            },
            inputs: [
                {
                    types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                    value: {type: 3, value: '111'}
                },
                {
                    types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                    value: {type: 3, value: '222'}
                }
            ],
            outputs: [
                {types: [0, 1, 2, 3, 4, 5, 6, 7, 8]}
            ],
            x: xLoc,
            y: yLoc,
            modified: true
        }
    ];
    var edges = [
        {
            fakeId: 2,
            name: 'edge 1',
            sourcePin: 0,
            targetNode: nodes[1],
            targetPin: 0,
            modified: true
        },
        {
            fakeId: 3,
            name: 'edge 2',
            sourcePin: 1,
            targetNode: nodes[1],
            targetPin: 1,
            modified: true
        },
        {
            fakeId: 4,
            name: 'edge 3',
            sourceNode: nodes[1],
            sourcePin: 0,
            targetNode: nodes[0],
            targetPin: 0,
            modified: true
        }
    ];
    var inputs = [
        {
            id: 0,
            name: 'a',
            types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            value: {type: 3, value: '3.14'}
        },
        {
            id: 1,
            name: 'b',
            types: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            value: {type: 3, value: '2.72'}
        }
    ];
    var outputs = [
        {
            id: 0,
            name: 'A',
            types: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
            id: 1,
            name: 'B',
            types: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
            id: 2,
            name: 'C',
            types: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
            id: 3,
            name: 'D',
            types: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
            id: 4,
            name: 'E',
            types: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
            id: 5,
            name: 'F',
            types: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        }
    ];
    /** MAIN SVG **/
    $(function () {

        var svg = d3.select('svg.editor');

        d3.select('html').classed('touch', window.touch);

        $('nav').on('touchmove', false);

        var graph = new GraphCreator(svg, nodes, edges, inputs, outputs);
        graph.setIdCt(2);
        graph.updateGraph();
        graph.updateWindow(svg);
        var save = function () {
            var func = graph.func;
            console.log(func);
            $.when($.post('/save_function/', JSON.stringify(func))).then(function (result) {
                if (!result.success) {
                    console.error(result.error);
                    return;
                }
                var newFuncId = result.result.function_id;
                var newNodeIds = result.result.new_node_ids;
                var newEdgeIds = result.result.new_edge_ids;

                graph.func.nodes.forEach(function (node) {
                    if (node.modified) {
                        node.modified = false;
                        if (node.fakeId !== undefined) {
                            node.id = newNodeIds[node.fakeId];
                            delete node.fakeId;
                        }
                    }
                });
                graph.func.edges.forEach(function (edge) {
                    if (edge.modified) {
                        edge.modified = false;
                        if (edge.fakeId !== undefined) {
                            edge.id = newEdgeIds[edge.fakeId];
                            delete edge.fakeId;
                        }
                    }
                });
                graph.func.id = newFuncId;
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
            this.on(keyPressEvent, function (e) {
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
})(jQuery, undefined);
