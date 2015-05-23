from ironcat.photon_types import *
from ironcat.photon import Photon, deserialize
from ironcat.models import *
import json
import math
from functools import reduce


math_2_1 = {
    'inputs': [
        {
            'name': 'x',
            'types': [PhotonTypes.number],
            'value': {
                'type': PhotonTypes.number,
                'value': '1'
            }
        },
        {
            'name': 'y',
            'types': [PhotonTypes.number],
            'value': {
                'type': PhotonTypes.number,
                'value': '1'
            }
        }
    ],
    'outputs': [
        {
            'name': 'result',
            'types': [PhotonTypes.number]
        }
    ]
}
math_1_1 = {
    'inputs': [
        {
            'name': 'x',
            'types': [PhotonTypes.number],
            'value': {
                'type': PhotonTypes.number,
                'value': 1
            }
        }
    ],
    'outputs': [
        {
            'name': 'result',
            'types': [PhotonTypes.number]
        }
    ]
}

_primitives = {
    '+': math_2_1,
    '-': math_2_1,
    '*': math_2_1,
    '/': math_2_1,
    '^': math_2_1,
    'sin': math_1_1,
    'cos': math_1_1,
    'tan': math_1_1,
    'asin': math_1_1,
    'acos': math_1_1,
    'atan': math_1_1,
    'atan2': math_2_1,
    'get': math_1_1,
    'set': math_1_1,
    'to list': {
        'inputs': [
            {
                'name': 'collection',
                'types': collection_types,
                'value': {
                    'type': PhotonTypes.list,
                    'value': '[]'
                }
            }
        ],
        'outputs': [
            {
                'name': 'list',
                'types': [PhotonTypes.list]
            }
        ]
    },
    'concatenate': {
        'inputs': [
            {
                'name': 'string 1',
                'types': [PhotonTypes.string],
                'value': {
                    'type': PhotonTypes.string,
                    'value': ''
                }
            },
            {
                'name': 'string 2',
                'types': [PhotonTypes.string],
                'value': {
                    'type': PhotonTypes.string,
                    'value': ''
                }
            }
        ],
        'outputs': [
            {
                'name': 'result',
                'types': [PhotonTypes.string]
            }
        ]
    },
    'map': {
        'inputs': [
            {
                'name': 'collection',
                'types': collection_types,
                'value': {
                    'type': PhotonTypes.list,
                    'value': '[]'
                }
            },
            {
                'name': 'function',
                'types': [PhotonTypes.function],
                'value': {
                    'type': PhotonTypes.function,
                    'value': 'sin'
                }
            }
        ],
        'outputs': [
            {
                'name': 'result',
                'types': collection_types
            }
        ]
    },
    'reduce': {
        'inputs': [
            {
                'name': 'collection',
                'types': collection_types,
                'value': {
                    'type': PhotonTypes.list,
                    'value': '[]'
                }
            },
            {
                'name': 'function',
                'types': [PhotonTypes.function],
                'value': {
                    'type': PhotonTypes.function,
                    'value': '+'
                }
            },
            {
                'name': 'initial',
                'types': valid_types,
                'value': {
                    'type': PhotonTypes.number,
                    'value': '0'
                }
            }
        ],
        'outputs': [
            {
                'name': 'result',
                'types': collection_types
            }
        ]
    },
    'evaluate': {
        'inputs': [
            {
                'name': 'function',
                'types': [PhotonTypes.function],
                'value': {
                    'type': PhotonTypes.function,
                    'value': 'sin'
                }
            },
            {
                'name': 'inputs',
                'types': [PhotonTypes.list],
                'value': {
                    'type': PhotonTypes.list,
                    'value': '[{"type":3,"value":"1"}]'
                }
            }
        ],
        'outputs': [
            {
                'name': 'outputs',
                'types': [PhotonTypes.list]
            }
        ]
    }
}


def get_function(name):
    try:
        return Function.objects.get(name=name)
    except Function.DoesNotExist:
        if name in _primitives:
            io = _primitives[name]
            function = Function(name=name,
                                inputs_json=json.dumps(io['inputs']),
                                outputs_json=json.dumps(io['outputs']),
                                primitive=True)
            function.save()
            return function
        else:
            raise


def evaluate_function(function, inputs):

    error = [Photon.error]

    if isinstance(function, Function) and function.name in _primitives:
        function = function.name

    if type(function) is str:

        get_function(function)

        if function == '+':
            if any(ph.type != PhotonTypes.number for ph in inputs):
                return error
            input_values = [ph.raw for ph in inputs]
            result = sum(input_values)
            return [Photon(result)]
        elif function == '-':
            if len(inputs) != 2:
                return error
            px = inputs[0]
            py = inputs[1]
            if px.type != PhotonTypes.number or py.type != PhotonTypes.number:
                return error
            x = float(px.value)
            y = float(py.value)
            result = x - y
            return [Photon(result)]
        elif function == '*':
            if any(ph.type != PhotonTypes.number for ph in inputs):
                return error
            values = [ph.raw for ph in inputs]
            result = reduce(lambda a, b: a * b, values, 1)
            return [Photon(result)]
        elif function == '/':
            if len(inputs) != 2:
                return error
            px = inputs[0]
            py = inputs[1]
            if px.type != PhotonTypes.number or py.type != PhotonTypes.number:
                return error
            x = px.raw
            y = py.raw
            result = x / y
            return [Photon(result)]
        elif function == '^':
            if len(inputs) != 2:
                return error
            px = inputs[0]
            py = inputs[1]
            if px.type != PhotonTypes.number or py.type != PhotonTypes.number:
                return error
            x = px.raw
            y = py.raw
            result = x ** y
            return [Photon(result)]
        elif function == 'sin':
            if len(inputs) != 1:
                return error
            px = inputs[0]
            if px.type != PhotonTypes.number:
                return error
            x = px.raw
            result = math.sin(x)
            return [Photon(result)]
        elif function == 'cos':
            if len(inputs) != 1:
                return error
            px = inputs[0]
            if px.type != PhotonTypes.number:
                return error
            x = px.raw
            result = math.cos(x)
            return [Photon(result)]
        elif function == 'tan':
            if len(inputs) != 1:
                return error
            px = inputs[0]
            if px.type != PhotonTypes.number:
                return error
            x = px.raw
            result = math.tan(x)
            return [Photon(result)]
        elif function == 'asin':
            if len(inputs) != 1:
                return error
            px = inputs[0]
            if px.type != PhotonTypes.number:
                return error
            x = px.raw
            result = math.asin(x)
            return [Photon(result)]
        elif function == 'acos':
            if len(inputs) != 1:
                return error
            px = inputs[0]
            if px.type != PhotonTypes.number:
                return error
            x = px.raw
            result = math.acos(x)
            return [Photon(result)]
        elif function == 'atan':
            if len(inputs) != 1:
                return error
            px = inputs[0]
            if px.type != PhotonTypes.number:
                return error
            x = px.raw
            result = math.atan(x)
            return [Photon(result)]
        elif function == 'atan2':
            if len(inputs) != 2:
                return error
            py = inputs[0]
            px = inputs[1]
            if px.type != PhotonTypes.number or py.type != PhotonTypes.number:
                return error
            x = px.raw
            y = py.raw
            result = math.atan2(y, x)
            return [Photon(result)]
        elif function == 'get':
            if len(inputs) != 2:
                return error
            ph_col = inputs[0]
            ph_key = inputs[1]
            if ph_key.type == PhotonTypes.number:
                if not ph_col.is_indexable:
                    return error
                result = ph_col.raw[int(ph_key.raw)]
            elif ph_key.type == PhotonTypes.string:
                if not ph_col.is_keyable:
                    return error
                result = ph_col.raw[ph_key.raw]
            else:
                return error
            return [Photon(result)]
        elif function == 'set':
            if len(inputs) != 3:
                return error
            ph_col = inputs[0]
            ph_key = inputs[1]
            ph_value = inputs[2]
            if ph_key.type == PhotonTypes.number:
                if not ph_col.is_indexable:
                    return error
                col = ph_col.raw
                col[int(ph_key.raw)] = ph_value
                col = Photon(col).raw
            elif ph_key.type == PhotonTypes.string:
                if not ph_col.is_keyable:
                    return error
                col = ph_col.raw
                col[ph_key.raw] = ph_value
                col = Photon(col).raw
            else:
                return error
            return [Photon(col)]
        elif function == 'to list':
            if len(inputs) != 1:
                return error
            ph_col = inputs[0]
            if not ph_col.is_collection:
                return error
            if ph_col.type == PhotonTypes.set:
                result = list(ph_col.raw)
            elif ph_col.type == PhotonTypes.list:
                result = ph_col.raw
            elif ph_col.type == PhotonTypes.string:
                result = list(ph_col.raw)
            elif ph_col.type == PhotonTypes.object:
                result = list(ph_col.raw.values())
            else:
                return error
            return [Photon(result)]
        elif function == 'concatenate':
            if any(ph.type != PhotonTypes.string for ph in inputs):
                return error
            strs = [ph.raw for ph in inputs]
            result = ''.join(strs)
            return [Photon(result)]
        elif function == 'map':
            if len(inputs) != 2:
                return error
            ph_fn = inputs[0]
            ph_col = inputs[1]
            if ph_fn.type != PhotonTypes.function:
                return error
            if not ph_col.is_collection:
                return error
            fn = ph_fn.raw
            if ph_col.type == PhotonTypes.list:
                lst = ph_col.raw
                result = [evaluate_function(fn, [x])[0] for x in lst]
                return [Photon(result)]
            elif ph_col.type == PhotonTypes.set:
                st = ph_col.raw
                result = {evaluate_function(fn, [x])[0] for x in st}
                return [Photon(result)]
            elif ph_col.type == PhotonTypes.object:
                dct = ph_col.raw
                result = {key: evaluate_function(fn, [val])[0] for key, val in dct.items()}
                return [Photon(result)]
            elif ph_col.type == PhotonTypes.string:
                string = ph_col.raw
                result = [evaluate_function(fn, [c])[0] for c in string]
                return [Photon(result)]
            else:
                return error
        elif function == 'reduce':
            if len(inputs) != 3:
                return error
            ph_fn = inputs[0]
            ph_col = inputs[1]
            ph_init = inputs[2]
            if ph_fn.type != PhotonTypes.function:
                return error
            if not ph_col.is_collection:
                return error
            fn = ph_fn.raw
            col = ph_col.raw
            ph_cumulative = ph_init
            for ph in col:
                ph_cumulative = evaluate_function(fn, [ph_cumulative, ph])[0]
            return [ph_cumulative]
        elif function == 'evaluate':
            if len(inputs) < 1:
                return error
            ph_fn = inputs[0]
            ph_params = inputs[1:]
            if ph_fn.type != PhotonTypes.function:
                return error
            fn = ph_fn.raw
            result = evaluate_function(fn, ph_params)
            return result
        else:
            try:
                fn = Function.objects.get(name=function)
            except Function.DoesNotExist:
                return error

    elif type(function) is Function:
        fn = function

    else:
        return

    # evaluate net

    wire_photons = {}

    nodes = set(fn.nodes.all())

    input_connected_wires = Wire.objects.filter(source_node_id=None)
    output_connected_wires = Wire.objects.filter(target_node_id=None)

    for wire in input_connected_wires:
        wire_photons[wire.id] = inputs[wire.source_pin]

    while any(nodes):
        completed_nodes = set()
        for node in nodes:
            if any(wire.id not in wire_photons.keys() for wire in node.in_wires.all()):
                continue
            node_input_photons = []
            for wire in node.in_wires.all():
                if len(node_input_photons) <= wire.target_pin:
                    node_input_photons += [Photon()] * (wire.target_pin + 1 - len(node_input_photons))
                node_input_photons[wire.target_pin] = wire_photons[wire.id]
            node_output_photons = evaluate_node(node, node_input_photons)
            for wire in node.out_wires.all():
                wire_photons[wire.id] = node_output_photons[wire.source_pin]
            completed_nodes.add(node)
        for node in completed_nodes:
            nodes.remove(node)

    output_photons = []

    for wire in output_connected_wires:
        while len(output_photons) <= wire.target_pin:
            output_photons.append(None)
        output_photons[wire.target_pin] = wire_photons[wire.id]

    return output_photons


class IO:
    def __init__(self, input_types=None, output_types=None):
        self.input_types = input_types or []
        self.output_types = output_types or []


def get_node_io(node):
    return get_function_io(node.inner_function)


def get_function_io(fn):
    input_types = json.loads(fn.input_types_json or '[]')
    output_types = json.loads(fn.output_types_json or '[]')
    return IO(input_types, output_types)


def evaluate_node(node, inputs):
    default_inputs = deserialize(node.input_values_json or '[]')
    inputs = [x for x in inputs]
    for i in range(len(default_inputs)):
        if len(inputs) <= i:
            inputs.append(None)
        if not inputs[i] or (isinstance(inputs[i], Photon) and inputs[i].type == PhotonTypes.none):
            inputs[i] = Photon(default_inputs[i])
    return evaluate_function(node.inner_function, inputs)


def search(q):
    # Ensure that all the primitives exist before we go searching for them.
    for key in _primitives.keys():
        get_function(key)
    results = Function.objects.filter(name__icontains=q)
    results = [result for result in results if result.name.startswith(q)]
    return results


def get_function_by_id(function_id):
    return Function.objects.get(id=function_id)


def save_function(function):
    # Ensure that all the primitives exist before we go searching for them.
    for key in _primitives.keys():
        get_function(key)
    from pprint import pprint
    #pprint(function)
    inputs = function['inputs']
    outputs = function['outputs']

    if 'id' not in function or function['id'] is None or function['id'] == '':
        fn = Function(
            name=function['name'],
            description=function['description'] if 'description' in function else '',
            inputs_json=json.dumps(inputs),
            outputs_json=json.dumps(outputs),
            primitive=False)
    else:
        fn = Function.objects.get(id=function['id'])
        fn.name = function['name']
        fn.description = function['description'] if 'description' in function else ''
        fn.inputs_json = json.dumps(inputs)
        fn.outputs_json = json.dumps(outputs)
    fn.save()

    nodes = function['nodes']
    modified_nodes = [node for node in nodes if node['modified']]
    deleted_nodes = [node for node in fn.nodes.all() if node.id not in [n['id'] for n in nodes]]

    new_node_ids = {}
    for node in modified_nodes:
        fake_id = None
        if 'fakeId' in node:
            fake_id = node['fakeId']
            nd = Node(
                name=node['name'],
                containing_function_id=fn.id,
                input_values_json=json.dumps(node['inputs']),
                inner_function_id=get_function_id(node['func'])
            )
        else:
            nd = Node.objects.get(id=node['id'])
            nd.name = node['name']
            nd.input_values_json = json.dumps(node['inputs'])
            nd.inner_function_id = get_function_id(node['func'])
        nd.save()
        if fake_id is not None:
            new_node_ids[fake_id] = nd.id
    for node in deleted_nodes:
        Node.objects.get(id=node.id).delete()

    edges = function['edges']
    modified_edges = [edge for edge in edges if edge['modified']]
    deleted_edges = [edge for edge in fn.wires.all() if edge.id not in [e['id'] for e in edges]]

    new_edge_ids = {}
    for edge in modified_edges:
        fake_id = None
        if 'fakeId' in edge:
            fake_id = edge['fakeId']
            ed = Wire(
                name=edge['name'],
                containing_function_id=fn.id,
                source_node_id=(edge['sourceNode']['id'] if 'id' in edge['sourceNode'] else new_node_ids[edge['sourceNode']['fakeId']]) if 'sourceNode' in edge else None,
                source_pin=edge['sourcePin'],
                target_node_id=(edge['targetNode']['id'] if 'id' in edge['targetNode'] else new_node_ids[edge['targetNode']['fakeId']]) if 'targetNode' in edge else None,
                target_pin=edge['targetPin']
            )
        else:
            ed = Wire.objects.get(id=edge['id'])
            ed.name = edge['name']
            ed.source_node_id = (edge['sourceNode']['id'] if 'id' in edge['sourceNode'] else new_node_ids[edge['sourceNode']['fakeId']]) if 'sourceNode' in edge else None
            ed.source_pin = edge['sourcePin']
            ed.target_node_id = (edge['targetNode']['id'] if 'id' in edge['targetNode'] else new_node_ids[edge['targetNode']['fakeId']]) if 'targetNode' in edge else None
            ed.target_pin = edge['targetPin']
        ed.save()
        if fake_id is not None:
            new_edge_ids[fake_id] = ed.id
    for edge in deleted_edges:
        Wire.objects.get(id=edge.id).delete()

    return {
        'function_id': fn.id,
        'new_node_ids': new_node_ids,
        'new_edge_ids': new_edge_ids
    }

def get_function_id(func_dict):
    if 'id' in func_dict and func_dict['id'] is not None and func_dict['id'] != '':
        return func_dict['id']
    if 'name' in func_dict:
        func = Function.objects.get(name=func_dict['name'])
        return func.id
