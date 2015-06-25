(function () {
    d3.selection.prototype.clickOutside = function(callback) {
        var clicked = false;

        this.on('click', function() {
            clicked = true;
        });

        d3.select('body').on('click', function(event) {
            if (!clicked) {
                callback(parent, event);
            }
            clicked = false;
        });

        return this;
    };
    d3.selection.prototype.editText = function (options, d, i) {
        options = options || {};
        var handlers = options.handlers || {};
        var width = options.width;
        var align = options.align;
        var editClass = options.editClass || 'edit';
        var errorClass = options.errorClass || 'error';
        var zoom = window.editorZoom || 1;
        var constraint = options.constraint;
        return this.each(function () {
            var self = this;
            var d3node = d3.select(self);

            var text = d3node.select('text');
            var oldTitle = text.text();

            // If text is empty, insert an invisible hyphen to correct the top position.
            text.text(oldTitle || '&#173;');

            var htmlEl = text.node();
            var nodeBCR = htmlEl.getBoundingClientRect();

            d3node.select('text').style('display', 'none');

            if (editClass) {
                d3node.classed(editClass, true);
            }

            // just testing this for now
            if (d.value && d.value.type === 7) {

                // try this value to test list
                // [{"type":3,"value":"1"},{"type":3,"value": "2"},{"type":3,"value":"3"},{"type":3,"value":"4"}]
                var list = JSON.parse(d.value.value);

                var editList = d3.select(self).selectAll('g.list-edit').data([1]);

                var newEditList = editList.enter()
                    .append('g')
                    .classed('list-edit', true)
                    .attr('transform', translate(-10, 0))
                    .clickOutside(function () {
                        console.log('clicked outside');
                    });

                var addBtn = newEditList.append('g')
                    .classed('add-btn', true);

                addBtn.attr('transform', translate(0, list.length * 20))
                    .append('circle')
                    .attr('r', 10)
                    .attr('fill', 'white')
                    .on('click', function () {
                        console.log(list);
                        list.push({
                            "type": 3,
                            "value": "1"
                        });
                        d.value.value = JSON.stringify(list);
                        update();
                    });

                function update() {

                    var listItemElements = editList.selectAll('g.list-item-edit').data(list);

                    var newListItemElements = listItemElements.enter()
                        .append('g')
                        .classed('list-item-edit', true);

                    newListItemElements
                        .attr('transform', function (d, i) {
                            return translate(0, i * 20);
                        })
                        .append('text')
                        .style('fill', '#ffffff')
                        .text(function (d) {
                            return d.value;
                        })
                        .attr('text-anchor', 'end')
                        .attr('dominant-baseline', 'middle');

                    listItemElements.select('text')
                        .text(function (d) {
                            return d.value;
                        });

                    addBtn.attr('transform', translate(0, list.length * 20));

                    newListItemElements.clickToEdit({
                        width: 64,
                        handlers: {
                            done: function (d, i, value) {
                                d.type = 2;
                                d.value = value;
                                update();
                            }
                        }
                    });
                }

                update();

                return;
            }

            // replace with editable text
            var fontSize = parseInt(text.style('font-size'));
            var y = nodeBCR.top - nodeBCR.height / 2 + 0.5 * fontSize * zoom;
            var w = (width || nodeBCR.width) * zoom;
            var textAlign = align || text.attr('text-anchor') || 'left';
            textAlign = (textAlign === 'middle') ? 'center' : (textAlign === 'start') ? 'left' : (textAlign === 'end') ? 'right' : textAlign;
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
                .style('left', (
                    textAlign === 'left'
                        ? nodeBCR.left :
                    textAlign === 'center'
                        ? (nodeBCR.left + nodeBCR.right) / 2 - w / 2 :
                        nodeBCR.right - w) + 'px')
                .style('top', y + 'px')
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

                    if (handlers.keyPress) {
                        handlers.keyPress.call(self, d, i, d3.event.keyCode, this);
                    }
                    var $this = $(this);
                    if (handlers.update) {
                        clearTimeout(window.pendingSearch);
                        window.pendingSearch = setTimeout(function () {
                            window.pendingSearch = null;
                            var newText = $this.val();
                            if (newText === this.textContent) return;
                            this.textContent = newText;
                            handlers.update.call(self, d, i, newText);
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
                    if (window.preventEditableBlur) {
                        window.preventEditableBlur = false;
                        $(this).focus();
                        return;
                    }
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
                        handlers.done.call(self, d, i, text, d3node.attr('data-valid') == 'true');
                    }
                });

            var elem = $('#extraUniqueIdToPutOnEditingTextElementSoThatItIsDefinitelyUnique');

            elem.select();

            if (handlers.start) {
                handlers.start.call(self, d, i);
            }
        });
    };
    d3.selection.prototype.clickToEdit = function (options) {
        return this.each(function (d, i) {
            d3.select(this).on('click', function () {
                d3.select(this).editText(options, d, i);
            });
        });
    };
    d3.selection.prototype.moveToFront = function () {
        return this.each(function () {
            this.parentNode.appendChild(this);
        });
    };
})();
