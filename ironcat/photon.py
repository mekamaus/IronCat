from ironcat.photon_types import *
from ironcat.frozendict import frozendict
from ironcat.models import Function
import json


class Photon:

    def __init__(self, value=None, force_type=None, error=False):
        if force_type:
            self.value = str(value)
            self.type = force_type
        else:
            if error:
                self.value = None
                self.type = PhotonTypes.error
            else:
                if isinstance(value, Photon):
                    self.value = value.value
                    self.type = value.type
                elif isinstance(value, list):
                    self.value = serialize([Photon(x) for x in value])
                    self.type = PhotonTypes.list
                elif isinstance(value, set) or isinstance(value, frozenset):
                    self.value = serialize(frozenset(Photon(x) for x in value))
                    self.type = PhotonTypes.set
                elif isinstance(value, dict) or isinstance(value, frozendict):
                    self.value = serialize([[k, Photon(v)] for k, v in value.items()])
                    self.type = PhotonTypes.object
                elif isinstance(value, int) or isinstance(value, float):
                    self.value = str(value)
                    self.type = PhotonTypes.number
                elif isinstance(value, str):
                    self.value = value
                    self.type = PhotonTypes.string
                elif isinstance(value, bool):
                    self.value = str(int(value))
                    self.type = PhotonTypes.bool
                else:
                    self.value = None
                    self.type = PhotonTypes.none

    def __str__(self):
        return '{0} ({1})'.format(self.value, PhotonTypes(self.type).name)

    @property
    def raw(self):
        if self.type == PhotonTypes.list:
            return deserialize(self.value)
        if self.type == PhotonTypes.function:
            return self.value
        if self.type == PhotonTypes.number:
            return float(self.value)
        if self.type == PhotonTypes.error:
            return None
        if self.type == PhotonTypes.bool:
            return bool(int(self.value))
        if self.type == PhotonTypes.none:
            return None
        if self.type == PhotonTypes.object:
            return {key: value for [key, value] in deserialize(self.value)}
        if self.type == PhotonTypes.set:
            return frozenset(deserialize(self.value))
        if self.type == PhotonTypes.string:
            return self.value

    @property
    def raw_recursive(self):
        raw = self.raw
        if self.type == PhotonTypes.list:
            return [x.raw_recursive for x in raw]
        if self.type == PhotonTypes.set:
            return {x.raw_recursive for x in raw}
        if self.type == PhotonTypes.object:
            return {key: value.raw_recursive for key, value in raw.items()}
        return raw

    def __eq__(self, other):
        if not isinstance(other, Photon):
            other = Photon(other)
        if self.type != other.type:
            return False
        return self.raw == other.raw

    def __hash__(self):
        return self.raw.__hash__()

    @staticmethod
    @property
    def error():
        return Photon(error=True)

    @property
    def is_valid(self):
        return self.type in valid_types

    @property
    def is_collection(self):
        return self.type in collection_types

    @property
    def is_indexable(self):
        return self.type in indexable_types

    @property
    def is_keyable(self):
        return self.type in keyable_types


def json_encoder_default(o):
    if isinstance(o, Function):
        return {
            'name': o.name,
            'description': o.description,
            'inputs': json.loads(o.inputs_json),
            'outputs': json.loads(o.outputs_json),
            'primitive': o.primitive,
            'id': o.id
        }
    if isinstance(o, Photon):
        return {
            'value': o.value,
            'type': int(o.type)
        }
    if isinstance(o, PhotonTypes):
        return o.value
    if isinstance(o, set) or isinstance(o, frozenset):
        o = list(o)
    if isinstance(o, list):
        return [json_encoder_default(e) for e in o]
    return json.JSONEncoder().default(o)


def json_decoder_hook(dct):
    if 'value' in dct and 'type' in dct:
        result = Photon()
        result.value = dct['value']
        result.type = dct['type']
        return result
    return dct


def serialize(o):
    return json.dumps(obj=o, default=json_encoder_default)


def deserialize(s):
    return json.loads(s, object_hook=json_decoder_hook)
