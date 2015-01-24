from django.test import TestCase
from ironcat.function_engine import evaluate_function
from ironcat.photon import Photon
from ironcat.photon_types import PhotonTypes
import math


def get_1_output(function_name, *inputs):
    result = evaluate_function(function_name, [Photon(val) for val in inputs])
    return result[0].raw_recursive


def get_2_outputs(function_name, *inputs):
    result = evaluate_function(function_name, [Photon(val) for val in inputs])
    return result[0].raw_recursive, result[1].raw_recursive


def get_3_outputs(function_name, *inputs):
    result = evaluate_function(function_name, [Photon(val) for val in inputs])
    return result[0].raw_recursive, result[1].raw_recursive, result[2].raw_recursive


def function_ref(function_name):
    return Photon(function_name, force_type=PhotonTypes.function)


def set_value(collection, key, value):
    collection[key] = value
    return collection


class TestPrimitive(TestCase):

    def test_evaluate_math21(self):

        a = 4
        b = 3

        result_add = get_1_output('+', a, b)
        result_sub = get_1_output('-', a, b)
        result_mul = get_1_output('*', a, b)
        result_div = get_1_output('/', a, b)
        result_pow = get_1_output('^', a, b)

        self.assertEqual(a + b, result_add)
        self.assertEqual(a - b, result_sub)
        self.assertEqual(a * b, result_mul)
        self.assertEqual(a / b, result_div)
        self.assertEqual(a ** b, result_pow)

    def test_evaluate_math11(self):

        a = 0.8

        result_sin = get_1_output('sin', a)
        result_cos = get_1_output('cos', a)
        result_tan = get_1_output('tan', a)
        result_asin = get_1_output('asin', a)
        result_acos = get_1_output('acos', a)
        result_atan = get_1_output('atan', a)

        self.assertAlmostEqual(math.sin(a), result_sin)
        self.assertAlmostEqual(math.cos(a), result_cos)
        self.assertAlmostEqual(math.tan(a), result_tan)
        self.assertAlmostEqual(math.asin(a), result_asin)
        self.assertAlmostEqual(math.acos(a), result_acos)
        self.assertAlmostEqual(math.atan(a), result_atan)

    def test_evaluate_get(self):

        dct = {'one': 1, 'two': 2, 'three': 3}
        key1 = 'one'
        key2 = 'two'

        result1 = get_1_output('get', dct, key1)
        result2 = get_1_output('get', dct, key2)

        self.assertEqual(dct[key1], result1)
        self.assertNotEqual(dct[key1], result2)

        lst = [0, 10, 20, 30]
        index1 = 1
        index2 = 2

        result1 = get_1_output('get', lst, index1)
        result2 = get_1_output('get', lst, index2)

        self.assertEqual(lst[index1], result1)
        self.assertNotEqual(lst[index1], result2)

        string = 'asdf'
        index1 = 1
        index2 = 2

        result1 = get_1_output('get', string, index1)
        result2 = get_1_output('get', string, index2)

        self.assertEqual(string[index1], result1)
        self.assertNotEqual(string[index1], result2)

    def test_evaluate_set(self):

        value = 99

        dct = {'one': None, 'two': 2, 'three': None}
        key = 'one'

        result = get_1_output('set', dct, key, value)

        self.assertEqual(set_value(dct, key, value), result)

        lst = [0, None, 20, None]
        index = 1

        result = get_1_output('set', lst, index, value)

        self.assertEqual(set_value(lst, index, value), result)

    def test_evaluate_to_list(self):
        lst = [1, 2, 'surprise']
        st = {1, 2, 'surprise'}
        dct = {'one': 1, 'two': 2, 'zzz': 'surprise'}

        result_set = get_1_output('to list', st)
        result_dict = get_1_output('to list', dct)

        self.assertEqual(set(lst), set(result_set))
        self.assertEqual(set(lst), set(result_dict))

        string = 'asdf'
        string_list = list(string)

        result = get_1_output('to list', string)

        self.assertEqual(string_list, result)

    def test_string_concatenate(self):
        string1 = 'asdf'
        string2 = 'jkl;'

        result = get_1_output('concatenate', string1, string2)

        self.assertEqual(string1 + string2, result)

    def test_map(self):
        lst = [1, 2, 3, 4]

        result = get_1_output('map', function_ref('sin'), lst)

        self.assertEqual([math.sin(x) for x in lst], result)

    def test_reduce(self):
        lst = [1, 2, 3, 4]

        result = get_1_output('reduce', function_ref('+'), lst, 0)

        self.assertEqual(sum(lst), result)

        lst = ['1', '2', '3', '4']

        result = get_1_output('reduce', function_ref('concatenate'), lst, '')

        self.assertEqual(''.join(lst), result)

    def test_evaluate(self):
        a = 1
        b = 2
        result = get_1_output('evaluate', function_ref('+'), a, b)
        self.assertEqual(a + b, result)
