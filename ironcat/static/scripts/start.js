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
var x = {
    "nodes":
        [
            {
                "title": "new concept",
                "id": 0,
                "x": 679.8287048339844,
                "y": 211.70846557617188
            },
            {
                "title": "new concept",
                "id": 1,
                "x": 387.9604187011719,
                "y": 199.15106201171875
            }
        ],
    "edges": [
        {
            "source": 1,
            "target": 0
        }
    ]
};

/*// Make content such as forms and hashtag links work
function activateContent() {

    var hashtagRegex = new RegExp($('#top-posts').attr('data-hashtag_regex'), 'ig');
    var watchedHashtags = $('#top-posts').attr('data-watched_hashtags').split(' ');
    $('.post-text').each(function() {
        // Turn hashtags into links
        var text = $(this).text().replace(hashtagRegex, '$1<a title="$3" class="hashtag-link" href="/search/?q=%23$3">$2$3</a>');
        $(this).html(text);
    });

    // Make hashtag links work
    var hashtagLinks = $('.hashtag-link');
    hashtagLinks.each(function() {
        var hashtag = $(this).attr('title');
        var tooltip = null;
        if($.inArray(hashtag, watchedHashtags) >= 0) {
            $(this).addClass('active');
            tooltip = $('<a href="javascript:void(0)" class="btn btn-hashtag-watch unwatch" data-hashtag="' + hashtag + '">Unwatch #' + hashtag + '</a>');
        } else {
            $(this).removeClass('active');
            tooltip = $('<a href="javascript:void(0)" class="btn btn-hashtag-watch" data-hashtag="' + hashtag + '">Watch #' + hashtag + '</a>');
        }
        $(this).data('powertipjq', tooltip);
    });
    hashtagLinks.powerTip({
        placement: 'n',
        mouseOnToPopup: true
    });

    $('form.ajax').ajaxForm(function(data) {
        $('#top-posts').html($(data).find('#top-posts').html());
        $('#top-posts').attr('data-watched_hashtags', $(data).find('#top-posts').attr('data-watched_hashtags'));
        activateContent();
    });
}

// Refresh posts
function refreshPosts() {
    $.ajax({
        url: '',
        type: 'get',
        success: refreshSuccess
    });
}

function refreshSuccess(data) {
    // Only refresh if this is a posts page
    if($('#top-posts').length) {
        // Don't refresh if a reply form is open
        if(!$('.reply-form').filter(function() { return $(this).css('display') != 'none'; }).length) {
            $('#top-posts').html($(data).find('#top-posts').html());
            $('#top-posts').attr('data-watched_hashtags', $(data).find('#top-posts').attr('data-watched_hashtags'));
            activateContent();
        }
    }
}*/



