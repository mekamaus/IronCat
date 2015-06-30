(function () {
    var _idCounter = 0;
    d3.selection.prototype.selectable = function (options) {
        options = options || {};
        var handlers = options.handlers || {};
        return this.each(function (d, i) {
            var d3node = d3.select(this);

            d3.select('body')
                .on('keydown.' + ('_tempId_' + _idCounter++), function () {
                    if (d3.event.keyCode === 27 || d3.event.keyCode === 13) {
                        // escape; deselect
                        if (d3node.attr('selected') == 'true') {
                            d3node.attr('selected', 'false');
                            if (options.class) {
                                d3node.classed(options.class, false);
                            }
                            if (handlers.deselect) {
                                handlers.deselect.call(this, d, i);
                            }
                        }
                    }
                });

            d3node
                .attr('selected', 'false')
                .click(function () {
                    if (d3node.attr('selected') == 'false') {
                        d3node.attr('selected', 'true');
                        if (options.class) {
                            d3node.classed(options.class, true);
                        }
                        if (handlers.select) {
                            handlers.select.call(this, d, i);
                        }
                    }
                })
                .clickOutside(function () {
                    if (d3node.attr('selected') == 'true') {
                        d3node.attr('selected', 'false');
                        if (options.class) {
                            d3node.classed(options.class, false);
                        }
                        if (handlers.deselect) {
                            handlers.deselect.call(this, d, i);
                        }
                    }
                });
        });
    };
})();
