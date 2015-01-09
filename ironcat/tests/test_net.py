from ironcat.models import Wire, Node, Function
from django.test import TestCase
from ironcat.function_engine import evaluate_function
from ironcat.photon import Photon
import math


def get_fn(name):
    try:
        return Function.objects.get(name=name)
    except Function.DoesNotExist:
        fn = Function(name=name, description='', input_types_json='', output_types_json='', primitive=True)
        fn.save()
        return fn


class TestNet(TestCase):

    def test_net(self):

        rect_to_polar = Function(name='rect to polar', description='', input_types_json='', output_types_json='',
                                 primitive=False)
        rect_to_polar.save()

        nd1a = Node(containing_function=rect_to_polar, inner_function=get_fn('*'))
        nd1b = Node(containing_function=rect_to_polar, inner_function=get_fn('*'))
        nd2a = Node(containing_function=rect_to_polar, inner_function=get_fn('+'))
        nd3a = Node(containing_function=rect_to_polar, inner_function=get_fn('^'),
                    default_inputs_json='[{"value": "0", "type": 3}, {"value": "0.5", "type": 3}]')
        nd4a = Node(containing_function=rect_to_polar, inner_function=get_fn('atan2'))

        [node.save() for node in (nd1a, nd1b, nd2a, nd3a, nd4a)]

        wire_in0_1a0 = Wire(source_node=None, source_pin=0, target_node=nd1a, target_pin=0)
        wire_in0_1a1 = Wire(source_node=None, source_pin=0, target_node=nd1a, target_pin=1)
        wire_in1_1b0 = Wire(source_node=None, source_pin=1, target_node=nd1b, target_pin=0)
        wire_in1_1b1 = Wire(source_node=None, source_pin=1, target_node=nd1b, target_pin=1)
        wire_1a0_2a0 = Wire(source_node=nd1a, source_pin=0, target_node=nd2a, target_pin=0)
        wire_1b0_2a1 = Wire(source_node=nd1b, source_pin=0, target_node=nd2a, target_pin=1)
        wire_2a0_3a0 = Wire(source_node=nd2a, source_pin=0, target_node=nd3a, target_pin=0)
        wire_in0_4a1 = Wire(source_node=None, source_pin=0, target_node=nd4a, target_pin=1)
        wire_in1_4a0 = Wire(source_node=None, source_pin=1, target_node=nd4a, target_pin=0)
        wire_3a0_ou0 = Wire(source_node=nd3a, source_pin=0, target_node=None, target_pin=0)
        wire_4a0_ou1 = Wire(source_node=nd4a, source_pin=0, target_node=None, target_pin=1)

        [wire.save() for wire in (wire_in0_1a0, wire_in0_1a1, wire_in1_1b0, wire_in1_1b1, wire_1a0_2a0, wire_1b0_2a1,
                                  wire_2a0_3a0, wire_in0_4a1, wire_in1_4a0, wire_3a0_ou0, wire_4a0_ou1)]

        # rect_to_polar = Function(net=rect_to_polar_net)

        rect = [1, 1]

        ph_rect = [Photon(x) for x in rect]

        ph_polar = evaluate_function(rect_to_polar, ph_rect)

        polar = [x.raw for x in ph_polar]

        self.assertAlmostEqual(polar[0], math.sqrt(2))
        self.assertAlmostEqual(polar[1], math.pi / 4)

        """
        net = Net()
        net.save()

        nd1a = Node(net=net, function=get_fn('cos'))
        nd1b = Node(net=net, function=rect_to_polar)
        nd2a = Node(net=net, function=get_fn('*'))
        nd2b = Node(net=net, function=get_fn('+'))
        [node.save() for node in (nd1a, nd1b, nd2a, nd2b)]

        wire_in0_1a0 = Wire(source_node=None, source_pin=0, target_node=nd1a, target_pin=0)
        wire_in0_1b0 = Wire(source_node=None, source_pin=0, target_node=nd1b, target_pin=0)
        wire_in1_1b1 = Wire(source_node=None, source_pin=1, target_node=nd1b, target_pin=1)
        wire_in0_2a0 = Wire(source_node=None, source_pin=0, target_node=nd2a, target_pin=0)
        wire_1a0_2a1 = Wire(source_node=nd1a, source_pin=0, target_node=nd2a, target_pin=1)
        wire_1b0_2a2 = Wire(source_node=nd1b, source_pin=0, target_node=nd2a, target_pin=2)
        wire_1a0_2b0 = Wire(source_node=nd1a, source_pin=0, target_node=nd2b, target_pin=0)
        wire_1b1_2b1 = Wire(source_node=nd1b, source_pin=1, target_node=nd2b, target_pin=1)
        wire_2a0_ou0 = Wire(source_node=nd2a, source_pin=0, target_node=None, target_pin=0)
        wire_2b0_ou1 = Wire(source_node=nd2b, source_pin=0, target_node=None, target_pin=1)

        [wire.save() for wire in (wire_in0_1a0, wire_in0_1b0, wire_in1_1b1, wire_in0_2a0, wire_1a0_2a1, wire_1b0_2a2,
                                  wire_1a0_2b0, wire_1b1_2b1, wire_2a0_ou0, wire_2b0_ou1)]
        """

        # TODO: make it work
