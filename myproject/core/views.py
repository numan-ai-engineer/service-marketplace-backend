from django.db.models import Avg
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from math import radians, sin, cos, sqrt, atan2

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import (
    User,
    Service,
    WorkerProfile,
    WorkerLocation,
    WorkerVerification,
    Booking,
    Review,
    Notification,
    CustomerLocation,
)

from .serializers import (
    UserSerializer,
    ServiceSerializer,
    WorkerProfileSerializer,
    BookingSerializer,
    ReviewSerializer,
    WorkerVerificationSerializer,
    WorkerLocationSerializer,
    CustomerLocationSerializer,
)

from .ocr import extract_cnic_data

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

        queryset = (
            WorkerProfile.objects
            .filter(
                is_online=True,
                is_available=True,
                is_verified=True,
            )
            .exclude(
                latitude=0,
                longitude=0,
            )
            .select_related("user")
            .prefetch_related("services")
        )

        # -------------------------------------------------
        # CITY FILTER
        # -------------------------------------------------

        city = self.request.query_params.get("city")

        if city:
            queryset = queryset.filter(
                city__icontains=city
            )

        # -------------------------------------------------
        # SERVICE FILTER
        # -------------------------------------------------

        service = self.request.query_params.get("service")

        if service:
            queryset = queryset.filter(
                services__name__icontains=service
            )

        # -------------------------------------------------
        # GPS RADIUS FILTER
        # -------------------------------------------------

        latitude = self.request.query_params.get("latitude")
        longitude = self.request.query_params.get("longitude")
        radius = self.request.query_params.get("radius")

        if latitude and longitude and radius:

            try:
                latitude = float(latitude)
                longitude = float(longitude)
                radius = float(radius)

            except (ValueError, TypeError):

                return queryset.none()

            # ---------------------------------------------
            # VALIDATE CUSTOMER GPS
            # ---------------------------------------------

            if not (
                -90 <= latitude <= 90
                and -180 <= longitude <= 180
            ):
                return queryset.none()

            # ---------------------------------------------
            # VALIDATE RADIUS
            # ---------------------------------------------

            if radius <= 0:
                return queryset.none()

            # ---------------------------------------------
            # CALCULATE DISTANCE
            # ---------------------------------------------

            def calculate_distance(worker):

                lat1 = radians(latitude)
                lon1 = radians(longitude)

                lat2 = radians(
                    float(worker.latitude)
                )

                lon2 = radians(
                    float(worker.longitude)
                )

                dlat = lat2 - lat1
                dlon = lon2 - lon1

                a = (
                    sin(dlat / 2) ** 2
                    +
                    cos(lat1)
                    * cos(lat2)
                    * sin(dlon / 2) ** 2
                )

                c = 2 * atan2(
                    sqrt(a),
                    sqrt(1 - a),
                )

                earth_radius_km = 6371.0

                return earth_radius_km * c

            # ---------------------------------------------
            # FIND WORKERS WITHIN RADIUS
            # ---------------------------------------------

            nearby_worker_ids = []

            for worker in queryset:

                try:
                    worker_latitude = float(
                        worker.latitude
                    )

                    worker_longitude = float(
                        worker.longitude
                    )

                except (TypeError, ValueError):

                    continue

                # -----------------------------------------
                # IGNORE INVALID GPS
                # -----------------------------------------

                if not (
                    -90 <= worker_latitude <= 90
                    and -180 <= worker_longitude <= 180
                ):
                    continue

                # -----------------------------------------
                # CALCULATE DISTANCE
                # -----------------------------------------

                distance = calculate_distance(
                    worker
                )

                # -----------------------------------------
                # RADIUS CHECK
                # -----------------------------------------

                if distance <= radius:

                    nearby_worker_ids.append(
                        worker.id
                    )

            # ---------------------------------------------
            # RETURN QUERYSET
            # ---------------------------------------------

            return queryset.filter(
                id__in=nearby_worker_ids
            )

        return queryset
    
# =====================================================
# NEARBY WORKERS API
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def nearby_workers(request):

    print("🔥🔥🔥 NEARBY WORKERS FUNCTION CALLED 🔥🔥🔥")

    # -----------------------------------------------------
    # CUSTOMER ONLY
    # -----------------------------------------------------

    if request.user.role != "customer":
        return Response(
            {
                "error": "Only customers can find nearby workers."
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

        customer_latitude = float(
            customer_location.latitude
        )

        customer_longitude = float(
            customer_location.longitude
        )

    except CustomerLocation.DoesNotExist:
        return Response(
            {
                "error": (
                    "Customer location not found. "
                    "Please update your GPS location first."
                )
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    except (TypeError, ValueError):
        return Response(
            {
                "error": "Customer GPS location is invalid."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # VALIDATE CUSTOMER GPS
    # -----------------------------------------------------

    if not (
        -90 <= customer_latitude <= 90
        and -180 <= customer_longitude <= 180
    ):
        return Response(
            {
                "error": "Customer GPS coordinates are invalid."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # SEARCH RADIUS
    # Default = 5 KM
    # -----------------------------------------------------

    try:
        radius_km = float(
            request.query_params.get("radius", 5)
        )
    except (TypeError, ValueError):
        return Response(
            {
                "error": "Radius must be a valid number."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if radius_km <= 0:
        return Response(
            {
                "error": "Radius must be greater than 0."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # GET ONLINE + AVAILABLE + VERIFIED WORKERS
    # -----------------------------------------------------

    workers = (
        WorkerProfile.objects
        .filter(
            is_online=True,
            is_available=True,
            is_verified=True,
        )
        .select_related("user")
        .prefetch_related("services")
    )

    print("=================================")
    print(
        "ELIGIBLE WORKERS:",
        workers.count()
    )
    print(
        "CUSTOMER LOCATION:",
        customer_latitude,
        customer_longitude
    )
    print(
        "SEARCH RADIUS:",
        radius_km,
        "KM"
    )
    print("=================================")

    nearby = []

    # -----------------------------------------------------
    # CHECK EACH WORKER
    # -----------------------------------------------------

    for worker in workers:

        print(
            "CHECKING WORKER:",
            worker.user.username
        )

        # -------------------------------------------------
        # GET LIVE WORKER LOCATION
        # -------------------------------------------------

        try:
            worker_location = WorkerLocation.objects.get(
                worker=worker
            )

            worker_latitude = float(
                worker_location.latitude
            )

            worker_longitude = float(
                worker_location.longitude
            )

        except WorkerLocation.DoesNotExist:

            print(
                "NO LIVE LOCATION:",
                worker.user.username
            )

            continue

        except (TypeError, ValueError):

            print(
                "INVALID WORKER GPS:",
                worker.user.username
            )

            continue

        # -------------------------------------------------
        # VALIDATE WORKER GPS
        # -------------------------------------------------

        if not (
            -90 <= worker_latitude <= 90
            and -180 <= worker_longitude <= 180
        ):

            print(
                "WORKER GPS OUT OF RANGE:",
                worker.user.username
            )

            continue

        # -------------------------------------------------
        # HAVERSINE DISTANCE
        # -------------------------------------------------

        earth_radius_km = 6371.0

        lat1 = radians(
            customer_latitude
        )

        lat2 = radians(
            worker_latitude
        )

        delta_lat = radians(
            worker_latitude
            - customer_latitude
        )

        delta_lon = radians(
            worker_longitude
            - customer_longitude
        )

        a = (
            sin(delta_lat / 2) ** 2
            +
            cos(lat1)
            * cos(lat2)
            * sin(delta_lon / 2) ** 2
        )

        c = 2 * atan2(
            sqrt(a),
            sqrt(1 - a)
        )

        distance_km = (
            earth_radius_km * c
        )

        print(
            "WORKER DISTANCE:",
            worker.user.username,
            round(distance_km, 2),
            "KM"
        )

        # -------------------------------------------------
        # RADIUS FILTER
        # -------------------------------------------------

        if distance_km > radius_km:

            print(
                "WORKER OUTSIDE RADIUS:",
                worker.user.username
            )

            continue

        # -------------------------------------------------
        # SERVICES
        # -------------------------------------------------

        services = []

        for service in worker.services.all():

            services.append(
                {
                    "id": service.id,
                    "name": service.name,
                }
            )

        # -------------------------------------------------
        # ADD WORKER
        # -------------------------------------------------

        nearby.append(
            {
                "id": worker.id,

                "worker_id": worker.id,

                "worker": worker.user.username,

                "name": worker.user.username,

                "user": {
                    "name": worker.user.username,
                },

                "phone": worker.user.phone,

                "city": worker.city,

                "experience_years":
                    worker.experience_years,

                "rating":
                    worker.rating,

                "is_online":
                    worker.is_online,

                "is_available":
                    worker.is_available,

                "is_verified":
                    worker.is_verified,

                "latitude":
                    worker_location.latitude,

                "longitude":
                    worker_location.longitude,

                "accuracy":
                    worker_location.accuracy,

                "speed":
                    worker_location.speed,

                "heading":
                    worker_location.heading,

                "updated_at":
                    worker_location.updated_at,

                "distance_km":
                    round(
                        distance_km,
                        2
                    ),

                "services":
                    services,
            }
        )

    # -----------------------------------------------------
    # SORT BY DISTANCE
    # -----------------------------------------------------

    nearby.sort(
        key=lambda worker:
        worker["distance_km"]
    )

    # -----------------------------------------------------
    # FINAL DEBUG
    # -----------------------------------------------------

    print(
        "FINAL NEARBY WORKERS:",
        len(nearby)
    )

    print("=================================")

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "customer":
                request.user.username,

            "radius_km":
                radius_km,

            "count":
                len(nearby),

            "workers":
                nearby,
        },
        status=status.HTTP_200_OK,
    )

# =========================
# BOOKING API
# =========================

class BookingViewSet(viewsets.ModelViewSet):

    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    # Booking API صرف GET اور POST allow کرے گی.
    # PUT / PATCH / DELETE کو disable کیا جا رہا ہے.
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):

        user = self.request.user

        # CUSTOMER BOOKINGS
        if user.role == "customer":

            return (
                Booking.objects
                .filter(
                    customer=user
                )
                .select_related(
                    "worker",
                    "service"
                )
            )

        # WORKER BOOKINGS
        if user.role == "worker":

            return (
                Booking.objects
                .filter(
                    worker=user
                )
                .select_related(
                    "customer",
                    "service"
                )
            )

        # OTHER USERS
        return Booking.objects.none()

    def perform_create(self, serializer):

        # -------------------------------------------------
        # CUSTOMER ONLY
        # -------------------------------------------------

        if self.request.user.role != "customer":

            raise ValidationError(
                {
                    "error":
                    "Only customers can create bookings."
                }
            )

        # -------------------------------------------------
        # GET SERVICE AND WORKER IDs
        # -------------------------------------------------

        service_id = self.request.data.get("service")
        worker_id = self.request.data.get("worker")

        # -------------------------------------------------
        # VALIDATE SERVICE
        # -------------------------------------------------

        if not service_id:

            raise ValidationError(
                {
                    "service":
                    "Service is required"
                }
            )

        # -------------------------------------------------
        # VALIDATE WORKER
        # -------------------------------------------------

        if not worker_id:

            raise ValidationError(
                {
                    "worker":
                    "Worker is required"
                }
            )

        # -------------------------------------------------
        # GET SERVICE
        # -------------------------------------------------

        service_obj = get_object_or_404(
            Service,
            id=service_id
        )

        # -------------------------------------------------
        # GET VERIFIED / AVAILABLE / ONLINE WORKER
        # -------------------------------------------------

        worker = get_object_or_404(
            WorkerProfile,
            id=worker_id,
            is_available=True,
            is_online=True,
            is_verified=True,
        )

        # -------------------------------------------------
        # CHECK WORKER PROVIDES SELECTED SERVICE
        # -------------------------------------------------

        if not worker.services.filter(
            id=service_obj.id
        ).exists():

            raise ValidationError(
                {
                    "error":
                    "Worker does not provide this service"
                }
            )

        # -------------------------------------------------
        # CREATE BOOKING
        # -------------------------------------------------

        serializer.save(
            customer=self.request.user,
            worker=worker.user,
            service=service_obj,
            status="pending",
        )

        # -------------------------------------------------
        # CREATE WORKER NOTIFICATION
        # -------------------------------------------------

        Notification.objects.create(
            user=worker.user,
            booking=serializer.instance,
            message=(
                f"You have received a new booking "
                f"for {service_obj.name} service."
            ),
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

        # ---------------------------------------------
        # ONLY REVIEW OWNER CAN EDIT
        # ---------------------------------------------

        if review.customer != self.request.user:

            raise ValidationError(
                {
                    "error":
                    "You can edit only your own review."
                }
            )

        return review

    def perform_create(self, serializer):

        # ---------------------------------------------
        # CUSTOMER ONLY
        # ---------------------------------------------

        if self.request.user.role != "customer":

            raise ValidationError(
                {
                    "error":
                    "Only customers can create reviews."
                }
            )

        # ---------------------------------------------
        # GET BOOKING ID
        # ---------------------------------------------

        booking_id = self.request.data.get("booking")

        if not booking_id:

            raise ValidationError(
                {
                    "booking":
                    "Booking is required."
                }
            )

        # ---------------------------------------------
        # GET CUSTOMER'S BOOKING
        # ---------------------------------------------

        booking = get_object_or_404(
            Booking,
            id=booking_id,
            customer=self.request.user,
        )

        # ---------------------------------------------
        # BOOKING MUST BE COMPLETED
        # ---------------------------------------------

        if booking.status != "completed":

            raise ValidationError(
                {
                    "error":
                    "You can review a booking only after it is completed."
                }
            )

        # ---------------------------------------------
        # GET WORKER PROFILE
        # ---------------------------------------------

        worker_profile = get_object_or_404(
            WorkerProfile,
            user=booking.worker
        )

        # ---------------------------------------------
        # PREVENT DUPLICATE REVIEW
        # ---------------------------------------------

        if Review.objects.filter(
            booking=booking
        ).exists():

            raise ValidationError(
                {
                    "error":
                    "You have already reviewed this booking."
                }
            )

        # ---------------------------------------------
        # CREATE REVIEW
        # ---------------------------------------------

        serializer.save(
            customer=self.request.user,
            worker=worker_profile,
            booking=booking,
        )

        # ---------------------------------------------
        # RECALCULATE WORKER RATING
        # ---------------------------------------------

        average_rating = Review.objects.filter(
            worker=worker_profile
        ).aggregate(
            Avg("rating")
        )

        worker_profile.rating = (
            average_rating["rating__avg"] or 0
        )

        worker_profile.save(
            update_fields=["rating"]
        )

    def perform_update(self, serializer):

        # ---------------------------------------------
        # UPDATE REVIEW
        # ---------------------------------------------

        review = serializer.save()

        # ---------------------------------------------
        # RECALCULATE WORKER RATING
        # ---------------------------------------------

        average_rating = Review.objects.filter(
            worker=review.worker
        ).aggregate(
            Avg("rating")
        )

        review.worker.rating = (
            average_rating["rating__avg"] or 0
        )

        review.worker.save(
            update_fields=["rating"]
        )

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

    # -----------------------------------------------------
    # GET BOOKING
    # -----------------------------------------------------

    booking = get_object_or_404(
        Booking,
        pk=pk,
    )

    new_status = request.data.get("status")

    # -----------------------------------------------------
    # CUSTOMER CANCEL
    # -----------------------------------------------------

    if new_status == "cancelled":

        if booking.customer != request.user:

            return Response(
                {
                    "error":
                    "You can cancel only your own booking."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking.status != "pending":

            return Response(
                {
                    "error":
                    "Only pending bookings can be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = "cancelled"

        booking.save(
            update_fields=["status"]
        )

        # -------------------------------------------------
        # NOTIFY WORKER
        # -------------------------------------------------

        Notification.objects.create(
            user=booking.worker,
            booking=booking,
            message="Customer cancelled the booking.",
        )

        return Response(
            {
                "message":
                "Booking cancelled successfully.",

                "status":
                booking.status,
            },
            status=status.HTTP_200_OK,
        )

    # -----------------------------------------------------
    # WORKER ONLY
    # -----------------------------------------------------

    if booking.worker != request.user:

        return Response(
            {
                "error":
                "You are not allowed to update this booking."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # -----------------------------------------------------
    # ACCEPT
    # -----------------------------------------------------

    if new_status == "accepted":

        # ---------------------------------------------
        # GET WORKER PROFILE
        # ---------------------------------------------

        try:

            worker_profile = WorkerProfile.objects.get(
                user=request.user
            )

        except WorkerProfile.DoesNotExist:

            return Response(
                {
                    "error":
                    "Worker profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ---------------------------------------------
        # WORKER VERIFICATION
        # ---------------------------------------------

        if not worker_profile.is_verified:

            return Response(
                {
                    "error": (
                        "Your account is not verified. "
                        "Please complete identity verification "
                        "and wait for admin approval before "
                        "accepting bookings."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ---------------------------------------------
        # BOOKING MUST BE PENDING
        # ---------------------------------------------

        if booking.status != "pending":

            return Response(
                {
                    "error":
                    "Only pending bookings can be accepted."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # ACCEPT BOOKING
        # ---------------------------------------------

        booking.status = "accepted"

        booking.save(
            update_fields=["status"]
        )

        # ---------------------------------------------
        # NOTIFY CUSTOMER
        # ---------------------------------------------

        Notification.objects.create(
            user=booking.customer,
            booking=booking,
            message="Worker accepted your booking request.",
        )

        return Response(
            {
                "message":
                "Booking accepted successfully.",

                "status":
                booking.status,
            },
            status=status.HTTP_200_OK,
        )

    # -----------------------------------------------------
    # REJECT
    # -----------------------------------------------------

    if new_status == "rejected":

        if booking.status != "pending":

            return Response(
                {
                    "error":
                    "Only pending bookings can be rejected."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # REJECT BOOKING
        # ---------------------------------------------

        booking.status = "rejected"

        booking.save(
            update_fields=["status"]
        )

        # ---------------------------------------------
        # NOTIFY CUSTOMER
        # ---------------------------------------------

        Notification.objects.create(
            user=booking.customer,
            booking=booking,
            message="Worker rejected your booking request.",
        )

        return Response(
            {
                "message":
                "Booking rejected successfully.",

                "status":
                booking.status,
            },
            status=status.HTTP_200_OK,
        )

    # -----------------------------------------------------
    # COMPLETE
    # -----------------------------------------------------

    if new_status == "completed":

        if booking.status != "accepted":

            return Response(
                {
                    "error":
                    "Only accepted bookings can be completed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # COMPLETE BOOKING
        # ---------------------------------------------

        booking.status = "completed"

        booking.save(
            update_fields=["status"]
        )

        # ---------------------------------------------
        # NOTIFY CUSTOMER
        # ---------------------------------------------

        Notification.objects.create(
            user=booking.customer,
            booking=booking,
            message="Your booking has been completed.",
        )

        return Response(
            {
                "message":
                "Booking completed successfully.",

                "status":
                booking.status,
            },
            status=status.HTTP_200_OK,
        )

    # -----------------------------------------------------
    # INVALID STATUS
    # -----------------------------------------------------

    return Response(
        {
            "error": (
                "Invalid status. Allowed statuses are: "
                "accepted, rejected, completed, cancelled."
            )
        },
        status=status.HTTP_400_BAD_REQUEST,
    )

# =========================
# CUSTOMER DASHBOARD
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_dashboard(request):

    bookings = Booking.objects.filter(
        customer=request.user
    )

    return Response(
        {
            "customer": request.user.username,

            "total_bookings":
                bookings.count(),

            "pending":
                bookings.filter(
                    status="pending"
                ).count(),

            "accepted":
                bookings.filter(
                    status="accepted"
                ).count(),

            "completed":
                bookings.filter(
                    status="completed"
                ).count(),

            "cancelled":
                bookings.filter(
                    status="cancelled"
                ).count(),

            "rejected":
                bookings.filter(
                    status="rejected"
                ).count(),

            "bookings":
                BookingSerializer(
                    bookings,
                    many=True
                ).data,
        }
    )

# =========================
# WORKER DASHBOARD
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_dashboard(request):

    # Worker account check
    if request.user.role != "worker":
        return Response(
            {
                "error": "Only workers can access worker dashboard."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # Safely get worker profile
    worker_profile = (
        WorkerProfile.objects
        .filter(user=request.user)
        .first()
    )

    if not worker_profile:
        return Response(
            {
                "error": "Worker profile not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # Get worker bookings
    bookings = (
        Booking.objects
        .filter(worker=request.user)
        .select_related(
            "customer",
            "worker",
            "service",
        )
        .order_by("-created_at")
    )

    # Total reviews
    total_reviews = Review.objects.filter(
        worker=worker_profile
    ).count()

    return Response(
        {
            "worker": request.user.username,

            "rating": worker_profile.rating,

            "total_reviews": total_reviews,

            "total": bookings.count(),

            "pending": bookings.filter(
                status="pending"
            ).count(),

            "accepted": bookings.filter(
                status="accepted"
            ).count(),

            "completed": bookings.filter(
                status="completed"
            ).count(),

            "rejected": bookings.filter(
                status="rejected"
            ).count(),

            "cancelled": bookings.filter(
                status="cancelled"
            ).count(),

            "bookings": BookingSerializer(
                bookings,
                many=True
            ).data,

            "is_online": worker_profile.is_online,
        },
        status=status.HTTP_200_OK,
    )

# =========================
# WORKER NOTIFICATION
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications(request):

    notifications = (
        Notification.objects
        .filter(
            user=request.user
        )
        .order_by("-created_at")
    )

    # Mark unread notifications as read
    notifications.filter(
        is_read=False
    ).update(
        is_read=True
    )

    data = []

    for notification in notifications:

        data.append(
            {
                "id": notification.id,

                "message":
                    notification.message,

                "is_read":
                    notification.is_read,

                "created_at":
                    notification.created_at,

                "booking_id":
                    notification.booking.id
                    if notification.booking
                    else None,
            }
        )

    return Response(
        data,
        status=status.HTTP_200_OK,
    )

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
    notification.save(
    update_fields=["is_read"]
)

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
    # CHECK CURRENT VERIFICATION
    # =====================================================

    latest_verification = (
        WorkerVerification.objects
        .filter(worker=worker)
        .order_by("-created_at")
        .first()
    )

    if latest_verification:

        # -------------------------------------------------
        # PENDING
        # -------------------------------------------------

        if latest_verification.status == "pending":

            return Response(
                {
                    "error": "Your verification is already pending. Please wait for admin review.",
                    "verification_id": latest_verification.id,
                    "verification_status": "pending",
                },
                status=400,
            )

        # -------------------------------------------------
        # APPROVED
        # -------------------------------------------------

        if latest_verification.status == "approved":

            return Response(
                {
                    "error": "Your verification has already been approved.",
                    "verification_id": latest_verification.id,
                    "verification_status": "approved",
                    "is_verified": worker.is_verified,
                },
                status=400,
            )

        # -------------------------------------------------
        # PROCESSING
        # -------------------------------------------------

        if latest_verification.status == "processing":

            return Response(
                {
                    "error": "Your verification is currently being processed. Please wait.",
                    "verification_id": latest_verification.id,
                    "verification_status": "processing",
                },
                status=400,
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
    # CREATE NEW VERIFICATION RECORD
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

        rejection_reason=None,
    )

    print(
        "🔥 NEW VERIFICATION RECORD CREATED:",
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

# =========================
# PENDING WORKERS
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_workers(request):

    # -----------------------------------------------------
    # ADMIN ONLY
    # -----------------------------------------------------

    if not request.user.is_staff:

        return Response(
            {
                "error": "Admin only"
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # -----------------------------------------------------
    # GET PENDING WORKERS
    # -----------------------------------------------------

    workers = WorkerProfile.objects.filter(
        verification_status="pending"
    )

    data = []

    # -----------------------------------------------------
    # BUILD RESPONSE
    # -----------------------------------------------------

    for worker in workers:

        data.append(
            {
                "id":
                    worker.id,

                "name":
                    worker.user.username,

                "cnic":
                    worker.cnic,

                "status":
                    worker.verification_status,

                "city":
                    worker.city,

                "experience":
                    worker.experience_years,

                "rating":
                    worker.rating,

                "services": [
                    service.name
                    for service in worker.services.all()
                ],

                "cnic_front":
                    request.build_absolute_uri(
                        worker.cnic_front.url
                    )
                    if worker.cnic_front
                    else None,

                "cnic_back":
                    request.build_absolute_uri(
                        worker.cnic_back.url
                    )
                    if worker.cnic_back
                    else None,

                "selfie":
                    request.build_absolute_uri(
                        worker.selfie.url
                    )
                    if worker.selfie
                    else None,
            }
        )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        data,
        status=status.HTTP_200_OK,
    )

# =========================
# ADMIN DASHBOARD
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):

    # -----------------------------------------------------
    # ADMIN ONLY
    # -----------------------------------------------------

    if not request.user.is_staff:

        return Response(
            {
                "error": "Admin only"
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # -----------------------------------------------------
    # GET WORKERS
    # -----------------------------------------------------

    workers = WorkerProfile.objects.all()

    # -----------------------------------------------------
    # DASHBOARD RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "total_users":
                User.objects.count(),

            "total_customers":
                User.objects.filter(
                    role="customer"
                ).count(),

            "total_workers":
                User.objects.filter(
                    role="worker"
                ).count(),

            "pending":
                workers.filter(
                    verification_status="pending"
                ).count(),

            "approved":
                workers.filter(
                    verification_status="approved"
                ).count(),

            "rejected":
                workers.filter(
                    verification_status="rejected"
                ).count(),

            "total_bookings":
                Booking.objects.count(),

            "completed_bookings":
                Booking.objects.filter(
                    status="completed"
                ).count(),

            "cancelled_bookings":
                Booking.objects.filter(
                    status="cancelled"
                ).count(),

            "total_reviews":
                Review.objects.count(),
        },
        status=status.HTTP_200_OK,
    )

# =========================
# VERIFY WORKER
# =========================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def verify_worker(request, pk):

    # -----------------------------------------------------
    # ADMIN CHECK
    # -----------------------------------------------------

    if not request.user.is_staff:

        return Response(
            {
                "error": "Admin only"
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # -----------------------------------------------------
    # GET WORKER
    # -----------------------------------------------------

    worker = get_object_or_404(
        WorkerProfile,
        id=pk,
    )

    # -----------------------------------------------------
    # GET LATEST PENDING VERIFICATION
    # -----------------------------------------------------

    verification = (
        WorkerVerification.objects
        .filter(
            worker=worker,
            status="pending",
        )
        .order_by("-created_at")
        .first()
    )

    if not verification:

        return Response(
            {
                "error":
                "No pending verification found for this worker."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # -----------------------------------------------------
    # GET ACTION
    # -----------------------------------------------------

    action = request.data.get("action")

    # -----------------------------------------------------
    # APPROVE
    # -----------------------------------------------------

    if action == "approve":

        verification.status = "approved"
        verification.rejection_reason = None
        verification.reviewed_by = request.user
        verification.reviewed_at = timezone.now()

        verification.save()

        worker.verification_status = "approved"
        worker.is_verified = True

        worker.save()

        return Response(
            {
                "message":
                "Worker verification approved successfully.",

                "worker_id":
                worker.id,

                "verification_id":
                verification.id,

                "verification_status":
                verification.status,

                "is_verified":
                worker.is_verified,
            },
            status=status.HTTP_200_OK,
        )

    # -----------------------------------------------------
    # REJECT
    # -----------------------------------------------------

    elif action == "reject":

        rejection_reason = request.data.get(
            "rejection_reason"
        )

        if not rejection_reason:

            return Response(
                {
                    "error":
                    "Rejection reason is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification.status = "rejected"
        verification.rejection_reason = rejection_reason
        verification.reviewed_by = request.user
        verification.reviewed_at = timezone.now()

        verification.save()

        worker.verification_status = "rejected"
        worker.is_verified = False

        worker.save()

        return Response(
            {
                "message":
                "Worker verification rejected.",

                "worker_id":
                worker.id,

                "verification_id":
                verification.id,

                "verification_status":
                verification.status,

                "rejection_reason":
                verification.rejection_reason,

                "is_verified":
                worker.is_verified,
            },
            status=status.HTTP_200_OK,
        )

    # -----------------------------------------------------
    # INVALID ACTION
    # -----------------------------------------------------

    return Response(
        {
            "error":
            "Invalid action. Use 'approve' or 'reject'."
        },
        status=status.HTTP_400_BAD_REQUEST,
    )

# =====================================================
# PENDING VERIFICATIONS
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_verifications(request):

    if not request.user.is_staff:
        return Response(
            {"error": "Admin only"},
            status=403,
        )

    verifications = (
        WorkerVerification.objects
        .filter(status="pending")
        .select_related("worker", "worker__user")
        .order_by("-created_at")
    )

    serializer = WorkerVerificationSerializer(
        verifications,
        many=True,
        context={"request": request},
    )

    return Response(
        serializer.data,
        status=200,
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

# =========================
# FORGOT PASSWORD
# =========================

@api_view(["POST"])
def forgot_password(request):

    email = request.data.get("email")

    # -----------------------------------------------------
    # EMAIL REQUIRED
    # -----------------------------------------------------

    if not email:

        return Response(
            {
                "error":
                "Email is required"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = User.objects.filter(
        email=email
    ).first()

    if not user:

        return Response(
            {
                "error":
                "No account found with this email"
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # -----------------------------------------------------
    # CREATE RESET TOKEN
    # -----------------------------------------------------

    uid = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    token = default_token_generator.make_token(
        user
    )

    # -----------------------------------------------------
    # RESET LINK
    # -----------------------------------------------------

    reset_link = (
        f"http://localhost:5173/"
        f"reset-password/{uid}/{token}"
    )

    # -----------------------------------------------------
    # SEND EMAIL
    # -----------------------------------------------------

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

        recipient_list=[
            email
        ],

        fail_silently=False,
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "message":
            "Password reset email sent successfully"
        },
        status=status.HTTP_200_OK,
    )

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

# =========================
# WORKER ONLINE STATUS
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def worker_online_status(request):

    print("REQUEST DATA:", request.data)
    print("USER:", request.user)
    print("USER ROLE:", request.user.role)

    # -----------------------------------------------------
    # WORKER ONLY
    # -----------------------------------------------------

    if request.user.role != "worker":

        return Response(
            {
                "error":
                "Only workers can change status"
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # -----------------------------------------------------
    # GET WORKER PROFILE
    # -----------------------------------------------------

    worker = get_object_or_404(
        WorkerProfile,
        user=request.user,
    )

    print("Before:", worker.is_online)

    # -----------------------------------------------------
    # GET ONLINE STATUS
    # -----------------------------------------------------

    is_online = request.data.get(
        "is_online",
        False
    )

    # -----------------------------------------------------
    # VALIDATE BOOLEAN VALUE
    # -----------------------------------------------------

    if isinstance(is_online, str):

        is_online = is_online.lower() in [
            "true",
            "1",
            "yes",
        ]

    else:

        is_online = bool(is_online)

    # -----------------------------------------------------
    # UPDATE STATUS
    # -----------------------------------------------------

    worker.is_online = is_online

    worker.save(
        update_fields=["is_online"]
    )

    worker.refresh_from_db()

    print("After:", worker.is_online)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "message":
            "Status Updated",

            "is_online":
            worker.is_online,
        },
        status=status.HTTP_200_OK,
    )

# =========================
# UPDATE WORKER LOCATION
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_worker_location(request):

    # -----------------------------------------------------
    # WORKER ONLY
    # -----------------------------------------------------

    if request.user.role != "worker":

        return Response(
            {
                "error":
                "Only workers allowed"
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # -----------------------------------------------------
    # GET WORKER PROFILE
    # -----------------------------------------------------

    worker = get_object_or_404(
        WorkerProfile,
        user=request.user,
    )

    # -----------------------------------------------------
    # GET LOCATION
    # -----------------------------------------------------

    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")

    # -----------------------------------------------------
    # VALIDATE LOCATION
    # -----------------------------------------------------

    if latitude is None or longitude is None:

        return Response(
            {
                "error":
                "Latitude and longitude are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # CONVERT TO FLOAT
    # -----------------------------------------------------

    try:

        latitude = float(latitude)
        longitude = float(longitude)

    except (TypeError, ValueError):

        return Response(
            {
                "error":
                "Latitude and longitude must be valid numbers."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # VALIDATE LATITUDE RANGE
    # -----------------------------------------------------

    if not -90 <= latitude <= 90:

        return Response(
            {
                "error":
                "Latitude must be between -90 and 90."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # VALIDATE LONGITUDE RANGE
    # -----------------------------------------------------

    if not -180 <= longitude <= 180:

        return Response(
            {
                "error":
                "Longitude must be between -180 and 180."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # UPDATE LOCATION
    # -----------------------------------------------------

    worker.latitude = latitude
    worker.longitude = longitude
    worker.last_location_update = timezone.now()

    worker.save(
        update_fields=[
            "latitude",
            "longitude",
            "last_location_update",
        ]
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "message":
            "Location Updated",

            "latitude":
            worker.latitude,

            "longitude":
            worker.longitude,

            "last_location_update":
            worker.last_location_update,
        },
        status=status.HTTP_200_OK,
    )

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

    print("🔥 NEARBY WORKERS API CALLED 🔥")

    # -----------------------------------------------------
    # CUSTOMER ONLY
    # -----------------------------------------------------

    if request.user.role != "customer":

        return Response(
            {
                "error":
                "Only customers can access nearby workers."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # -----------------------------------------------------
    # CUSTOMER LOCATION
    # -----------------------------------------------------

    try:

        customer_location = CustomerLocation.objects.get(
            customer=request.user
        )

    except CustomerLocation.DoesNotExist:

        return Response(
            {
                "error":
                "Customer location not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # -----------------------------------------------------
    # CUSTOMER GPS
    # -----------------------------------------------------

    try:

        customer_lat = float(
            customer_location.latitude
        )

        customer_lon = float(
            customer_location.longitude
        )

    except (TypeError, ValueError):

        return Response(
            {
                "error":
                "Customer location is invalid."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # VALIDATE CUSTOMER GPS RANGE
    # -----------------------------------------------------

    if not -90 <= customer_lat <= 90:

        return Response(
            {
                "error":
                "Customer latitude is invalid."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not -180 <= customer_lon <= 180:

        return Response(
            {
                "error":
                "Customer longitude is invalid."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    print(
        "CUSTOMER LOCATION:",
        customer_lat,
        customer_lon,
    )

    # -----------------------------------------------------
    # SEARCH RADIUS
    # DEFAULT = 20 KM
    # -----------------------------------------------------

    try:

        radius_km = float(
            request.query_params.get(
                "radius",
                20
            )
        )

    except (TypeError, ValueError):

        radius_km = 20.0

    # -----------------------------------------------------
    # VALIDATE RADIUS
    # -----------------------------------------------------

    if radius_km <= 0:

        return Response(
            {
                "error":
                "Radius must be greater than 0."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    print(
        "RADIUS:",
        radius_km
    )

    # -----------------------------------------------------
    # GET ONLINE / AVAILABLE / VERIFIED WORKERS
    # -----------------------------------------------------

    workers = (
        WorkerProfile.objects
        .filter(
            is_online=True,
            is_available=True,
            is_verified=True,
        )
        .select_related("user")
        .prefetch_related("services")
    )

    print(
        "ONLINE AVAILABLE VERIFIED WORKERS:",
        workers.count()
    )

    nearby = []

    # -----------------------------------------------------
    # CHECK EACH WORKER
    # -----------------------------------------------------

    for worker in workers:

        print(
            "CHECKING WORKER:",
            worker.id,
            worker.user.username,
        )

        # -------------------------------------------------
        # GET WORKER LOCATION
        # -------------------------------------------------

        try:

            worker_location = WorkerLocation.objects.get(
                worker=worker
            )

        except WorkerLocation.DoesNotExist:

            print(
                "NO LOCATION FOUND FOR WORKER:",
                worker.id
            )

            continue

        # -------------------------------------------------
        # WORKER GPS
        # -------------------------------------------------

        try:

            worker_lat = float(
                worker_location.latitude
            )

            worker_lon = float(
                worker_location.longitude
            )

        except (TypeError, ValueError):

            print(
                "INVALID WORKER GPS:",
                worker.id
            )

            continue

        # -------------------------------------------------
        # VALIDATE WORKER GPS RANGE
        # -------------------------------------------------

        if not -90 <= worker_lat <= 90:

            print(
                "INVALID WORKER LATITUDE:",
                worker.id
            )

            continue

        if not -180 <= worker_lon <= 180:

            print(
                "INVALID WORKER LONGITUDE:",
                worker.id
            )

            continue

        print(
            "WORKER LOCATION:",
            worker.id,
            worker_lat,
            worker_lon,
        )

        # -------------------------------------------------
        # HAVERSINE DISTANCE
        # -------------------------------------------------

        lat1 = radians(
            customer_lat
        )

        lon1 = radians(
            customer_lon
        )

        lat2 = radians(
            worker_lat
        )

        lon2 = radians(
            worker_lon
        )

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            sin(dlat / 2) ** 2
            + cos(lat1)
            * cos(lat2)
            * sin(dlon / 2) ** 2
        )

        c = 2 * atan2(
            sqrt(a),
            sqrt(1 - a)
        )

        distance_km = 6371.0 * c

        print(
            "WORKER:",
            worker.id,
            "DISTANCE:",
            distance_km,
            "KM",
        )

        # -------------------------------------------------
        # RADIUS FILTER
        # -------------------------------------------------

        if distance_km > radius_km:

            print(
                "WORKER OUTSIDE RADIUS:",
                worker.id
            )

            continue

        print(
            "WORKER INSIDE RADIUS:",
            worker.id
        )

        # -------------------------------------------------
        # SERVICES
        # -------------------------------------------------

        services = []

        for service in worker.services.all():

            services.append(
                {
                    "id":
                        service.id,

                    "name":
                        service.name,
                }
            )

        # -------------------------------------------------
        # ADD WORKER
        # -------------------------------------------------

        nearby.append(
            {
                "id":
                    worker.id,

                "worker_id":
                    worker.id,

                "worker":
                    worker.user.username,

                "user":
                    {
                        "name":
                            worker.user.username,
                    },

                "city":
                    worker.city,

                "experience_years":
                    worker.experience_years,

                "rating":
                    worker.rating,

                "is_online":
                    worker.is_online,

                "is_available":
                    worker.is_available,

                "is_verified":
                    worker.is_verified,

                "distance_km":
                    round(
                        distance_km,
                        2,
                    ),

                "latitude":
                    str(
                        worker_location.latitude
                    ),

                "longitude":
                    str(
                        worker_location.longitude
                    ),

                "accuracy":
                    worker_location.accuracy,

                "speed":
                    worker_location.speed,

                "heading":
                    worker_location.heading,

                "updated_at":
                    worker_location.updated_at,

                "services":
                    services,
            }
        )

    # -----------------------------------------------------
    # SORT NEAREST FIRST
    # -----------------------------------------------------

    nearby.sort(
        key=lambda worker:
        worker["distance_km"]
    )

    print(
        "FINAL NEARBY WORKERS:",
        nearby
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "customer":
                request.user.username,

            "radius_km":
                radius_km,

            "count":
                len(nearby),

            "workers":
                nearby,
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

# =====================================================
# WORKER VERIFICATION STATUS
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_verification_status(request):

    # =====================================================
    # GET WORKER PROFILE
    # =====================================================

    worker = get_object_or_404(
        WorkerProfile,
        user=request.user,
    )

    # =====================================================
    # GET LATEST VERIFICATION
    # =====================================================

    verification = (
        WorkerVerification.objects
        .filter(worker=worker)
        .order_by("-created_at")
        .first()
    )

    # =====================================================
    # NO VERIFICATION
    # =====================================================

    if not verification:
        return Response(
            {
                "worker_id": worker.id,
                "verification_status": "not_submitted",
                "is_verified": worker.is_verified,
                "message": "Verification documents have not been submitted yet.",
            },
            status=status.HTTP_200_OK,
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    return Response(
        {
            "worker_id": worker.id,
            "verification_id": verification.id,
            "verification_status": verification.status,
            "is_verified": worker.is_verified,
            "rejection_reason": verification.rejection_reason,
            "document_type": verification.document_type,
            "country": verification.country,
            "reviewed_at": verification.reviewed_at,
            "created_at": verification.created_at,
        },
        status=status.HTTP_200_OK,
    )