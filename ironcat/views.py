from django.shortcuts import render
from datetime import datetime
from ironcat.models import Function, Node, Wire, Tag
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from ironcat import function_engine
from ironcat.view_helpers import json_response, json_success, json_error, delete_object, get_query


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
    data = {
        'now': now
    }
    return render(request, 'contribute.html', data)


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
    return json_response({
        'suggestions': [result.name for result in results]
    })

# endregion


# region function


def save_function(request):
    function = json.loads(request.body.decode())
    result = function_engine.save_function(function)
    return json_success({'result': result})

# endregion
