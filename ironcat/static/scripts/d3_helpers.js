(function () {
    d3.selection.prototype.editText = function (options) {
        options = options || {};
        var handlers = options.handlers || {};
        var width = options.width;
        var align = options.align;
        var editClass = options.editClass || '';
        var errorClass = options.errorClass || '';
        var zoom = window.editorZoom || 1;
        var constraint = options.constraint;
        return this.each(function () {
            var self = this;
            var d3node = d3.select(self);
            var d = d3node.datum();
            var htmlEl = d3node.select('text').node();
            var nodeBCR = htmlEl.getBoundingClientRect();

            d3node.selectAll('text').style('display', 'none');

            if (editClass) {
                d3node.classed(editClass, true);
            }

            var oldTitle = d3node.select('text').text();

            // replace with editable text
            var x = (nodeBCR.left + nodeBCR.right) / 2;
            var y = nodeBCR.top - nodeBCR.height / 2 + 8 * zoom;
            var w = (width || nodeBCR.width) * zoom;
            var text = d3node.select('text');
            var textAlign = align || text.attr('text-anchor') || 'left';
            textAlign = (textAlign === 'middle') ? 'center' : (textAlign === 'start') ? 'left' : (textAlign === 'end') ? 'right' : textAlign;
            var fontSize = parseInt(text.style('font-size'));
            var input = d3.select('body')
                .selectAll('input.totally-unique-text-edit-class')
                .data([1])
                .enter()
                .append('input')
                .classed('totally-unique-text-edit-class', true)
                .attr('value', oldTitle)
                .attr('id', 'extraUniqueIdToPutOnEditingTextElementSoThatItIsDefinitelyUnique')
                .classed(editClass, true)
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
                .on('keyup', function () {
                    d3.event.stopPropagation();
                    if (d3.event.keyCode == 13) {
                        this.blur();
                    } else if (d3.event.keyCode == 27) {
                        $(this).text(oldTitle);
                        this.blur();
                    }

                    if (!$(this).is(':focus')) return;

                    if (handlers.keyDown) {
                        handlers.keyDown.call(self, d, d3.event.keyCode, this);
                    }
                    var $this = $(this);
                    if (handlers.update) {
                        clearTimeout(window.pendingSearch);
                        window.pendingSearch = setTimeout(function () {
                            window.pendingSearch = null;
                            var newText = $this.val();
                            if (newText === this.textContent) return;
                            this.textContent = newText;
                            handlers.update.call(self, d, newText);
                        }, 250);
                    }
                    if (constraint) {
                        var constraintResult = constraint.call(this, d, $this.val()) ? true : false;
                        d3node.attr('data-valid', constraintResult);
                        if (errorClass) {
                            d3node.classed(errorClass, !constraintResult);
                            input.classed(errorClass, !constraintResult);
                        }
                    }
                })
                .on('blur', function () {
                    var text = $(this).val();
                    this.textContent = null;
                    d3.select(this).remove();
                    d3node.selectAll('text').style('display', null);
                    clearTimeout(window.pendingSearch);
                    if (editClass) {
                        d3node.classed(editClass, false);
                    }
                    if (errorClass) {
                        d3node.classed(errorClass, false);
                    }
                    var valid = d3node.attr('data-valid') == 'true';
                    if (handlers.done) {
                        handlers.done.call(self, d, text, d3node.attr('data-valid') == 'true');
                    }
                });

            $('#extraUniqueIdToPutOnEditingTextElementSoThatItIsDefinitelyUnique')
                .select();

            if (handlers.start) {
                handlers.start.call(self, d);
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
