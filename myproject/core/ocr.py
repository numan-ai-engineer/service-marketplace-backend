import easyocr
import re

reader = easyocr.Reader(["en"], gpu=False)


def extract_cnic(image_path):

    result = reader.readtext(image_path)

    text = " ".join([item[1] for item in result])

    print("OCR TEXT:", text)

    # OCR کی عام غلطیاں درست کریں
    cleaned_text = text.replace(".", "-")
    cleaned_text = cleaned_text.replace(" ", "")
    cleaned_text = cleaned_text.replace("O", "0")
    cleaned_text = cleaned_text.replace("I", "1")
    cleaned_text = cleaned_text.replace("l", "1")

    print("Cleaned OCR:", cleaned_text)

    # Format: 35404-7920174-3
    match = re.search(r"\d{5}-\d{7}-\d", cleaned_text)

    if match:
        return match.group().replace("-", "")

    # اگر بغیر Dash کے ہو
    match = re.search(r"\d{13}", cleaned_text)

    if match:
        return match.group()

    return None