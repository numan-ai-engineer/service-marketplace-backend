from django.db.models import Avg
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .serializers import WorkerVerificationSerializer
from django.shortcuts import get_object_or_404
from .ocr import extract_cnic_data
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.hashers import make_password
from django.utils.encoding import force_str
from math import radians, sin, cos, sqrt, atan2


from .models import ( User, Service, WorkerProfile, WorkerLocation, WorkerVerification, Booking, Review, Notification, CustomerLocation, )
from .serializers import ( UserSerializer, ServiceSerializer, WorkerProfileSerializer, BookingSerializer, 
ReviewSerializer, WorkerVerificationSerializer, WorkerLocationSerializer, CustomerLocationSerializer, )

# =========================
# USER API
# =========================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


# =========================
# SERVICE API
# =========================
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


# =========================
# WORKER API
# =========================
class WorkerProfileViewSet(viewsets.ModelViewSet):
    queryset = WorkerProfile.objects.all()
    serializer_class = WorkerProfileSerializer

    def get_queryset(self):

        queryset = WorkerProfile.objects.filter(
            is_verified=True,
            is_available=True,
            is_online=True,
        )

        city = self.request.query_params.get("city")
        service = self.request.query_params.get("service")

        if city:
            queryset = queryset.filter(city__icontains=city)

        if service:
            queryset = queryset.filter(
                services__name__icontains=service
            )

        return queryset


# =========================
# BOOKING API
# =========================

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def perform_create(self, serializer):

        service_id = self.request.data.get("service")
        worker_id = self.request.data.get("worker")

        if not service_id:
            raise ValidationError({
                "service": "Service is required"
            })

        if not worker_id:
            raise ValidationError({
                "worker": "Worker is required"
            })

        service_obj = get_object_or_404(
            Service,
            id=service_id
        )

        worker = get_object_or_404(
            WorkerProfile,
            id=worker_id,
            is_available=True,
            is_online=True,
            is_verified=True,
        )

        if not worker.services.filter(
            id=service_obj.id
        ).exists():

            raise ValidationError({
                "error": "Worker does not provide this service"
            })

        serializer.save(
            customer=self.request.user,
            worker=worker.user,
            service=service_obj,
        )

        Notification.objects.create(
            user=worker.user,
            booking=serializer.instance,
            message=(
                f"You have received a new booking "
                f"for {service_obj.name} service."
            )
        )


# =========================
# REVIEW API
# =========================

class ReviewViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]

    queryset = Review.objects.all()

    serializer_class = ReviewSerializer

    def get_object(self):
        review = super().get_object()

        if review.customer != self.request.user:
            raise ValidationError(
                {"error": "You can edit only your own review."}
            )

        return review

    def perform_create(self, serializer):

        booking_id = self.request.data.get("booking")

        booking = get_object_or_404(
            Booking,
            id=booking_id
        )

        worker_profile = get_object_or_404(
            WorkerProfile,
            user=booking.worker
        )

        serializer.save(
            customer=self.request.user,
            worker=worker_profile,
            booking=booking,
        )

        average_rating = Review.objects.filter(
            worker=worker_profile
        ).aggregate(
            Avg("rating")
        )

        worker_profile.rating = average_rating["rating__avg"] or 0
        worker_profile.save()

    def perform_update(self, serializer):

        review = serializer.save()

        average_rating = Review.objects.filter(
            worker=review.worker
        ).aggregate(
            Avg("rating")
        )

        review.worker.rating = average_rating["rating__avg"] or 0
        review.worker.save()

# =========================
# PROTECTED TEST API
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def test_protected(request):
    return Response({
        "message": "You are logged in!",
        "user": request.user.username,
        "role": request.user.role
    })


# =========================
# UPDATE BOOKING STATUS
# =========================
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_booking_status(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)

        new_status = request.data.get("status")

        # Customer can cancel only own pending booking
        if new_status == "cancelled":

            if booking.customer != request.user:
                return Response(
                    {"error": "You can cancel only your own booking."},
                    status=403
                )

            if booking.status != "pending":
                return Response(
                    {"error": "Only pending bookings can be cancelled."},
                    status=400
                )

            booking.status = "cancelled"
            booking.save()

            return Response({
                "message": "Booking cancelled successfully.",
                "status": booking.status
            })

        # Worker can accept / reject / complete
        if booking.worker != request.user:
            return Response(
                {"error": "You are not allowed to update this booking."},
                status=403
            )

        if new_status not in ["accepted", "rejected", "completed"]:
            return Response(
                {"error": "Invalid status."},
                status=400
            )

        booking.status = new_status
        booking.save()

        return Response({
            "message": "Booking updated successfully.",
            "status": booking.status
        })

    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found."},
            status=404
        )


# =========================
# CUSTOMER DASHBOARD
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_dashboard(request):

    bookings = Booking.objects.filter(
        customer_id=request.user.id
    )

    return Response({
        "customer": request.user.username,

        "total_bookings": bookings.count(),

        "pending": bookings.filter(status="pending").count(),

        "accepted": bookings.filter(status="accepted").count(),

        "completed": bookings.filter(status="completed").count(),

        "cancelled": bookings.filter(status="cancelled").count(),

        "rejected": bookings.filter(status="rejected").count(),

        "bookings": BookingSerializer(bookings, many=True).data
    })

# =========================
# WORKER DASHBOARD
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_dashboard(request):

    bookings = Booking.objects.filter(worker_id=request.user.id)

    worker_profile = WorkerProfile.objects.get(
        user=request.user
    )

    total_reviews = Review.objects.filter(
        worker=worker_profile
    ).count()

    return Response({
    "worker": request.user.username,
    "rating": worker_profile.rating,
    "total_reviews": total_reviews,

    "total": bookings.count(),
    "pending": bookings.filter(status="pending").count(),
    "accepted": bookings.filter(status="accepted").count(),
    "completed": bookings.filter(status="completed").count(),

    "bookings": BookingSerializer(bookings, many=True).data,

    "is_online": worker_profile.is_online,
})



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications(request):

    notifications = Notification.objects.filter(
        user=request.user
    ).order_by("-created_at")
    notifications.filter(is_read=False).update(
    is_read=True
)   

    data = []

    for notification in notifications:
     data.append({
    "id": notification.id,
    "message": notification.message,
    "is_read": notification.is_read,
    "created_at": notification.created_at,
    "booking_id": notification.booking.id
        if notification.booking else None,
})

    return Response(data)

# =========================================================
# MARK NOTIFICATION AS READ
# =========================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):

    try:
        notification = Notification.objects.get(
            id=pk,
            user=request.user,
        )

    except Notification.DoesNotExist:
        return Response(
            {
                "error": "Notification not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    notification.is_read = True
    notification.save()

    return Response(
        {
            "message": "Notification marked as read.",
            "notification_id": notification.id,
            "is_read": notification.is_read,
        },
        status=status.HTTP_200_OK,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_count(request):

    count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()

    return Response({
        "count": count
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_verification(request):

    print("\n🔥🔥🔥 UPLOAD VERIFICATION HIT 🔥🔥🔥")
    print("USER:", request.user.username)
    print("DATA:", request.data)
    print("FILES:", request.FILES)

    # =====================================================
    # GET WORKER PROFILE
    # =====================================================

    try:
        worker = WorkerProfile.objects.get(
            user=request.user
        )

    except WorkerProfile.DoesNotExist:

        return Response(
            {
                "error": "Worker profile not found."
            },
            status=404,
        )

    # =====================================================
    # CNIC NUMBER
    # =====================================================

    cnic = request.data.get("cnic")

    if not cnic:

        return Response(
            {
                "error": "CNIC number is required."
            },
            status=400,
        )

    cnic = (
        str(cnic)
        .replace("-", "")
        .replace(" ", "")
        .strip()
    )

    # =====================================================
    # CNIC VALIDATION
    # =====================================================

    if not cnic.isdigit() or len(cnic) != 13:

        return Response(
            {
                "error": "CNIC must contain exactly 13 digits."
            },
            status=400,
        )

    # =====================================================
    # CNIC FRONT
    # =====================================================

    if "cnic_front" not in request.FILES:

        return Response(
            {
                "error": "CNIC front image is required."
            },
            status=400,
        )

    cnic_front = request.FILES["cnic_front"]

    # =====================================================
    # CNIC BACK
    # =====================================================

    cnic_back = request.FILES.get("cnic_back")

    # =====================================================
    # SELFIE
    # =====================================================

    if "selfie" not in request.FILES:

        return Response(
            {
                "error": "Selfie is required."
            },
            status=400,
        )

    selfie = request.FILES["selfie"]

    # =====================================================
    # SAVE TO WORKER PROFILE
    # =====================================================

    worker.cnic = cnic

    worker.cnic_front = cnic_front

    if cnic_back:
        worker.cnic_back = cnic_back

    worker.selfie = selfie

    worker.verification_status = "pending"

    worker.is_verified = False

    worker.save()

    print("🔥 WORKER PROFILE SAVED")
    print("🔥 WORKER:", worker.user.username)
    print("🔥 CNIC:", worker.cnic)

    # =====================================================
    # CREATE VERIFICATION RECORD
    # =====================================================

    verification = WorkerVerification.objects.create(

        worker=worker,

        country="Pakistan",

        document_type="cnic",

        document_number=cnic,

        document_front=cnic_front,

        document_back=cnic_back,

        selfie=selfie,

        status="pending",

    )

    print(
        "🔥 VERIFICATION RECORD CREATED:",
        verification.id
    )

    # =====================================================
    # RESPONSE
    # =====================================================

    return Response(
        {
            "message":
                "Verification documents uploaded successfully. "
                "Waiting for admin approval.",

            "verification_id":
                verification.id,

            "cnic":
                cnic,

            "verification_status":
                worker.verification_status,

            "is_verified":
                worker.is_verified,
        },
        status=200,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_workers(request):

    if not request.user.is_staff:
        return Response(
            {"error": "Admin only"},
            status=403
        )

    workers = WorkerProfile.objects.filter(
        verification_status="pending"
    )

    data = []

    for worker in workers:

      data.append({
    "id": worker.id,
    "name": worker.user.username,
    "cnic": worker.cnic,
    "status": worker.verification_status,
    "city": worker.city,

"experience": worker.experience_years,

"rating": worker.rating,

"services": [
    service.name
    for service in worker.services.all()
],

    "cnic_front": request.build_absolute_uri(worker.cnic_front.url)
    if worker.cnic_front else None,

    "cnic_back": request.build_absolute_uri(worker.cnic_back.url)
    if worker.cnic_back else None,

    "selfie": request.build_absolute_uri(worker.selfie.url)
    if worker.selfie else None,
})

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):

    if not request.user.is_staff:
        return Response(
            {"error": "Admin only"},
            status=403,
        )

    workers = WorkerProfile.objects.all()
    return Response({

    "total_users": User.objects.count(),

    "total_customers": User.objects.filter(
        role="customer"
    ).count(),

    "total_workers": User.objects.filter(
        role="worker"
    ).count(),

    "pending": workers.filter(
        verification_status="pending"
    ).count(),

    "approved": workers.filter(
        verification_status="approved"
    ).count(),

    "rejected": workers.filter(
        verification_status="rejected"
    ).count(),

    "total_bookings": Booking.objects.count(),

    "completed_bookings": Booking.objects.filter(
        status="completed"
    ).count(),

    "cancelled_bookings": Booking.objects.filter(
        status="cancelled"
    ).count(),

    "total_reviews": Review.objects.count(),

})

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def verify_worker(request, pk):

    if not request.user.is_staff:
        return Response(
            {"error": "Admin only"},
            status=403,
        )

    worker = get_object_or_404(
        WorkerProfile,
        id=pk,
    )

    action = request.data.get("action")

    if action == "approve":

        worker.verification_status = "approved"
        worker.is_verified = True

        worker.save()

        return Response({
            "message": "Worker approved successfully.",
        })

    elif action == "reject":

        worker.verification_status = "rejected"
        worker.is_verified = False

        worker.save()

        return Response({
            "message": "Worker rejected successfully.",
        })

    else:

        return Response(
            {"error": "Invalid action"},
            status=400,
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_profile(request, pk):

    worker = get_object_or_404(
        WorkerProfile,
        id=pk
    )

    return Response({

        "name": worker.user.username,

        "city": worker.city,

        "experience": worker.experience_years,

        "rating": worker.rating,

        "verified": worker.is_verified,

        "services": [
            service.name
            for service in worker.services.all()
        ],

        "cnic_front": request.build_absolute_uri(worker.cnic_front.url)
        if worker.cnic_front else None,

        "cnic_back": request.build_absolute_uri(worker.cnic_back.url)
        if worker.cnic_back else None,

        "selfie": request.build_absolute_uri(worker.selfie.url)
        if worker.selfie else None,
    })

# Register
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(["POST"])
def register(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    phone = request.data.get("phone")
    role = request.data.get("role", "customer")
    first_name = request.data.get("first_name", "")
    city = request.data.get("city", "")

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(phone=phone).exists():
        return Response(
            {"error": "Phone already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if role == "worker" and not city:
        return Response(
            {"error": "City is required for workers"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        phone=phone,
        role=role,
        first_name=first_name,
    )

    if role == "worker":
        WorkerProfile.objects.create(
            user=user,
            city=city,
        )

    return Response(
        {"message": "Account Created Successfully"},
        status=status.HTTP_201_CREATED,
    )

@api_view(["POST"])
def forgot_password(request):
    email = request.data.get("email")

    if not email:
        return Response(
            {"error": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email=email).first()

    if not user:
        return Response(
            {"error": "No account found with this email"},
            status=status.HTTP_404_NOT_FOUND,
        )

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

    send_mail(
        subject="Reset Your Service Marketplace Password",
        message=f"""
Hello,

Click the link below to reset your password:

{reset_link}

If you did not request this password reset, please ignore this email.

Service Marketplace
""",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({
        "message": "Password reset email sent successfully"
    })

@api_view(["POST"])
def reset_password(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

    except Exception:
        return Response(
            {"error": "Invalid reset link"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not default_token_generator.check_token(user, token):
        return Response(
            {"error": "Reset link has expired"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    password = request.data.get("password")

    if not password:
        return Response(
            {"error": "Password is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(password) < 8:
        return Response(
            {"error": "Password must be at least 8 characters long"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.password = make_password(password)
    user.save()

    return Response(
        {"message": "Password updated successfully"},
        status=status.HTTP_200_OK,
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def worker_online_status(request):

    print("REQUEST DATA:", request.data)
    print("USER:", request.user)
    print("USER ROLE:", request.user.role)

    if request.user.role != "worker":
        return Response(
            {"error": "Only workers can change status"},
            status=status.HTTP_403_FORBIDDEN,
        )

    worker = WorkerProfile.objects.get(user=request.user)

    print("Before:", worker.is_online)

    worker.is_online = request.data.get("is_online", False)
    worker.save()

    worker.refresh_from_db()

    print("After:", worker.is_online)

    return Response({
        "message": "Status Updated",
        "is_online": worker.is_online,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_worker_location(request):

    if request.user.role != "worker":
        return Response(
            {"error": "Only workers allowed"},
            status=403
        )

    worker = WorkerProfile.objects.get(user=request.user)

    worker.latitude = request.data.get("latitude")
    worker.longitude = request.data.get("longitude")

    from django.utils import timezone
    worker.last_location_update = timezone.now()

    worker.save()

    return Response({
        "message": "Location Updated"
    })

# =========================================================
# WORKER LOCATION API
# =========================================================

@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def worker_location(request):

    if request.user.role != "worker":
        return Response(
            {
                "error": "Only workers can access location."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        worker = WorkerProfile.objects.get(
            user=request.user
        )

    except WorkerProfile.DoesNotExist:
        return Response(
            {
                "error": "Worker profile not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "POST":

        serializer = WorkerLocationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            location, created = (
                WorkerLocation.objects.update_or_create(
                    worker=worker,
                    defaults=serializer.validated_data,
                )
            )

            response_serializer = WorkerLocationSerializer(
                location
            )

            return Response(
                {
                    "message": (
                        "Worker location updated successfully."
                    ),
                    "location": response_serializer.data,
                },
                status=(
                    status.HTTP_201_CREATED
                    if created
                    else status.HTTP_200_OK
                ),
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        location = WorkerLocation.objects.get(
            worker=worker
        )

    except WorkerLocation.DoesNotExist:
        return Response(
            {
                "message": "Worker location not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = WorkerLocationSerializer(location)

    return Response(
        {
            "worker": request.user.username,
            "location": serializer.data,
        },
        status=status.HTTP_200_OK,
    )

# =========================================================
# CUSTOMER LOCATION API
# =========================================================

@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def customer_location(request):

    # CUSTOMER ONLY
    if request.user.role != "customer":
        return Response(
            {
                "error": "Only customers can access this endpoint."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # GET LOCATION
    if request.method == "GET":

        try:
            location = CustomerLocation.objects.get(
                customer=request.user
            )

        except CustomerLocation.DoesNotExist:
            return Response(
                {
                    "error": "Customer location not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CustomerLocationSerializer(location)

        return Response(
            {
                "customer": request.user.username,
                "location": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # POST LOCATION

    serializer = CustomerLocationSerializer(
        data=request.data
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    location, created = CustomerLocation.objects.update_or_create(
        customer=request.user,
        defaults=serializer.validated_data,
    )

    response_serializer = CustomerLocationSerializer(
        location
    )

    return Response(
        {
            "message": (
                "Customer location created successfully."
                if created
                else "Customer location updated successfully."
            ),
            "location": response_serializer.data,
        },
        status=(
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        ),
    )

# =========================================================
# NEARBY WORKERS API
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def nearby_workers(request):

    # -----------------------------------------------------
    # CUSTOMER ONLY
    # -----------------------------------------------------

    if request.user.role != "customer":
        return Response(
            {
                "error": "Only customers can access nearby workers."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # -----------------------------------------------------
    # GET CUSTOMER LOCATION
    # -----------------------------------------------------

    try:
        customer_location = CustomerLocation.objects.get(
            customer=request.user
        )

    except CustomerLocation.DoesNotExist:
        return Response(
            {
                "error": "Customer location not found. Please update your location first."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    customer_lat = float(customer_location.latitude)
    customer_lon = float(customer_location.longitude)

    # -----------------------------------------------------
    # SEARCH RADIUS
    # Default = 5 KM
    # -----------------------------------------------------

    radius_km = float(request.query_params.get("radius", 5))

    # -----------------------------------------------------
    # GET ONLINE + AVAILABLE + VERIFIED WORKERS
    # -----------------------------------------------------

    workers = WorkerProfile.objects.filter(
        is_online=True,
        is_available=True,
        is_verified=True,
    ).select_related("user").prefetch_related("location")

    nearby = []

    # -----------------------------------------------------
    # CALCULATE DISTANCE
    # -----------------------------------------------------

    for worker in workers:

        try:
            worker_location = worker.location
        except WorkerLocation.DoesNotExist:
            continue

        worker_lat = float(worker_location.latitude)
        worker_lon = float(worker_location.longitude)

        # Convert degrees to radians
        lat1 = radians(customer_lat)
        lon1 = radians(customer_lon)
        lat2 = radians(worker_lat)
        lon2 = radians(worker_lon)

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            sin(dlat / 2) ** 2
            + cos(lat1)
            * cos(lat2)
            * sin(dlon / 2) ** 2
        )

        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        # Earth's radius in KM
        distance_km = 6371 * c

        # -------------------------------------------------
        # RADIUS FILTER
        # -------------------------------------------------

        if distance_km <= radius_km:

            nearby.append(
                {
                    "worker_id": worker.id,
                    "worker": worker.user.username,
                    "city": worker.city,
                    "experience_years": worker.experience_years,
                    "rating": worker.rating,
                    "distance_km": round(distance_km, 2),
                    "latitude": str(worker_location.latitude),
                    "longitude": str(worker_location.longitude),
                    "accuracy": worker_location.accuracy,
                    "speed": worker_location.speed,
                    "heading": worker_location.heading,
                    "updated_at": worker_location.updated_at,
                }
            )

    # -----------------------------------------------------
    # SORT BY DISTANCE
    # -----------------------------------------------------

    nearby.sort(
        key=lambda worker: worker["distance_km"]
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "customer": request.user.username,
            "radius_km": radius_km,
            "count": len(nearby),
            "workers": nearby,
        },
        status=status.HTTP_200_OK,
    )

    # =========================================================
# CUSTOMER BOOKING HISTORY
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_bookings(request):

    if request.user.role != "customer":
        return Response(
            {
                "error": "Only customers can access customer bookings."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    bookings = Booking.objects.filter(
        customer=request.user
    ).select_related(
        "worker",
        "service",
    ).order_by("-created_at")

    serializer = BookingSerializer(
        bookings,
        many=True
    )

    return Response(
        {
            "customer": request.user.username,
            "count": bookings.count(),
            "bookings": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


# =========================================================
# WORKER BOOKING HISTORY
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_bookings(request):

    if request.user.role != "worker":
        return Response(
            {
                "error": "Only workers can access worker bookings."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    bookings = Booking.objects.filter(
        worker=request.user
    ).select_related(
        "customer",
        "service",
    ).order_by("-created_at")

    serializer = BookingSerializer(
        bookings,
        many=True
    )

    return Response(
        {
            "worker": request.user.username,
            "count": bookings.count(),
            "bookings": serializer.data,
        },
        status=status.HTTP_200_OK,
    )