from enum import IntEnum


class PhotonTypes(IntEnum):
    none = 0
    error = 1
    string = 2
    number = 3
    bool = 4
    object = 5
    set = 6
    list = 7
    function = 8

    @staticmethod
    def multiple(*type_names):
        return set(PhotonTypes.__getattr__(name) for name in type_names if hasattr(PhotonTypes, name))


# region type collections
all_types = PhotonTypes.multiple('none', 'error', 'string', 'number', 'bool', 'object', 'set', 'list', 'function')
invalid_types = PhotonTypes.multiple('none', 'error')
valid_types = PhotonTypes.multiple('string', 'number', 'bool', 'object', 'set', 'list', 'function')
collection_types = PhotonTypes.multiple('object', 'set', 'list', 'string')
list_set_types = PhotonTypes.multiple('list', 'set')
indexable_types = PhotonTypes.multiple('list', 'string')
keyable_types = PhotonTypes.multiple('object')
# endregion
