from fastapi import APIRouter, Depends, HTTPException, Security, File, UploadFile, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db.schemas.user_schema import UserCreate, User, LoginRequest, ChangePasswordRequest
from db.mongodb_utils import get_db
from bson import ObjectId
import bcrypt
from jwt import PyJWTError,  decode as jwt_decode
import jwt
import os
import datetime
from io import BytesIO
import base64
import cv2
import numpy as np
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from typing import List
from math import sqrt
from itertools import permutations
from scipy.interpolate import interp1d
from scipy.ndimage import zoom
from scipy.ndimage import convolve
import tempfile
import shutil
from fpdf import FPDF
from PIL import Image
import logging
from pytesseract import image_to_string

router = APIRouter()

pdf_save_directory = "saved_pdfs"
os.makedirs(pdf_save_directory, exist_ok=True)

def bgr_to_grayscale(image):
    """
    Converts a BGR image to a grayscale image using a weighted sum approach.

    Args:
        image (np.ndarray): Input image in BGR format.

    Returns:
        np.ndarray: Grayscale image.
    """
    return np.dot(image[...,:3], [0.1140, 0.5870, 0.2989])

def read_image_with_pil(filename):
    """
    Reads an image file using PIL and converts it to a BGR numpy array.

    Args:
        filename (str): The path to the image file.

    Returns:
        np.ndarray: Image array in BGR format.
    """
    with Image.open(filename) as img:
        img_array = np.array(img)
        # Swap the red and blue channels
        img_array = img_array[:, :, ::-1]
        return img_array

def bilinear_interpolate(image, new_width, new_height):
    """
    Resizes an image using bilinear interpolation.

    Args:
        image (np.ndarray): The input image.
        new_width (int): The desired width of the output image.
        new_height (int): The desired height of the output image.

    Returns:
        np.ndarray: The resized image.
    """
    height, width, channels = image.shape
    new_image = np.zeros((new_height, new_width, channels), dtype=np.uint8)

    x_ratio = width / new_width
    y_ratio = height / new_height

    for channel in range(channels):
        for new_y in range(new_height):
            for new_x in range(new_width):
                x_l = int(x_ratio * new_x)
                y_l = int(y_ratio * new_y)
                x_h = min(int(x_l + 1), width - 1)
                y_h = min(int(y_l + 1), height - 1)

                x_weight = (x_ratio * new_x) - x_l
                y_weight = (y_ratio * new_y) - y_l

                a = image[y_l, x_l, channel]
                b = image[y_l, x_h, channel]
                c = image[y_h, x_l, channel]
                d = image[y_h, x_h, channel]

                pixel = a * (1 - x_weight) * (1 - y_weight) + b * x_weight * (1 - y_weight) + c * y_weight * (1 - x_weight) + d * x_weight * y_weight
                new_image[new_y, new_x, channel] = int(pixel)

    return new_image

def gaussian_kernel(size, sigma=1.0):
    """
    Generates a Gaussian kernel.

    Args:
        size (int): The size of the kernel (width and height).
        sigma (float, optional): The standard deviation of the Gaussian distribution. Defaults to 1.0.

    Returns:
        np.ndarray: A Gaussian kernel.
    """
    size = int(size) // 2
    x, y = np.mgrid[-size:size+1, -size:size+1]
    g = np.exp(-(x**2 + y**2) / (2 * sigma**2))
    return g / g.sum()

def vectorized_gaussian_blur(image, kernel):
    """
    Applies Gaussian blur to an image using a specified Gaussian kernel.

    This function extends the borders of the image and uses vectorized operations
    to apply the Gaussian blur efficiently.

    Args:
        image (np.ndarray): The input image to be blurred.
        kernel (np.ndarray): The Gaussian kernel used for blurring.

    Returns:
        np.ndarray: The blurred image.
    """
    # Extend the image borders
    pad_size = kernel.shape[0] // 2
    padded_image = np.pad(image, pad_size, mode='constant')

    # Extract sliding windows
    shape = (image.shape[0], image.shape[1], kernel.shape[0], kernel.shape[1])
    strides = padded_image.strides[:2] + padded_image.strides[:2]
    windows = np.lib.stride_tricks.as_strided(padded_image, shape=shape, strides=strides)

    # Apply the kernel to each window
    blurred = np.tensordot(windows, kernel, axes=((2, 3), (0, 1)))

    blurred = np.clip(blurred, 0, 255).astype(np.uint8)


    return blurred

def draw_contours(image, contours, color, thickness):
    """
    Draws contours on an image.

    This function iterates through a list of contours, drawing lines between 
    each pair of contour points. Optionally, it closes the contour by drawing 
    a line between the last and first points.

    Args:
        image (np.ndarray): The image on which to draw the contours.
        contours (list): A list of contours, where each contour is represented as an array of points.
        color (tuple): The color of the contour lines.
        thickness (int): The thickness of the contour lines.

    Returns:
        np.ndarray: The image with contours drawn on it.
    """
    for contour in contours:
        for i in range(len(contour) - 1):
            # Draw a line between each pair of points
            start_point = tuple(contour[i][0])
            end_point = tuple(contour[i + 1][0])
            image = draw_line(image, start_point, end_point, color, thickness)
        # Optionally: close the contour
        if len(contour) > 1:
            image = draw_line(image, tuple(contour[-1][0]), tuple(contour[0][0]), color, thickness)
    return image

def draw_line(image, start_point, end_point, color, thickness):
    """
    Draws a line on the image using Bresenham's line algorithm.

    This implementation of Bresenham's algorithm is used for drawing a straight 
    line between two points on the image.

    Args:
        image (np.ndarray): The image on which to draw the line.
        start_point (tuple): The starting point (x1, y1) of the line.
        end_point (tuple): The ending point (x2, y2) of the line.
        color (tuple): The color of the line.
        thickness (int): The thickness of the line.

    Returns:
        np.ndarray: The image with the line drawn on it.
    """
    # Bresenham's line algorithm
    x1, y1 = start_point
    x2, y2 = end_point
    dx = abs(x2 - x1)
    dy = abs(y2 - y1)
    x, y = x1, y1
    sx = -1 if x1 > x2 else 1
    sy = -1 if y1 > y2 else 1
    err = dx - dy

    while True:
        image[y, x] = color  # Set the pixel color
        if x == x2 and y == y2:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x += sx
        if e2 < dx:
            err += dx
            y += sy

    return image

@router.post("/users/", response_model=User)
async def get_current_user(db=Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(HTTPBearer())):
    """
    Retrieves the current user based on the provided JWT token.

    Args:
        db: Database dependency, injected by FastAPI.
        credentials (HTTPAuthorizationCredentials): The authorization credentials with JWT token.

    Raises:
        HTTPException: If the JWT token is invalid or the user is not found.

    Returns:
        User: The user details of the authenticated user.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user_collection = db["users"]
    user = await user_collection.find_one({"_id": ObjectId(payload["user_id"])})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(id=str(user["_id"]), **user)

@router.post("/users/", response_model=User)
async def create_user(user: UserCreate, db=Depends(get_db)):
    """
    Creates a new user with the provided user details.

    Args:
        user (UserCreate): The user details for creating a new user.
        db: Database dependency, injected by FastAPI.

    Raises:
        HTTPException: If the email is already registered.

    Returns:
        User: The newly created user details, including a JWT token.
    """
    user_collection = db["users"]
    
    if await user_collection.find_one({ "email": user.email }):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

    user_data = user.model_dump(exclude={"password"})
    user_data["password"] = hashed_password

    new_user = await user_collection.insert_one(user_data)
    
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=200)
    token = jwt.encode({"user_id": str(new_user.inserted_id), "exp": expiration}, os.getenv("JWT_SECRET"), algorithm="HS256")
    
    created_user = await user_collection.find_one({"_id": ObjectId(new_user.inserted_id)})
    return User(id=str(created_user["_id"]), token=token, **created_user)

@router.get("/users/{user_id}", response_model=User)
async def read_user(user_id: str, db=Depends(get_db)):
    """
    Retrieves a user by their user ID.

    Args:
        user_id (str): The unique identifier of the user.
        db: Database dependency, injected by FastAPI.

    Returns:
        User: The user details corresponding to the given user ID.
    """
    user_collection = db["users"]
    user = await user_collection.find_one({"_id": ObjectId(user_id)})
    return User(id=str(user["_id"]), **user)

@router.post("/login/", response_model=User)
async def login(request: LoginRequest, db=Depends(get_db)):
    """
    Authenticates a user based on email and password, and returns user details with JWT token.

    Args:
        request (LoginRequest): The login request containing the user's email and password.
        db: Database dependency, injected by FastAPI.

    Raises:
        HTTPException: If the email or password is incorrect.

    Returns:
        User: The authenticated user's details, including a JWT token.
    """
    user_collection = db["users"]
    user = await user_collection.find_one({"email": request.email})
    print('USER', user)
    if not user or not bcrypt.checkpw(request.password.encode("utf-8"), user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=200)

    token = jwt.encode({"user_id": str(user["_id"]), "exp": expiration}, os.getenv("JWT_SECRET"), algorithm="HS256")
    
    return User(token=token, id=str(user["_id"]), **user)

@router.post("/change-password/")
async def change_password(request: ChangePasswordRequest, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    """
    Changes the password of the currently authenticated user.

    Args:
        request (ChangePasswordRequest): The request containing the old and new password.
        current_user (User): The currently authenticated user, obtained through dependency.
        db: Database dependency, injected by FastAPI.

    Raises:
        HTTPException: If the current password is incorrect.

    Returns:
        dict: A message indicating successful password change.
    """
    user_collection = db["users"]
    user = await user_collection.find_one({ "_id": ObjectId(current_user.id) })

    if not user or not bcrypt.checkpw(request.old_password.encode("utf-8"), user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect current password")
    
    hashed_new_password = bcrypt.hashpw(request.new_password.encode("utf-8"), bcrypt.gensalt())
    await user_collection.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"password": hashed_new_password}})
    return {"message": "Password changed successfully"}

def apply_grayscale(image):
    """
    Converts a BGR image to grayscale.

    Args:
        image (np.ndarray): The input image in BGR format.

    Returns:
        np.ndarray: The grayscale image.
    """
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def apply_sepia(image):
    """
    Applies a sepia effect to a BGR image.

    Args:
        image (np.ndarray): The input image in BGR format.

    Returns:
        np.ndarray: The sepia-toned image.
    """
    sepia_filter = np.array([[0.272, 0.534, 0.131],
                             [0.349, 0.686, 0.168],
                             [0.393, 0.769, 0.189]])
    sepia_image = cv2.transform(image, sepia_filter)
    return sepia_image

def apply_invert(image):
    """
    Inverts the colors of a BGR image.

    Args:
        image (np.ndarray): The input image in BGR format.

    Returns:
        np.ndarray: The color-inverted image.
    """
    return cv2.bitwise_not(image)

@router.post("/process-image/")
async def process_image(file: UploadFile = File(...)):
    """
    Processes an uploaded image to detect and extract a document.

    The function performs the following steps:
    1. Resize the image to a smaller height while keeping the aspect ratio.
    2. Preprocess the image for edge detection.
    3. Find contours and identify the document's edges.
    4. Perform a perspective transform to get a top-down view of the document.
    5. Apply adaptive thresholding and Gaussian blur for final processing.
    6. Encode the processed image to PNG format and return as a streaming response.

    Args:
        file (UploadFile): The uploaded image file to be processed.

    Raises:
        HTTPException: If the document edges are not found or image encoding fails.

    Returns:
        StreamingResponse: The processed image in PNG format.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    ratio = image.shape[0] / 500.0
    orig = image.copy()
    resized = cv2.resize(image, (int(image.shape[1] / ratio), 500))

    edged = pre_process(resized)

    contours, hierarchy = cv2.findContours(edged, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)  # Corrected line


    for contour in contours:
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

        if len(approx) == 4:
            scaled_approx = np.array(approx, dtype='float32') * ratio
            scaled_approx = np.array(scaled_approx, dtype='int32')  # Convert back to integer

            warped = four_point_transform(orig, scaled_approx.reshape(4, 2))
            warped_gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
            adaptive_thresh = cv2.adaptiveThreshold(warped_gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 15)
            blurred_final = cv2.GaussianBlur(adaptive_thresh, (3, 3), 0)

            success, encoded_image = cv2.imencode('.png', blurred_final)
            if not success:
                raise HTTPException(status_code=500, detail="Failed to encode image")

            encoded_image_bytes = encoded_image.tobytes()
            return StreamingResponse(BytesIO(encoded_image_bytes), media_type="image/png")


    raise HTTPException(status_code=500, detail="Document edges not found")

def order_points(pts):
    """
    Orders the points in a consistent manner (top-left, top-right, bottom-right, bottom-left).

    Args:
        pts (np.ndarray): An array of points, typically representing the corners of a contour.

    Returns:
        np.ndarray: An array of points ordered as (top-left, top-right, bottom-right, bottom-left).
    """
    # Sort the points based on their x-coordinates
    xSorted = pts[np.argsort(pts[:, 0]), :]

    # Grab the left-most and right-most points from the sorted x-coordinate points
    leftMost = xSorted[:2, :]
    rightMost = xSorted[2:, :]

    # Now, sort the left-most coordinates according to their y-coordinates
    leftMost = leftMost[np.argsort(leftMost[:, 1]), :]
    (tl, bl) = leftMost

    # Calculate the Euclidean distance between the left-most points
    D = np.linalg.norm(rightMost - tl, axis=1)
    (br, tr) = rightMost[np.argsort(D)[::-1], :]

    return np.array([tl, tr, br, bl], dtype="float32")

def four_point_transform(image, pts):
    """
    Performs a perspective transform to obtain a top-down view of the image based on four points.

    Args:
        image (np.ndarray): The input image.
        pts (np.ndarray): An array of four points in the order of (top-left, top-right, bottom-right, bottom-left).

    Returns:
        np.ndarray: The transformed image.
    """
    # Obtain a consistent order of the points and unpack them individually
    rect = order_points(pts)
    (tl, tr, br, bl) = rect

    # Compute the width of the new image
    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = max(int(widthA), int(widthB))

    # Compute the height of the new image
    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = max(int(heightA), int(heightB))

    # Construct the destination points
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]
    ], dtype="float32")

    # Compute the perspective transform matrix and apply it
    M = cv2.getPerspectiveTransform(rect, dst)
    return cv2.warpPerspective(image, M, (maxWidth, maxHeight))

def pre_process(src):
    """
    Preprocesses an image for edge detection, using techniques such as grayscale conversion,
    morphological operations, and Gaussian blur.

    Args:
        src (np.ndarray): The source image to preprocess.

    Returns:
        np.ndarray: The preprocessed image, suitable for edge detection.
    """
    gray = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
    structuringElmt = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (4, 4))
    opened = cv2.morphologyEx(gray, cv2.MORPH_OPEN, structuringElmt)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, structuringElmt)
    blurred = cv2.GaussianBlur(closed, (7, 7), 0)
    return cv2.Canny(blurred, 75, 100)

@router.post("/upload")
async def create_upload_files(files: List[UploadFile] = File(...)):
    """
    Creates a PDF file from a list of uploaded images.

    This route handler takes multiple image files, converts them to JPEG (if needed),
    and compiles them into a single PDF file, which is then returned to the client.

    Args:
        files (List[UploadFile]): A list of image files to be compiled into a PDF.

    Returns:
        StreamingResponse: A streaming response containing the compiled PDF file.
    """
    pdf = FPDF()

    temp_files = []  # List to keep track of temporary files

    for file in files:
        contents = await file.read()

        # Create a temporary file
        temp_img_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_files.append(temp_img_file.name)

        if file.filename.endswith('.png'):
            # Convert PNG to JPEG
            img = Image.open(BytesIO(contents))
            img.convert('RGB').save(temp_img_file, format='JPEG')
        else:
            # Write content for JPEG
            temp_img_file.write(contents)

        temp_img_file.close()

        try:
            pdf.add_page()
            pdf.image(temp_img_file.name, x=10, y=8, w=100)  # Adjust dimensions as needed
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Generate the PDF and write it to a BytesIO stream
    pdf_bytes = pdf.output(dest='S').encode('latin1')  # PDF is generated as a string
    pdf_stream = BytesIO(pdf_bytes)
    pdf_stream.seek(0)

    # Cleanup temporary image files
    for temp_file in temp_files:
        os.unlink(temp_file)

    return StreamingResponse(pdf_stream, media_type='application/pdf')
    pdf = FPDF()

    temp_files = []  # List to keep track of temporary files

    for file in files:
        contents = await file.read()

        # Create a temporary file
        temp_img_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_files.append(temp_img_file.name)

        if file.filename.endswith('.png'):
            # Convert PNG to JPEG
            img = Image.open(BytesIO(contents))
            img.convert('RGB').save(temp_img_file, format='JPEG')
        else:
            # Write content for JPEG
            temp_img_file.write(contents)

        temp_img_file.close()

        try:
            pdf.add_page()
            pdf.image(temp_img_file.name, x=10, y=8, w=100)  # Adjust dimensions as needed
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Generate the PDF in memory
    pdf_output_stream = BytesIO()
    pdf.output(pdf_output_stream, 'F')
    pdf_output_stream.seek(0)

    # Cleanup temporary image files
    for temp_file in temp_files:
        os.unlink(temp_file)

    return StreamingResponse(pdf_output_stream, media_type='application/pdf')

@router.post("/rotate-image/")
async def rotate_image(file: UploadFile = File(...), angle: float = Query(default=0.0)):
    """
    Rotates an uploaded image by a specified angle.

    Args:
        file (UploadFile): The image file to rotate.
        angle (float): The angle in degrees to rotate the image.

    Returns:
        StreamingResponse: The rotated image as a PNG file.
    """
    try:
        # Read the image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Rotate the image
        rotated_image = rotate_image_cv(image, angle)

        # Convert the rotated image to bytes
        _, encoded_image = cv2.imencode('.png', rotated_image)
        encoded_image_bytes = encoded_image.tobytes()

        return StreamingResponse(BytesIO(encoded_image_bytes), media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enhance-image/")
async def enhance_image(file: UploadFile = File(...)):
    """
    Enhances an uploaded image by applying grayscale and adaptive thresholding.

    Args:
        file (UploadFile): The image file to enhance.

    Returns:
        StreamingResponse: The enhanced image as a PNG file.
    """
    try:
        # Read the image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Enhance the image
        enhanced_image = enhance_image_cv(image)

        # Convert the enhanced image to bytes
        _, encoded_image = cv2.imencode('.png', enhanced_image)
        encoded_image_bytes = encoded_image.tobytes()

        return StreamingResponse(BytesIO(encoded_image_bytes), media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def enhance_image_cv(image: np.ndarray) -> np.ndarray:
    """
    Enhances an image by converting to grayscale and applying adaptive thresholding.

    Args:
        image (np.ndarray): The input image in BGR format.

    Returns:
        np.ndarray: The enhanced image.
    """
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Noise reduction with a smaller Gaussian blur
    blur = cv2.GaussianBlur(gray, (3, 3), 0)

    # Adaptive thresholding with different parameters
    thresholded = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                        cv2.THRESH_BINARY, 31, 10)

    # Optional: Dilate to make text more pronounced
    kernel = np.ones((1, 1), np.uint8)
    dilated = cv2.dilate(thresholded, kernel, iterations=1)

    return dilated

def rotate_image_cv(image: np.ndarray, angle: float) -> np.ndarray:
    """
    Rotates an image by a given angle.

    Args:
        image (np.ndarray): The input image to rotate.
        angle (float): The angle in degrees to rotate the image.

    Returns:
        np.ndarray: The rotated image.
    """
    # Get image dimensions
    (h, w) = image.shape[:2]

    # Calculate the center of the image
    center = (w // 2, h // 2)

    print("Rotating image by {} degrees".format(angle))

    # Perform the rotation
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h))

    return rotated

@router.post("/ocr/")
async def perform_ocr(file: UploadFile = File(...)):
    """
    Performs Optical Character Recognition (OCR) on an uploaded image file.

    Args:
        file (UploadFile): The image file to perform OCR on.

    Returns:
        dict: A dictionary containing the recognized text.
    """
    # Read the uploaded file
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert to grayscale for better OCR results
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Perform OCR using pytesseract
    try:
        ocr_result = image_to_string(gray_image)
        print("OCR result:", ocr_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

    return {"text": ocr_result}

@router.post("/apply-grayscale/")
async def grayscale_effect(file: UploadFile = File(...)):
    """
    Applies a grayscale effect to an uploaded image.

    Args:
        file (UploadFile): The image file to convert to grayscale.

    Returns:
        StreamingResponse: The grayscale image as a JPEG file.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    gray_image = apply_grayscale(image)
    success, encoded_image = cv2.imencode('.jpg', gray_image)
    return StreamingResponse(BytesIO(encoded_image.tobytes()), media_type="image/jpeg")

@router.post("/apply-sepia/")
async def sepia_effect(file: UploadFile = File(...)):
    """
    Applies a sepia effect to an uploaded image.

    Args:
        file (UploadFile): The image file to apply the sepia effect to.

    Returns:
        StreamingResponse: The sepia-toned image as a JPEG file.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    sepia_image = apply_sepia(image)
    success, encoded_image = cv2.imencode('.jpg', sepia_image)
    return StreamingResponse(BytesIO(encoded_image.tobytes()), media_type="image/jpeg")

@router.post("/apply-invert/")
async def invert_effect(file: UploadFile = File(...)):
    """
    Inverts the colors of an uploaded image.

    Args:
        file (UploadFile): The image file whose colors are to be inverted.

    Returns:
        StreamingResponse: The color-inverted image as a JPEG file.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    inverted_image = apply_invert(image)
    success, encoded_image = cv2.imencode('.jpg', inverted_image)
    return StreamingResponse(BytesIO(encoded_image.tobytes()), media_type="image/jpeg")
