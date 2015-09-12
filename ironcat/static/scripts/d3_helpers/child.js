(function () {
    d3.selection.prototype.child = function (selector) {
        return this.children(selector);
    };
})();
