(function () {

    function getListHeight(list) {
        var height = 8;
        for (var i = 0; i < list.length; i++) {
            var type = list[i].type;
            if (type === 7) {
                height += getListHeight(JSON.parse(list[i].value)) + 4;
            } else {
                height += 24;
            }
        }
        return height;
    }

    function getValueWidth(value) {
        if (value.type === 7) {
            var list = JSON.parse(value.value);
            var maxElementWidth = 50;
            for (var i = 0; i < list.length; i++) {
                maxElementWidth = Math.max(maxElementWidth, getValueWidth(list[i]));
            }
            return maxElementWidth + 30;
        } else {
            return 50;
        }
    }

    d3.selection.prototype.valueEditor = function (options) {
        options = options || {};
        var handlers = options.handlers || {};
        var change = handlers.change || function () {};
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
        return this.each(function (d, i) {
            var self = this;
            var value = d.value;
            var types = d.types;
            var d3node = d3.select(self);
            var valueContainer = d3node.append('g')
                .classed('value-container', true)
                .attr('transform', translate(-18 / 2, 0))
                .selectable({
                    class: 'edit',
                    handlers: {
                        select: function () {
                        },
                        deselect: function () {
                        }
                    }
                });

            valueContainer.append('use')
                .classed('input-default-type-icon', true)
                .attr('transform', translate(18 / 2, 0));

            d3.selectAll('.node').selectAll('use.input-default-type-icon')
                .attr('xlink:href', function (d) {
                    return typeOptions[d.value.type].icon;
                });

            var valueIndicator = valueContainer.append('g')
                .classed('value', true);

            var valueTypeIndicator = valueContainer.append('g')
                .classed('value-types', true);

            var valueTypeIndicatorOptions = valueTypeIndicator.selectAll('g')
                .data(function (d) { return d.types; });

            var newValueTypeIndicatorOptionIcons = valueTypeIndicatorOptions.enter()
                .append('g')
                .classed('value-type', true)
                .click(function (typeOption) {
                    var data = d3.select(this.parentNode).datum();
                    if (data.value.type === typeOption) {
                        return;
                    }
                    data.value.type = typeOption;
                    switch (data.value.type) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 8:
                            break;
                        case 7:
                            data.value.value = JSON.stringify([
                                {
                                    value: '1',
                                    type: 3
                                },
                                {
                                    value: '2',
                                    type: 3
                                }
                            ]);
                            break;
                    }
                    update(d, i);
                    change.call(self, data.value, i);
                });

            newValueTypeIndicatorOptionIcons.append('circle')
                .attr('r', 24 / 2 - 0.5);

            newValueTypeIndicatorOptionIcons.append('use')
                .attr('xlink:href', function (d) { return typeOptions[d].icon; });

            valueTypeIndicatorOptions.exit()
                .remove();

            valueIndicator.append('rect')
                .classed('value-area', true)
                .attr('width', 50)
                .attr('height', 20)
                .attr('x', -55)
                .attr('y', -10)
                .attr('rx', 5)
                .attr('ry', 5);
            valueIndicator.append('text')
                .classed('.value-text', true)
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'middle')
                .attr('transform', translate(-10, 0))
                .text(function (d) {
                    return d.value.value;
                });

            function update(value, index) {
                // Update type selectors.
                d3.select(self).children('g').child('.value-types').selectAll('.value-type')
                    .classed('active', function (d) {
                        var parentValueType = d3.select(this.parentNode).datum().value.type;
                        return parentValueType === d;
                    })
                    .transition()
                    .attr('transform', function (d, i) {
                        var parentDatum = d3.select(this.parentNode).datum();
                        var type = parentDatum.value.type;
                        var types = parentDatum.types;
                        var typeIndex = types.indexOf(type);
                        var t = 2 * Math.PI * i / types.length;
                        var t2 = 360 * typeIndex / types.length;
                        var r = 24 / (2 * Math.sin(Math.PI / types.length));
                        var s = (i === typeIndex) ? 1.5 : 1.0;
                        return translate(r * Math.cos(t), r * Math.sin(t))
                            + rotate(t2) + scale(s);
                    });

                var type = value.value.type;
                var types = value.types;
                var typeIndex = types.indexOf(type);
                var t = 360 * typeIndex / types.length;
                var r = 24 / (2 * Math.sin(Math.PI / types.length));

                function updateTypeSelector(width) {
                    d3.select(self).children('g').child('.value-types')
                        .transition()
                        .attr('transform', translate(-r - width - 22, 0) + rotate(-t));
                }
                updateTypeSelector(getValueWidth(value.value));

                // Update value indicators.
                switch (d.value.type) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 8:
                        valueIndicator.child('.value-area')
                            .attr('width', 50)
                            .attr('height', 20)
                            .attr('x', -55)
                            .attr('y', -10)
                            .attr('rx', 5)
                            .attr('ry', 5);
                        valueIndicator.child('.value-text')
                            .attr('text-anchor', 'end')
                            .attr('dominant-baseline', 'middle')
                            .attr('transform', translate(-10, 0))
                            .text(function (d) {
                                return d.value.value;
                            });
                        valueIndicator.child('.value-list')
                            .remove();
                        break;
                    case 7:
                        valueIndicator.child('.value-text')
                            .text('');
                        var list = JSON.parse(d.value.value);

                        var listNode = valueIndicator.append('g')
                            .classed('value-list', true)
                            .attr('transform', translate(-16, 0));

                        function recCount(list) {
                            var count = 0;

                            for (var i = 0; i < list.length; i++) {
                                var type = list[i].type;
                                if (type === 7) {
                                    count += recCount(JSON.parse(list[i].value));
                                } else {
                                    count += 1;
                                }
                            }

                            return count;
                        }

                        function updateList() {
                            var listHeight = getListHeight(list);
                            var listWidth = getValueWidth(value.value);
                            valueIndicator.select('.value-area')
                                .attr('width', listWidth)
                                .attr('height', listHeight)
                                .attr('x', -5 - listWidth)
                                .attr('y', -15)
                                .attr('rx', 10)
                                .attr('ry', 10);

                            updateTypeSelector(listWidth);

                            var listItems = listNode.children('.value-list-item')
                                .data(list.map(function (value) {
                                    return {
                                        value: value,
                                        types: [0, 1, 2, 3, 4, 5, 6, 7, 8]
                                    };
                                }));
                            var newListItems = listItems.enter()
                                .append('g')
                                .classed('value-list-item', true);
                            listItems.exit()
                                .remove();

                            listItems.transition()
                                .attr('transform', function (d, i) {
                                    var offset = 0;
                                    for (var j = 0; j <= i; j++) {
                                        if (list[j].type === 7) {
                                            offset += 5;
                                            if (j < i) {
                                                offset += getListHeight(JSON.parse(list[j].value)) - 24;
                                            }
                                        }
                                    }
                                    return translate(0, 25 * i + offset);
                                });

                            newListItems.valueEditor({
                                handlers: {
                                    change: function (d, i) {
                                        var list = JSON.parse(value.value.value);
                                        list[i] = d;
                                        value.value.value = JSON.stringify(list);
                                        updateList.call(self);
                                        change.call(self, value.value, index);
                                    }
                                }
                            });
                        }
                        updateList();
                        break;
                }
            }

            update(d, i);
        });
    };
})();
