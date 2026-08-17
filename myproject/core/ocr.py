import re
import cv2
import easyocr


reader = easyocr.Reader(["en"], gpu=False)


def find_cnic(text):
    if not text:
        return None

    text = text.upper()

    print("🔥 SEARCHING CNIC IN:", text)

    # 35404-7920174-3
    match = re.search(
        r"(\d{5})[\s\-\.]*(\d{7})[\s\-\.]*(\d)",
        text
    )

    if match:
        cnic = (
            match.group(1)
            + match.group(2)
            + match.group(3)
        )

        print("🔥 CNIC FOUND:", cnic)
        return cnic

    # Remove separators
    compact = re.sub(
        r"[\s\-\.]+",
        "",
        text
    )

    # 3540479201743
    match = re.search(
        r"\d{13}",
        compact
    )

    if match:
        cnic = match.group()
        print("🔥 CNIC FOUND:", cnic)
        return cnic

    return None


def run_ocr(image):
    result = reader.readtext(
        image,
        detail=1,
        paragraph=False,
        text_threshold=0.2,
        low_text=0.1,
        link_threshold=0.1,
        mag_ratio=2.0
    )

    print(
        "🔥 OCR DETECTION COUNT:",
        len(result)
    )

    for item in result:

     print("\n🔥 OCR ITEM FULL:")
     print(repr(item))

    return result


def extract_cnic_data(image_path):

    print("\n==============================")
    print("🔥 OCR START")
    print("==============================")

    print("🔥 IMAGE PATH:", image_path)

    image = cv2.imread(image_path)

    if image is None:
        print("❌ IMAGE COULD NOT BE LOADED")

        return {
            "cnic": None,
            "name": None,
            "confidence": 0
        }

    print("🔥 IMAGE SHAPE:", image.shape)

    # Resize image
    image = cv2.resize(
        image,
        None,
        fx=2.5,
        fy=2.5,
        interpolation=cv2.INTER_CUBIC
    )

    # Grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Enhancement
    enhanced = cv2.equalizeHist(gray)

    # Threshold
    threshold = cv2.adaptiveThreshold(
        enhanced,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )

    # =====================================
    # PASS 1
    # =====================================

    print("\n🔥 OCR PASS 1 - ORIGINAL")

    result1 = run_ocr(image)

    text1 = " ".join(
        item[1]
        for item in result1
    )

    print("🔥 OCR RAW TEXT 1:", text1)

    cnic = find_cnic(text1)

    if cnic:
        return {
            "cnic": cnic,
            "name": None,
            "confidence": 1
        }

    # =====================================
    # PASS 2
    # =====================================

    print("\n🔥 OCR PASS 2 - ENHANCED")

    result2 = run_ocr(enhanced)

    text2 = " ".join(
        item[1]
        for item in result2
    )

    print("🔥 OCR RAW TEXT 2:", text2)

    cnic = find_cnic(text2)

    if cnic:
        return {
            "cnic": cnic,
            "name": None,
            "confidence": 1
        }

    # =====================================
    # PASS 3
    # =====================================

    print("\n🔥 OCR PASS 3 - THRESHOLD")

    result3 = run_ocr(threshold)

    text3 = " ".join(
        item[1]
        for item in result3
    )

    print("🔥 OCR RAW TEXT 3:", text3)

    cnic = find_cnic(text3)

    if cnic:
        return {
            "cnic": cnic,
            "name": None,
            "confidence": 1
        }

    # =====================================
    # COMBINE
    # =====================================

    combined_text = (
        text1
        + " "
        + text2
        + " "
        + text3
    )

    print("\n🔥 COMBINED OCR TEXT:")
    print(combined_text)

    cnic = find_cnic(combined_text)

    print("\n🔥 OCR FINAL RESULT:", cnic)

    return {
        "cnic": cnic,
        "name": None,
        "confidence": 1 if cnic else 0
    }