(function () {
    d3.selection.prototype.editText = function (options) {
        var handlers = options.handlers || {};
        var width = options.width;
        var align = options.align;
        var cls = options.class || '';
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
            var text = d3node.select('text');
            var textAlign = align || text.attr('text-anchor') || 'left';
            textAlign = (textAlign === 'middle') ? 'center' : textAlign;
            var fontSize = parseInt(text.style('font-size'));
            var input = d3.select('body')
                .selectAll('input.node-title-edit')
                .data([1])
                .enter()
                .append('input')
                .attr('value', oldTitle)
                .classed(cls, true)
                .style('position', 'fixed')
                .style('left', (x - w / 2) + 'px')
                .style('top', y + 'px')
                .style('height', nodeBCR.height)
                .style('width', w + 'px')
                .style('text-align', textAlign)
                .style('font-size', (fontSize * zoom) + 'px')
                .style('padding', 0)
                .style('margin', 0)
                .style('outline', 'none')
                .style('border', 'none')
                .style('background', 'transparent')
                .on('mousedown', function () {
                    d3.event.stopPropagation();
                })
                .on('keydown', function () {
                    d3.event.stopPropagation();
                    if (d3.event.keyCode == 13) {
                        this.blur();
                    } else if (d3.event.keyCode == 27) {
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
    d3.selection.prototype.clickToEdit = function (options) {
        return this.each(function () {
            d3.select(this).on('click', function () {
                d3.select(this).editText(options);
            });
        });
    };
    d3.selection.prototype.moveToFront = function () {
        return this.each(function () {
            this.parentNode.appendChild(this);
        });
    };
})();
