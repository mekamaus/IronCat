from django.shortcuts import render
from django.http import HttpResponse
from datetime import datetime
from ironcat.models import Function, Node, Wire, Tag
import json
from django.views.decorators.csrf import ensure_csrf_cookie
import re
from django.db.models import Q
from ironcat import function_engine
import traceback
import sys
from ironcat import photon


# region helpers


def json_response(data, status=200):
    try:
        serialized_data = photon.serialize(data)
    except Exception as e:
        return json_error(e)
    result = HttpResponse(serialized_data, content_type='application/json', status=status)
    return result


def json_success(data=None, status=200):
    ob = {
        'success': True,
        'error': None
    }
    if data:
        if isinstance(data, dict):
            ob.update(data)
        else:
            ob['result'] = data
    return json_response(ob, status=status)


def json_error(e, data=None, status=200):
    error = str(e)
    print(e)
    ob = {
        'success': False,
        'error': error
    }
    if data:
        ob.update(data)
    return json_response(ob, status=status)


def delete_object(table, request):
    ob_id = request.POST['id']
    try:
        ob = table.objects.get(id=ob_id)
        ob.delete()
    except Exception as e:
        return json_error(e)
    return json_success()


def normalize_query(query_string,
                    findterms=re.compile(r'"([^"]+)"|(\S+)').findall,
                    normspace=re.compile(r'\s{2,}').sub):
    return [normspace(' ', (t[0] or t[1]).strip()) for t in findterms(query_string)]


def get_query(query_string, search_fields):
    # Query to search for every search term
    query = None
    terms = normalize_query(query_string)
    for term in terms:
        # Query to search for a given term in each field
        or_query = None
        for field_name in search_fields:
            q = Q(**{'%s__icontains'.format(field_name): term})
            or_query = or_query | q if or_query else q
        query = query & or_query if query else or_query
    return query

# endregion

# region pages


@ensure_csrf_cookie
def index(request):
    now = datetime.now
    data = {
        'now': now
    }
    return render(request, 'index.html', data)

# endregion


@ensure_csrf_cookie
def contribute(request):
    now = datetime.now
    data = {
        'now': now
    }
    return render(request, 'contribute.html', data)

# region evaluate


def evaluate(request):
    try:
        function_name = request.GET['function']
        inputs_str = request.GET['inputs']
        inputs = function_engine.deserialize(inputs_str)

        result = function_engine.evaluate_function(function_name, inputs)
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        return json_error(e)

    return json_success(result)

# endregion

# region function


def create_function(request):
    try:
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
    except Exception as e:
        return json_error(e)

    return json_success({'id': function.id})


def get_function(request):

    name = request.GET['name']

    try:
        function = function_engine.get_function(name)
    except Exception as e:
        return json_error(e)

    return json_success({'function': function})


def delete_function(request):
    return delete_object(Function, request)


def search_functions(request):
    q = request.GET['q']
    function_query = get_query(q, ['name', 'description'])
    tag_query = get_query(q, ['name'])

    try:
        functions = Function.objects.filter(function_query)
        for tag in Tag.objects.filter(tag_query):
            functions += tag.functions
    except Exception as e:
        return json_error(e, {'results': []})

    return json_success({'results': functions})

# endregion

# region node


def create_node(request):
    try:
        containing_function_id = request.POST['containingFunctionId']
        inner_function_id = request.POST['innerFunctionId']
        name = request.POST['name'] if 'name' in request.POST else None
        inner_function = Function.objects.get(id=inner_function_id)
        default_inputs_json = request.POST['defaultInputs']\
            if 'defaultInputs' in request.POST else json.dumps([None] * inner_function.input_count)
        node = Node(name=name,
                    containing_function_id=containing_function_id,
                    inner_function_id=inner_function_id,
                    default_inputs_json=default_inputs_json)
        node.save()
    except Exception as e:
        return json_error(e)
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

    try:
        # See if wire already exists.
        try:
            wire = Wire.objects.get(source_node_id=source_node_id or None,
                                    target_node_id=target_node_id or None,
                                    source_pin=source_pin,
                                    target_pin=target_pin)
        except Wire.DoesNotExist:
            try:
                wire = Wire(source_node_id=source_node_id or None,
                            target_node_id=target_node_id or None,
                            source_pin=source_pin,
                            target_pin=target_pin)
                wire.save()
            except Exception as e:
                return json_error(e)
    except Exception as e:
        return json_error(e)

    return json_success({'id': wire.id})


def delete_wire(request):
    return delete_object(Wire, request)

# endregion
