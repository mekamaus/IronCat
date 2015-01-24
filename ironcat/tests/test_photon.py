from django.test import TestCase
from ironcat.photon import Photon
from ironcat.photon_types import PhotonTypes
from ironcat.function_engine import evaluate_function
import math


class TestPhoton(TestCase):

    def test_photon_type(self):
        p1 = Photon(1)
        p2 = Photon(1.0)
        p3 = Photon('foo')
        self.assertEqual(p1.type, PhotonTypes.number)
        self.assertEqual(p2.type, PhotonTypes.number)
        self.assertEqual(p3.type, PhotonTypes.string)

    def test_photon_equality(self):
        p1 = Photon(1)
        p2 = Photon(1.0)
        p3 = Photon(2)

        self.assertEqual(p1, p2)
        self.assertNotEqual(p1, p3)

        p1 = Photon([1.0, 2, 3, 'bar'])
        p2 = Photon([1, 2.0, 3, 'bar'])
        p3 = Photon([1, 2.0, 3, 'baz'])

        self.assertEqual(p1, p2)
        self.assertNotEqual(p1, p3)

        p1 = Photon({10.0, 20, frozenset([30, 40.0]), 'spaz'})
        p2 = Photon({'spaz', 10, 20.0, frozenset([30.0, 40])})
        p3 = Photon({10.0, 20, frozenset([30, 40.0, 'spaz']), 'spaz'})

        self.assertEqual(p1, p2)
        self.assertNotEqual(p1, p3)

        p1 = Photon({'one': 1, 'two': 2, 'three': 3, 'dict': {'alpha': 'a', 'beta': 'b'}})
        p2 = Photon({'dict': {'alpha': 'a', 'beta': 'b'}, 'one': 1.0, 'two': 2.0, 'three': 3.0})
        p3 = Photon({'dict': {'alpha': 'a', 'beta': '?'}, 'one': 1.0, 'two': 2.0, 'three': 3.0})

        self.assertEqual(p1, p2)
        self.assertNotEqual(p1, p3)

        p1 = Photon({'one': 1, 'two': 2, 'three': 3, 'set': {'a', 'b', 'c'}})
        p2 = Photon({'one': 1.0, 'two': 2.0, 'three': 3.0, 'set': {'a', 'b', 'c'}})
        p3 = Photon({'one': 1.0, 'two': 2.0, 'three': 3.0, 'set': {'a', 'b', 'd'}})

        self.assertEqual(p1, p2)
        self.assertNotEqual(p1, p3)
