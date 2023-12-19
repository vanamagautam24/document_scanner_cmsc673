import os
import subprocess
import sys
import urllib.request
from pathlib import Path

def setup_environment():
    """
    Sets up the environment by cloning the GroundingDINO repository, installing dependencies,
    and downloading necessary model weights.

    This function performs the following steps:
    1. Clones the GroundingDINO repository from GitHub.
    2. Checks out a specific commit of the repository.
    3. Installs the GroundingDINO package.
    4. Installs the segment-anything and supervision packages.
    5. Downloads the GroundingDINO and SAM model weights.

    Returns:
        tuple: Paths to the downloaded GroundingDINO and SAM model weights.
    """
    # Set the current working directory
    cwd = os.getcwd()

    # Clone GroundingDINO repository
    grounding_dino_repo = os.path.join(cwd, 'GroundingDINO')
    if not os.path.exists(grounding_dino_repo):
        subprocess.run(["git", "clone", "https://github.com/IDEA-Research/GroundingDINO.git"], cwd=cwd)
        subprocess.run(["git", "checkout", "57535c5a79791cb76e36fdb64975271354f10251"], cwd=grounding_dino_repo)

    # Install GroundingDINO
    subprocess.run([sys.executable, "-m", "pip", "install", "-e", "."], cwd=grounding_dino_repo)

    # Install segment-anything
    subprocess.run([sys.executable, "-m", "pip", "install", "git+https://github.com/facebookresearch/segment-anything.git"])

    # Install supervision
    subprocess.run([sys.executable, "-m", "pip", "install", "supervision==0.6.0"])

    # Download GroundingDINO weights
    weights_dir = os.path.join(cwd, 'weights')
    os.makedirs(weights_dir, exist_ok=True)

    grounding_dino_weights = os.path.join(weights_dir, 'groundingdino_swint_ogc.pth')
    if not os.path.isfile(grounding_dino_weights):
        urllib.request.urlretrieve("https://github.com/IDEA-Research/GroundingDINO/releases/download/v0.1.0-alpha/groundingdino_swint_ogc.pth", grounding_dino_weights)

    # Download SAM checkpoint
    sam_checkpoint_path = os.path.join(weights_dir, 'sam_vit_h_4b8939.pth')
    if not os.path.isfile(sam_checkpoint_path):
        urllib.request.urlretrieve("https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth", sam_checkpoint_path)

    print("Setup completed successfully.")
    return grounding_dino_weights, sam_checkpoint_path

def main():
    """
    Main function to execute the environment setup and demonstrate object detection
    and segmentation functionalities using the GroundingDINO and SAM models.

    This function:
    1. Sets up the environment.
    2. Initializes the necessary models with the downloaded weights.
    3. Reads an image and performs object detection and segmentation.
    4. Annotates the image with the results and displays it.
    """
    grounding_dino_weights, sam_checkpoint_path = setup_environment()

    import torch
    import cv2
    import numpy as np
    import supervision as sv
    from segment_anything import sam_model_registry, SamPredictor
    from groundingdino.util.inference import Model
    from typing import List

    DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    grounding_dino_model = Model(model_checkpoint_path=grounding_dino_weights)

    SAM_ENCODER_VERSION = "vit_h"
    sam = sam_model_registry[SAM_ENCODER_VERSION](checkpoint=sam_checkpoint_path).to(device=DEVICE)
    sam_predictor = SamPredictor(sam)

    SOURCE_IMAGE_PATH = f"./../../test.jpeg"
    CLASSES = ['Document']
    BOX_THRESHOLD = 0.35
    TEXT_THRESHOLD = 0.25

    def enhance_class_name(class_names: List[str]) -> List[str]:
        """
    Enhances each class name in the given list by prefixing it with 'all'.

    Args:
        class_names (List[str]): A list of class names.

    Returns:
        List[str]: A list of enhanced class names.
    """
        return [f"all {class_name}s" for class_name in class_names]

    image = cv2.imread(SOURCE_IMAGE_PATH)

    detections = grounding_dino_model.predict_with_classes(
        image=image,
        classes=enhance_class_name(CLASSES),
        box_threshold=BOX_THRESHOLD,
        text_threshold=TEXT_THRESHOLD
    )

    box_annotator = sv.BoxAnnotator()
    labels = [f"{CLASSES[class_id]} {confidence:0.2f}" for _, _, confidence, class_id, _ in detections]
    annotated_frame = box_annotator.annotate(scene=image.copy(), detections=detections, labels=labels)
    sv.plot_image(annotated_frame, (16, 16))

    def segment(sam_predictor: SamPredictor, image: np.ndarray, xyxy: np.ndarray) -> np.ndarray:
        """
    Segments the specified regions from the given image using the SAM predictor.

    Args:
        sam_predictor (SamPredictor): The SAM model predictor.
        image (np.ndarray): The input image for segmentation.
        xyxy (np.ndarray): An array of bounding boxes in the format (x1, y1, x2, y2).

    Returns:
        np.ndarray: An array of segmented masks corresponding to the input bounding boxes.
    """
        sam_predictor.set_image(image)
        result_masks = []
        for box in xyxy:
            masks, scores, logits = sam_predictor.predict(box=box, multimask_output=True)
            index = np.argmax(scores)
            result_masks.append(masks[index])
        return np.array(result_masks)

    detections.mask = segment(sam_predictor=sam_predictor, image=cv2.cvtColor(image, cv2.COLOR_BGR2RGB), xyxy=detections.xyxy)

    mask_annotator = sv.MaskAnnotator()
    annotated_image = mask_annotator.annotate(scene=image.copy(), detections=detections)
    annotated_image = box_annotator.annotate(scene=annotated_image, detections=detections, labels=labels)
    sv.plot_image(annotated_image, (16, 16))

if __name__ == "__main__":
    main()
