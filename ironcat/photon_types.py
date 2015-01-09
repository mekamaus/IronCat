from enum import IntEnum


class PhotonTypes(IntEnum):
    none = 0
    error = 1
    string = 2
    float = 3
    int = 4
    bool = 5
    object = 6
    set = 7
    list = 8
    function = 9

    @staticmethod
    def multiple(*type_names):
        return set(PhotonTypes.__getattr__(name) for name in type_names if hasattr(PhotonTypes, name))


# region type collections
invalid_types = PhotonTypes.multiple('none', 'error')
valid_types = PhotonTypes.multiple('string', 'float', 'int', 'bool', 'object', 'set', 'list', 'function')
collection_types = PhotonTypes.multiple('object', 'set', 'list', 'string')
list_set_types = PhotonTypes.multiple('list', 'set')
indexable_types = PhotonTypes.multiple('list', 'string')
keyable_types = PhotonTypes.multiple('object')
number_types = PhotonTypes.multiple('int', 'float')
# endregion
