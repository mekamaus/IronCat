(function () {
    var fnName = '';
    var inputsData = [];
    function updateForm() {
        $.when($.getJSON('/get_function/', {name: fnName})).then(function (result) {
            inputsData = result.function.inputs;
            var inputs = d3.select('#input .inputs-list').selectAll('.input').data(inputsData);
            var newInputs = inputs.enter()
                .append('div').classed('input', true);
            newInputs.append('select')
                .attr('id', function (d, i) {
                    return 'inputTypeSelect' + i;
                })
                .attr('name', function (d, i) {
                    return 'inputTypeSelect' + i;
                })
                .classed('input-type-select', true);
            newInputs.append('input')
                .attr('id', function (d, i) {
                    return 'inputValue' + i;
                })
                .attr('name', function (d, i) {
                    return 'inputValue' + i;
                })
                .attr('data-index', function (d, i) {
                    return i;
                })
                .classed('input-value', true);
            inputs.exit()
                .remove();

            var options = inputs.select('select').selectAll('option').data(
                function (d) { return d.types; },
                function (d) { return d; });

            options.enter()
                .append('option')
                .text(function (d) { return d; });

            options.exit()
                .remove();
        });
    }

    function arrayCopy(array) {
        var newArray = [];
        for (var i = 0; i < array.length; i++) {
            newArray.push(array[i]);
        }
        return newArray;
    }

    $(function () {
        $('#functionName').autocomplete({
            serviceUrl: '/search_autocomplete/',
            onSelect: function (suggestion) {
                fnName = suggestion.value;
                updateForm();
            }
        });
        $('.submit').click(function () {
            var inputValues = arrayCopy($('.input-value').map(function(i, d) {
                var $d = $(d);
                var index = $d.attr('data-index');
                var type = parseInt($('#inputTypeSelect' + i).val());
                return {
                    type: type,
                    value: $d.val()
                };
            }));
            var evaluateData = {
                function: fnName,
                inputs: JSON.stringify(inputValues)
            };
            $.when($.getJSON('/evaluate/', evaluateData)).then(function (result) {
                if (result.error) {
                    console.error(result.error);
                    return;
                }

                var results = d3.select('#output').selectAll('.result').data(result.result, function (d) {
                    return d.type + ':' + d.value;
                });

                var newResults = results.enter()
                    .append('div')
                    .classed('result', true);

                newResults.append('div')
                    .classed('type', true)
                    .text(function(d) { return d.type; });

                newResults.append('div')
                    .classed('value', true)
                    .text(function (d) { return d.value; });

                results.exit()
                    .remove();
            });
        });
    });
})();
