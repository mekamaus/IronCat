(function() {
    // CSRF protection
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
            }
        }
    });

    $(function() {
        /*
        $.get('get_function/', { name: '*' }).success(function(result) {
            var timesFunctionId = result.id;
            $.get('get_function/', { name: '+' }).success(function(result) {
                var plusFunctionId = result.id;
                $.get('get_function/', { name: '^' }).success(function(result) {
                    var powFunctionId = result.id;
                    $.get('get_function/', { name: 'atan2' }).success(function(result) {
                        var atan2FunctionId = result.id;
                        $.post('create_function/', {
                            name: 'rectangular to polar',
                            description: 'Converts rectangular to polar coordinates.',
                            input_types: ['float', 'float'],
                            output_types: ['float', 'float']
                        }).success(function (result) {
                            var containingFunctionId = result.id;
                            $.post('create_node/', {
                                containingFunctionId: containingFunctionId,
                                innerFunctionId: timesFunctionId
                            }).success(function (result) {
                                var times1NodeId = result.id;
                                $.post('create_node/', {
                                    containingFunctionId: containingFunctionId,
                                    innerFunctionId: timesFunctionId
                                }).success(function (result) {
                                    var times2NodeId = result.id;
                                    $.post('create_node/', {
                                        containingFunctionId: containingFunctionId,
                                        innerFunctionId: plusFunctionId
                                    }).success(function (result) {
                                        var plusNodeId = result.id;
                                        $.post('create_node/', {
                                            containingFunctionId: containingFunctionId,
                                            innerFunctionId: powFunctionId,
                                            defaultInputs: JSON.stringify([
                                                {
                                                    value: '0',
                                                    type: 3
                                                },
                                                {
                                                    value: '0.5',
                                                    type: 3
                                                }
                                            ])
                                        }).success(function (result) {
                                            var powNodeId = result.id;
                                            $.post('create_node/', {
                                                containingFunctionId: containingFunctionId,
                                                innerFunctionId: atan2FunctionId
                                            }).success(function (result) {
                                                var atan2NodeId = result.id;
                                                $.post('create_wire/', {
                                                    sourceNodeId: null,
                                                    sourcePin: 0,
                                                    targetNodeId: times1NodeId,
                                                    targetPin: 0
                                                }).success(function() {
                                                    $.post('create_wire/', {
                                                        sourceNodeId: null,
                                                        sourcePin: 0,
                                                        targetNodeId: times1NodeId,
                                                        targetPin: 1
                                                    }).success(function() {
                                                        $.post('create_wire/', {
                                                            sourceNodeId: null,
                                                            sourcePin: 1,
                                                            targetNodeId: times2NodeId,
                                                            targetPin: 0
                                                        }).success(function() {
                                                            $.post('create_wire/', {
                                                                sourceNodeId: null,
                                                                sourcePin: 1,
                                                                targetNodeId: times2NodeId,
                                                                targetPin: 1
                                                            }).success(function() {
                                                                $.post('create_wire/', {
                                                                    sourceNodeId: times1NodeId,
                                                                    sourcePin: 0,
                                                                    targetNodeId: plusNodeId,
                                                                    targetPin: 0
                                                                }).success(function() {
                                                                    $.post('create_wire/', {
                                                                        sourceNodeId: times2NodeId,
                                                                        sourcePin: 0,
                                                                        targetNodeId: plusNodeId,
                                                                        targetPin: 1
                                                                    }).success(function() {
                                                                        $.post('create_wire/', {
                                                                            sourceNodeId: plusNodeId,
                                                                            sourcePin: 0,
                                                                            targetNodeId: powNodeId,
                                                                            targetPin: 0
                                                                        }).success(function() {
                                                                            $.post('create_wire/', {
                                                                                sourceNodeId: powNodeId,
                                                                                sourcePin: 0,
                                                                                targetNodeId: null,
                                                                                targetPin: 0
                                                                            }).success(function() {
                                                                                $.post('create_wire/', {
                                                                                    sourceNodeId: null,
                                                                                    sourcePin: 0,
                                                                                    targetNodeId: atan2NodeId,
                                                                                    targetPin: 1
                                                                                }).success(function() {
                                                                                    $.post('create_wire/', {
                                                                                        sourceNodeId: null,
                                                                                        sourcePin: 1,
                                                                                        targetNodeId: atan2NodeId,
                                                                                        targetPin: 0
                                                                                    }).success(function() {
                                                                                        $.post('create_wire/', {
                                                                                            sourceNodeId: atan2NodeId,
                                                                                            sourcePin: 0,
                                                                                            targetNodeId: null,
                                                                                            targetPin: 1
                                                                                        }).success(function() {
                                                                                            var inputs = [
                                                                                                {
                                                                                                    value: '1',
                                                                                                    type: 3
                                                                                                },
                                                                                                {
                                                                                                    value: '2',
                                                                                                    type: 3
                                                                                                }
                                                                                            ];
                                                                                            var inputsStr = JSON.stringify(inputs);
                                                                                            $.get('evaluate/', {
                                                                                                function: 'rectangular to polar',
                                                                                                inputs: inputsStr
                                                                                            }).success(function(result) {
                                                                                                console.log(result);
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
        */
    });
})();
