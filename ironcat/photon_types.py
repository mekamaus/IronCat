class PhotonTypes:

    type_names_to_enum = {
        'none': 0,
        'error': 1,
        'string': 2,
        'number': 3,
        'bool': 4,
        'object': 5,
        'set': 6,
        'list': 7,
        'function': 8
    }

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
        types = []
        for name in type_names:
            if isinstance(name, str):
                types.append(PhotonTypes.type_names_to_enum[name])
            elif isinstance(name, int):
                types.append(name)

        return types


# region type collections
all_types = PhotonTypes.multiple('none', 'error', 'string', 'number', 'bool', 'object', 'set', 'list', 'function')
invalid_types = PhotonTypes.multiple('none', 'error')
valid_types = PhotonTypes.multiple('string', 'number', 'bool', 'object', 'set', 'list', 'function')
collection_types = PhotonTypes.multiple('object', 'set', 'list', 'string')
list_set_types = PhotonTypes.multiple('list', 'set')
indexable_types = PhotonTypes.multiple('list', 'string')
keyable_types = PhotonTypes.multiple('object')
# endregion
