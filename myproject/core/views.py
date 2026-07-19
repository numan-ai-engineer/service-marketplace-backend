from django.db.models import Avg
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .serializers import WorkerVerificationSerializer
from .models import WorkerProfile

from .models import User, Service, WorkerProfile, Booking, Review, Notification
from .serializers import (
    UserSerializer,
    ServiceSerializer,
    WorkerProfileSerializer,
    BookingSerializer,
    ReviewSerializer,
)

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
        queryset = WorkerProfile.objects.all()

        city = self.request.query_params.get('city')
        service = self.request.query_params.get('service')

        if city:
            queryset = queryset.filter(city__icontains=city)

        if service:
            queryset = queryset.filter(services__name__icontains=service)

        return queryset


# =========================
# BOOKING API (AUTO ASSIGN FIXED)
# =========================
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def perform_create(self, serializer):

        service_id = self.request.data.get("service")

        if not service_id:
            raise ValidationError({"service": "Service is required"})

        service_obj = Service.objects.get(id=service_id)

        worker = WorkerProfile.objects.filter(
            services=service_obj
        ).first()

        if not worker:
            raise ValidationError(
                {"error": "No worker found for this service"}
            )

        serializer.save(
            customer=self.request.user,
            worker=worker.user,
            service=service_obj,
        )
        Notification.objects.create(
    user=worker.user,
    message=f"You have received a new booking for {service_obj.name} service."
)

# =========================
# REVIEW API
# =========================
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_queryset(self):
        return Review.objects.all()

    def get_object(self):
        review = super().get_object()

        if review.customer != self.request.user:
            raise ValidationError(
                {"error": "You can edit only your own review."}
            )

        return review

    def perform_create(self, serializer):
        booking_id = self.request.data.get("booking")

        booking = Booking.objects.get(id=booking_id)

        worker_profile = WorkerProfile.objects.get(
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

        "bookings": BookingSerializer(bookings, many=True).data
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
        })

    return Response(data)
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

    worker = WorkerProfile.objects.get(user=request.user)

    worker.cnic = request.data.get("cnic")

    if "cnic_front" in request.FILES:
        worker.cnic_front = request.FILES["cnic_front"]

    if "cnic_back" in request.FILES:
        worker.cnic_back = request.FILES["cnic_back"]

    if "selfie" in request.FILES:
        worker.selfie = request.FILES["selfie"]

    worker.verification_status = "pending"
    worker.save()

    return Response({
        "message": "Verification uploaded successfully."
    })

