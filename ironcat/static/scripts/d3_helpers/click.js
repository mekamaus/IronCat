(function () {
    d3.selection.prototype.click = function (handler) {
        return this.on('click', handler);
    };
})();
