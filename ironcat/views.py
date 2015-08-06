from django.shortcuts import render
from datetime import datetime
from ironcat.models import Function, Node, Wire, Tag
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from ironcat import function_engine
from ironcat.view_helpers import json_response, json_success, delete_object, get_query
from django.http import HttpResponse


# region pages


@ensure_csrf_cookie
def index(request):
    now = datetime.now
    data = {
        'now': now
    }
    return render(request, 'index.html', data)


@ensure_csrf_cookie
def contribute(request):
    now = datetime.now
    return HttpResponse("""


    <!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Contribute</title>
    <script src="/static/lib/jquery.min.js"></script>
    <script src="/static/lib/jquery.cookie.js"></script>
    <script src="/static/lib/bootstrap/js/bootstrap.min.js"></script>
    <script src="/static/lib/bootstrap/js/bootstrap-select.min.js"></script>
    <script src="/static/lib/jquery.autocomplete.min.js"></script>
    <script src="https://gitcdn.github.io/bootstrap-toggle/2.2.0/js/bootstrap-toggle.min.js"></script>
    <script src="/static/lib/d3.min.js"></script>
    <script src="/static/scripts/draw_helpers.js"></script>
    <script src="/static/lib/jquery.debounce.min.js"></script>
    <script src="/static/scripts/start.js"></script>
    <script src="/static/scripts/d3_helpers/children.js"></script>
    <script src="/static/scripts/d3_helpers/child.js"></script>
    <script src="/static/scripts/d3_helpers/contains_child.js"></script>
    <script src="/static/scripts/d3_helpers/click.js"></script>
    <script src="/static/scripts/d3_helpers/click_outside.js"></script>
    <script src="/static/scripts/d3_helpers/selectable.js"></script>
    <script src="/static/scripts/d3_helpers/move_to_front.js"></script>
    <script src="/static/scripts/d3_helpers/edit_text.js"></script>
    <script src="/static/scripts/d3_helpers/click_to_edit.js"></script>
    <script src="/static/scripts/d3_helpers/value_editor.js"></script>
    <script src="/static/scripts/nodes.js"></script>
    <link rel="stylesheet" href="/static/lib/bootstrap/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="/static/lib/bootstrap/css/bootstrap-custom.min.css"/>
    <link rel="stylesheet" href="/static/lib/bootstrap/css/bootstrap-select.min.css" />
    <link href="https://gitcdn.github.io/bootstrap-toggle/2.2.0/css/bootstrap-toggle.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/static/lib/font-awesome/css/font-awesome.min.css"/>
    <link href="/static/css/styles.css" rel="stylesheet"/>
    {% block include %}{% endblock %}
</head>
<body>
    {% block requires %}{% endblock %}
    <div class="container"><nav class="navbar navbar-default editor-toolbar">
        <div class="container-fluid">
            <div>
                <ul class="nav navbar-nav">
                    <li><a class="function-name"></a></li>
                </ul>
            </div>
        </div>
    </nav>
    <svg class="editor">
        <defs>
            <g id="addSymbol">
                <rect x="-6" y="-2" rx="1" ry="1" width="12" height="4" style="fill: #ffffff;"></rect>
                <rect x="-2" y="-6" rx="1" ry="1" width="4" height="12" style="fill: #ffffff;"></rect>
            </g>
            <g id="removeSymbol" transform="rotate(45)">
                <rect x="-6" y="-2" rx="1" ry="1" width="12" height="4" style="fill: #ffffff;"></rect>
                <rect x="-2" y="-6" rx="1" ry="1" width="4" height="12" style="fill: #ffffff;"></rect>
            </g>
            <g id="noneType">
                <circle r="6" style="fill: none; stroke-width: 3; stroke: #ffffff"></circle>
                <rect transform="rotate(-45)translate(-6, -1.5)" width="12" height="3" style="fill: #ffffff;"></rect>
            </g>
            <g id="errorType">
                <polygon points="0 -6 -6 4 6 4" stroke-linejoin="round" stroke-width="2" stroke="#ffffff" fill="#ffffff"/>
                <text y="1" text-anchor="middle" dominant-baseline="middle" style="font-size: 11px; font-weight: 900; fill: #000000;">!</text>
            </g>
            <g id="stringType">
                <text y="1" text-anchor="middle" dominant-baseline="middle" style="font-size: 12px; fill: #ffffff;">Aa</text>
            </g>
            <g id="numberType" transform="scale(1.5)">
                <text y="1" text-anchor="middle" dominant-baseline="middle" style="font-size: 12px; fill: #ffffff;">π</text>
            </g>
            <g id="booleanType">
                <path d="M6,0 A 6,6 0 0,1 -6,0 Z" fill="white"/>
                <circle r="6" stroke-width="3" stroke="white" fill="none"/>
            </g>
            <g id="objectType">
                <polygon points="0 0 -6 -3 -6 3 0 6" fill="white"/>
                <polygon points="0 -6 -6 -3 -6 3 0 6 6 3 6 -3" style="stroke-width: 2; stroke: #ffffff; stroke-linejoin: round; fill: none;"/>
            </g>
            <g id="setType">
                <circle r="6" stroke-width="3" fill="none" stroke="white"/>
                <circle r="1" fill="white" transform="translate(-2, -1)"/>
                <circle r="1" fill="white" transform="translate(2, -1)"/>
                <circle r="1" fill="white" transform="translate(0, 2)"/>
            </g>
            <g id="listType">
                <rect width="12" height="3" rx="1" ry="1" x="-6" y="-6" style="fill: #ffffff;"></rect>
                <rect width="12" height="3" rx="1" ry="1" x="-6" y="-1.5" style="fill: #ffffff;"></rect>
                <rect width="12" height="3" rx="1" ry="1" x="-6" y="3" style="fill: #ffffff;"></rect>
            </g>
            <g id="functionType">
                <polygon points="-3 -5 3 0 -3 5" style="stroke: #ffffff; fill: #ffffff;"/>
                <line x1="-6" y1="0" x2="6" y2="0" style="stroke-width: 2; stroke: #ffffff;"/>
            </g>
            <filter id="borderGlow" height="130%" width="130%">
                <feGaussianBlur in="StrokePaint" stdDeviation="8" result="blur"/>
                <feMorphology in="blur" operator="dilate" radius="8" result="dilatedBlur"/>
                <feMorphology in="dilatedBlur" operator="erode" radius="3" result="erodedDilatedBlur"/>
                <feMerge>
                    <feMergeNode in="erodedDilatedBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    </svg>
    </div>
</body>
</html>






""")


@ensure_csrf_cookie
def use(request):
    data = {}
    return render(request, 'use.html', data)

# endregion

# region evaluate


def evaluate(request):
    function_name = request.GET['function']
    inputs_str = request.GET['inputs']
    inputs = function_engine.deserialize(inputs_str)
    result = function_engine.evaluate_function(function_name, inputs)

    return json_success(result)

# endregion

# region function


def create_function(request):
    name = request.POST['name']
    description = request.POST['description'] if 'description' in request.POST else ''
    input_types_json = json.dumps(request.POST['input_types' + '[]'])
    output_types_json = json.dumps(request.POST['output_types' + '[]'])
    if not Function.objects.filter(name=name,
                                   description=description,
                                   input_types_json=input_types_json,
                                   output_types_json=output_types_json,
                                   primitive=False).exists():
        function = Function(name=name,
                            description=description,
                            input_types_json=input_types_json,
                            output_types_json=output_types_json,
                            primitive=False)
        function.save()
    else:
        function = Function.objects.get(name=name,
                                        description=description,
                                        input_types_json=input_types_json,
                                        output_types_json=output_types_json,
                                        primitive=False)

    return json_success({'id': function.id})


def get_function(request):
    if 'name' in request.GET:
        name = request.GET['name']
        function = function_engine.get_function(name)
        return json_success({'function': function})
    elif 'id' in request.GET:
        function_id = request.GET['id']
        results = function_engine.get_function_by_id(function_id)
        return json_success({'results': results})


def delete_function(request):
    return delete_object(Function, request)


def search_functions(request):
    q = request.GET['q']
    function_query = get_query(q, ['name', 'description'])
    tag_query = get_query(q, ['name'])

    functions = Function.objects.filter(function_query)
    for tag in Tag.objects.filter(tag_query):
        functions += tag.functions

    return json_success({'results': functions})

# endregion

# region node


def create_node(request):
    containing_function_id = request.POST['containingFunctionId']
    inner_function_id = request.POST['innerFunctionId']
    name = request.POST['name'] if 'name' in request.POST else None
    inner_function = Function.objects.get(id=inner_function_id)
    input_values_json = request.POST['defaultInputs']\
        if 'defaultInputs' in request.POST else json.dumps([None] * inner_function.input_count)
    node = Node(name=name,
                containing_function_id=containing_function_id,
                inner_function_id=inner_function_id,
                input_values_json=input_values_json)
    node.save()
    return json_success({'id': node.id})


def delete_node(request):
    return delete_object(Node, request)

# endregion

# region wire


def create_wire(request):
    source_node_id = request.POST['sourceNodeId'] if 'sourceNodeId' in request.POST else None
    target_node_id = request.POST['targetNodeId'] if 'targetNodeId' in request.POST else None
    source_pin = request.POST['sourcePin'] if 'sourcePin' in request.POST else None
    target_pin = request.POST['targetPin'] if 'targetPin' in request.POST else None

    # See if wire already exists.
    try:
        wire = Wire.objects.get(source_node_id=source_node_id or None,
                                target_node_id=target_node_id or None,
                                source_pin=source_pin,
                                target_pin=target_pin)
    except Wire.DoesNotExist:
        wire = Wire(source_node_id=source_node_id or None,
                    target_node_id=target_node_id or None,
                    source_pin=source_pin,
                    target_pin=target_pin)
        wire.save()

    return json_success({'id': wire.id})


def delete_wire(request):
    return delete_object(Wire, request)

# endregion

# region search


def search(request):
    q = request.GET['q']
    results = function_engine.search(q)
    return json_success({'results': results})


def search_autocomplete(request):
    q = request.GET['query']
    results = function_engine.search(q)
    return json_response({'suggestions': [result.name for result in results]})

# endregion


# region function


def save_function(request):
    function = json.loads(request.body.decode())
    result = function_engine.save_function(function)
    return json_success({'result': result})

# endregion
