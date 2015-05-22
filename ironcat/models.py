from django.db.models import Model, ForeignKey, IntegerField, CharField, ManyToManyField, BooleanField, TextField
import json
#from django.contrib.auth.models import UserManager as BaseUserManager
from django.contrib.auth.models import AbstractUser

"""
# region managers


class UserManager(BaseUserManager):

    def filter_by_name(self, tokens):
        users = self.all()
        for token in tokens:
            username_results = users.filter(username__icontains=token)
            firstname_results = users.filter(first_name__icontains=token)
            lastname_results = users.filter(last_name__icontains=token)
            users = username_results | firstname_results | lastname_results
        return users

# endregion managers

# region user


class User(AbstractUser):
    following = ManyToManyField('User', related_name='followers')

    objects = UserManager()

# endregion
"""

# region models


class Node(Model):
    name = CharField(max_length=255, null=True)
    containing_function = ForeignKey('Function', related_name='nodes')
    input_values_json = TextField()
    inner_function = ForeignKey('Function', related_name='nodes_using')


class Wire(Model):
    name = CharField(max_length=255, null=True)
    source_node = ForeignKey('Node', null=True, related_name='out_wires')
    source_pin = IntegerField()
    target_node = ForeignKey('Node', null=True, related_name='in_wires')
    target_pin = IntegerField()


class Function(Model):
    name = CharField(max_length=255, unique=True)
    description = TextField()
    input_values_json = TextField(default='[]')
    input_types_json = TextField(default='[]')
    output_types_json = TextField(default='[]')
    primitive = BooleanField(default=False)

    def _get_input_types(self):
        return json.loads(self.input_types_json or '[]')

    def _get_input_count(self):
        return len(self.input_types)

    def _get_output_types(self):
        return json.loads(self.output_types_json or '[]')

    def _get_output_count(self):
        return len(self.output_types)

    input_types = property(_get_input_types)
    output_types = property(_get_output_types)

    input_count = property(_get_input_count)
    output_count = property(_get_output_count)


class Tag(Model):
    functions = ManyToManyField('Function', related_name='tags')
    name = CharField(max_length=255, unique=True)

# endregion
