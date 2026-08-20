from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# =========================================================
# CUSTOM USER
# =========================================================

class User(AbstractUser):

    ROLE_CHOICES = (
        ("customer", "Customer"),
        ("worker", "Worker"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="customer",
    )

    phone = models.CharField(
        max_length=15,
        unique=True,
    )


# =========================================================
# SERVICE
# =========================================================

class Service(models.Model):

    name = models.CharField(
        max_length=100,
    )

    description = models.TextField(
        blank=True,
    )

    def __str__(self):
        return self.name


# =========================================================
# WORKER PROFILE
# =========================================================

class WorkerProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
    )

    services = models.ManyToManyField(
        Service,
    )

    city = models.CharField(
        max_length=100,
    )

    experience_years = models.IntegerField(
        default=0,
    )

    rating = models.FloatField(
        default=0,
    )

    # -----------------------------------------------------
    # EXISTING PAKISTAN CNIC FIELDS
    # Keep these for compatibility with your current system
    # -----------------------------------------------------

    cnic = models.CharField(
        max_length=15,
        blank=True,
        null=True,
    )

    cnic_front = models.ImageField(
        upload_to="verification/cnic_front/",
        blank=True,
        null=True,
    )

    cnic_back = models.ImageField(
        upload_to="verification/cnic_back/",
        blank=True,
        null=True,
    )

    selfie = models.ImageField(
        upload_to="verification/selfie/",
        blank=True,
        null=True,
    )

    # -----------------------------------------------------
    # VERIFICATION STATUS
    # -----------------------------------------------------

    is_verified = models.BooleanField(
        default=False,
    )

    verification_status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )

    # -----------------------------------------------------
    # WORKER ONLINE / AVAILABILITY
    # -----------------------------------------------------

    is_online = models.BooleanField(
        default=False,
    )

    is_available = models.BooleanField(
        default=True,
    )

    # -----------------------------------------------------
    # WORKER LOCATION
    # -----------------------------------------------------

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        default=0,
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        default=0,
    )

    last_location_update = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.user.username

    # =========================================================
# WORKER LOCATION
# =========================================================

class WorkerLocation(models.Model):

    worker = models.OneToOneField(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="location",
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
    )

    accuracy = models.FloatField(
        null=True,
        blank=True,
        help_text="GPS accuracy in meters",
    )

    speed = models.FloatField(
        null=True,
        blank=True,
        help_text="Worker speed in meters per second",
    )

    heading = models.FloatField(
        null=True,
        blank=True,
        help_text="Worker direction in degrees",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.worker.user.username} - "
            f"{self.latitude}, {self.longitude}"
        )

    # =========================================================
# CUSTOMER LOCATION
# =========================================================

class CustomerLocation(models.Model):

    customer = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="location",
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
    )

    accuracy = models.FloatField(
        null=True,
        blank=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )


# =========================================================
# WORKER VERIFICATION
# =========================================================
# This is a SEPARATE model.
# It is NOT inside WorkerProfile.
# =========================================================

class WorkerVerification(models.Model):

    DOCUMENT_TYPE_CHOICES = [
        ("cnic", "Pakistan CNIC"),
        ("national_id", "National ID"),
        ("passport", "Passport"),
        ("driving_license", "Driving License"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("failed", "Failed"),
    ]

    # -----------------------------------------------------
    # WORKER
    # -----------------------------------------------------

    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="verifications",
    )

    # -----------------------------------------------------
    # INTERNATIONAL IDENTITY INFORMATION
    # -----------------------------------------------------

    country = models.CharField(
        max_length=100,
        blank=True,
    )

    document_type = models.CharField(
        max_length=30,
        choices=DOCUMENT_TYPE_CHOICES,
        default="cnic",
    )

    document_number = models.CharField(
        max_length=50,
        blank=True,
    )

    # -----------------------------------------------------
    # ID DOCUMENT IMAGES
    # -----------------------------------------------------

    document_front = models.ImageField(
        upload_to="verification/documents/front/",
        blank=True,
        null=True,
    )

    document_back = models.ImageField(
        upload_to="verification/documents/back/",
        blank=True,
        null=True,
    )

    # -----------------------------------------------------
    # SELFIE
    # -----------------------------------------------------

    selfie = models.ImageField(
        upload_to="verification/selfies/",
        blank=True,
        null=True,
    )

    # -----------------------------------------------------
    # OCR RESULT
    # -----------------------------------------------------

    ocr_result = models.JSONField(
        blank=True,
        null=True,
    )

    ocr_confidence = models.FloatField(
        default=0,
    )

    # -----------------------------------------------------
    # FACE VERIFICATION
    # -----------------------------------------------------

    face_match_score = models.FloatField(
        default=0,
    )

    face_match_status = models.CharField(
        max_length=30,
        default="not_checked",
    )

    # -----------------------------------------------------
    # LIVENESS
    # -----------------------------------------------------

    liveness_status = models.CharField(
        max_length=30,
        default="not_checked",
    )

    # -----------------------------------------------------
    # VERIFICATION STATUS
    # -----------------------------------------------------

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    # -----------------------------------------------------
    # ADMIN REVIEW
    # -----------------------------------------------------

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verification_reviews",
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # -----------------------------------------------------
    # TIMESTAMPS
    # -----------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):

        return (
            f"{self.worker.user.username} - "
            f"{self.document_type} - "
            f"{self.status}"
        )


# =========================================================
# BOOKING
# =========================================================

class Booking(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    )

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="customer_bookings",
    )

    worker = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="worker_bookings",
    )

    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )


# =========================================================
# NOTIFICATION
# =========================================================

class Notification(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    booking = models.ForeignKey(
        "Booking",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    message = models.CharField(
        max_length=255,
    )

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.message


# =========================================================
# REVIEW
# =========================================================

class Review(models.Model):

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )

    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
    )

    rating = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ],
    )

    comment = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f"{self.customer.username} -> "
            f"{self.worker.user.username}"
        )