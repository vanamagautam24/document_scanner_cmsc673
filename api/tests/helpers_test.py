import unittest

from helpers import clockwise_order

class TestClockwiseOrder(unittest.TestCase):

    def test_valid_input(self):
        input_array = [[0, 0], [1, 0], [1, 1], [0, 1]]
        expected_output = [[0, 0], [1, 0], [1, 1], [0, 1]]
        self.assertEqual(clockwise_order(input_array), expected_output)

    def test_invalid_length_input(self):
        input_array = [[0, 0], [1, 0]]
        with self.assertRaises(ValueError):
            clockwise_order(input_array)

    def test_invalid_element_input(self):
        input_array = [[0, 0, 1], [1, 0, 2], [1, 1, 3], [0, 1, 4]]
        with self.assertRaises(ValueError):
            clockwise_order(input_array)

    def test_clockwise_order(self):
        input_array = [[1, 0], [0, 1], [0, 0], [1, 1]]
        expected_output = [[0, 0], [1, 0], [1, 1], [0, 1]]
        self.assertEqual(clockwise_order(input_array), expected_output)


if __name__ == '__main__':
    unittest.main()
