(function () {
    d3.selection.prototype.clickToEdit = function (options) {
        return this.each(function (d, i) {
            d3.select(this).on('click', function () {
                d3.select(this).editText(options, d, i);
            });
        });
    };
})();
