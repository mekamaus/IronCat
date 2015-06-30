(function () {
    d3.selection.prototype.valueEditor = function (options) {
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
            var d3node = d3.select(this);
            var valueIndicator = d3node.append('g')
                .classed('value', true)
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
            function update() {
                d3.selectAll('.value-types').selectAll('.value-type')
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

                d3.selectAll('.value-types')
                    .transition()
                    .attr('transform', function (d) {
                        var type = d.value.type;
                        var types = d.types;
                        var typeIndex = types.indexOf(type);
                        var t = 360 * typeIndex / types.length;
                        var r = 24 / (2 * Math.sin(Math.PI / types.length));
                        return translate(-r - 72, 0) + rotate(-t);
                    });
            }

            valueIndicator.append('use')
                .classed('input-default-type-icon', true)
                .attr('transform', translate(18 / 2, 0));

            d3.selectAll('.node').selectAll('use.input-default-type-icon')
                .attr('xlink:href', function (d) { return typeOptions[d.value.type].icon; });

            valueIndicator.append('rect')
                .attr('width', 50)
                .attr('height', 20)
                .attr('x', -55)
                .attr('y', -10)
                .attr('rx', 5)
                .attr('ry', 5);

            valueIndicator.append('text')
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'middle')
                .attr('transform', translate(-10, 0))
                .text(function (d) {
                    return d.value.value;
                });

            var valueTypeIndicator = valueIndicator.append('g')
                .classed('value-types', true);

            var valueTypeIndicatorOptions = valueTypeIndicator.selectAll('g')
                .data(function (d) { return d.types; });

            var newValueTypeIndicatorOptionIcons = valueTypeIndicatorOptions.enter()
                .append('g')
                .classed('value-type', true)
                .on('mousedown', function (d) {
                    var parentData = d3.select(this.parentNode).datum();
                    parentData.value.type = d;
                    update();
                });

            newValueTypeIndicatorOptionIcons.append('circle')
                .attr('r', 24 / 2 - 0.5);

            newValueTypeIndicatorOptionIcons.append('use')
                .attr('xlink:href', function (d) { return typeOptions[d].icon; });

            valueTypeIndicatorOptions.exit()
                .remove();

            update();
        });
    };
})();
