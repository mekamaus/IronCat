(function () {
    var _idCounter = 0;
    d3.selection.prototype.clickOutside = function(callback) {
        var clicked = false;

        this.on('click.2', function() {
            clicked = true;
        });

        d3.select('body').on('click.' + ('_tempId_' + _idCounter++), function(event) {
            if (!clicked) {
                callback.call(this, parent, event);
            }
            clicked = false;
        });

        return this;
    };
})();
