(function () {
    d3.selection.prototype.child = function (selector) {
        return d3.select(this.children(selector)[0][0]);
    };
})();
