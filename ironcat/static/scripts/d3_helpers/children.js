(function () {
    d3.selection.prototype.children = function (selector) {
        var self = this;
        return self.selectAll(selector).filter(function () {
            return this.parentNode === self.node();
        });
    };
})();
