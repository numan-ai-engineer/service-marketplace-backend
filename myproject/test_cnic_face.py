import cv2

print("CV2 VERSION:", getattr(cv2, "__version__", "UNKNOWN"))
print("CV2 FILE:", getattr(cv2, "__file__", "UNKNOWN"))

print("HAS CascadeClassifier:", hasattr(cv2, "CascadeClassifier"))

print("HAS data:", hasattr(cv2, "data"))

print("CV2 DIR SAMPLE:")

for name in dir(cv2):
    if "Cascade" in name or "cascade" in name:
        print(name)