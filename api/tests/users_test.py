import unittest
import numpy as np
import cv2
from v1.endpoints.users import apply_grayscale, apply_sepia, apply_invert, bgr_to_grayscale, read_image_with_pil, bilinear_interpolate, gaussian_kernel, vectorized_gaussian_blur, draw_contours, draw_line, enhance_image_cv, rotate_image_cv, four_point_transform, pre_process


class TestImageProcessing(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Create a sample image for testing
        cls.sample_image = (np.random.rand(10, 10, 3) * 255).astype(np.uint8)  # 10x10 RGB image

    def test_apply_grayscale(self):
        gray_image = apply_grayscale(self.sample_image)
        self.assertEqual(len(gray_image.shape), 2)  # Grayscale image should be 2D

    def test_apply_sepia(self):
        sepia_image = apply_sepia(self.sample_image)
        self.assertEqual(sepia_image.shape, self.sample_image.shape)  # Sepia image should maintain the same size

    def test_apply_invert(self):
        inverted_image = apply_invert(self.sample_image)
        np.testing.assert_array_equal(cv2.bitwise_not(self.sample_image), inverted_image)  # Inverted image should be bitwise not of original

    def test_bgr_to_grayscale(self):
        gray_image = bgr_to_grayscale(self.sample_image)
        self.assertEqual(gray_image.shape, self.sample_image.shape[:2])  # Grayscale image should have two dimensions

    def test_read_image_with_pil(self):
        img_array = read_image_with_pil('test.jpeg')
        self.assertIsInstance(img_array, np.ndarray)  # Check if the output is a numpy array

    def test_bilinear_interpolate(self):
        new_width, new_height = 5, 5
        resized_image = bilinear_interpolate(self.sample_image, new_width, new_height)
        self.assertEqual(resized_image.shape, (new_height, new_width, 3))  # Check if the new size is correct

    def test_gaussian_kernel(self):
        kernel = gaussian_kernel(5, 1.0)
        self.assertEqual(kernel.shape, (5, 5))  # Kernel should be 5x5
        self.assertAlmostEqual(kernel.sum(), 1.0)  # Sum of kernel should be close to 1

    def test_vectorized_gaussian_blur(self):
        # Create a test image (10x10)
        test_image = np.random.rand(10, 10)
        kernel = gaussian_kernel(3, 1.0)
        blurred_image = vectorized_gaussian_blur(test_image, kernel)
        self.assertEqual(blurred_image.shape, test_image.shape)  # Blurred image should have the same shape as input

    def test_draw_contours(self):
        # Create a blank test image
        test_image = np.zeros((10, 10), dtype=np.uint8)

        # Create a test contour: List of points, each point is a 2-element array
        # In OpenCV, contours are usually a list of points, and each point is enclosed in an array
        test_contour = [np.array([[[1, 1]], [[1, 5]], [[5, 5]]], dtype=np.int32)]
        
        color = 255  # White color for test
        thickness = 1
        image_with_contour = draw_contours(test_image, test_contour, color, thickness)
        self.assertTrue(np.any(image_with_contour))  # Image should have some white pixels


    def test_draw_line(self):
        # Create a blank test image
        test_image = np.zeros((10, 10), dtype=np.uint8)
        start_point = (1, 1)
        end_point = (8, 8)
        color = 255  # White color for test
        thickness = 1
        image_with_line = draw_line(test_image, start_point, end_point, color, thickness)
        self.assertTrue(np.any(image_with_line))  # Image should have some white pixels

    def test_four_point_transform(self):
        # Create a test image (10x10)
        test_image = np.zeros((10, 10), dtype=np.uint8)
        pts = np.array([[1, 1], [8, 1], [8, 8], [1, 8]])
        transformed = four_point_transform(test_image, pts)
        self.assertEqual(transformed.shape, (7, 7))  # The transformed image should be 7x7

    def test_pre_process(self):
        # Create a test BGR image (10x10)
        test_image = np.random.randint(0, 256, (10, 10, 3), dtype=np.uint8)
        processed = pre_process(test_image)
        self.assertEqual(processed.shape, test_image.shape[:2])  # Processed image should have the same width and height

    def test_enhance_image_cv(self):
        enhanced_image = enhance_image_cv(self.sample_image)
        self.assertEqual(enhanced_image.shape, self.sample_image.shape[:2])  # Enhanced image should be 2D and same size as input

    def test_rotate_image_cv(self):
        angle = 90
        rotated_image = rotate_image_cv(self.sample_image, angle)
        self.assertEqual(rotated_image.shape, self.sample_image.shape)  # Rotated image should maintain the same size and number of channels


if __name__ == '__main__':
    unittest.main()