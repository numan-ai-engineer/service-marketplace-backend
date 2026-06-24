from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import User, Service, WorkerProfile, Booking
from .serializers import (
    UserSerializer,
    ServiceSerializer,
    WorkerProfileSerializer,
    BookingSerializer
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
            service=service_obj
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
    try:
        booking = Booking.objects.get(pk=pk)

        if booking.worker != request.user:
            return Response(
                {"error": "You are not allowed to update this booking"},
                status=403
            )

        new_status = request.data.get("status")

        if new_status not in ["accepted", "rejected", "completed"]:
            return Response(
                {"error": "Invalid status"},
                status=400
            )

        booking.status = new_status
        booking.save()

        return Response({
            "message": "Booking updated successfully",
            "status": booking.status
        })

    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)


# =========================
# CUSTOMER DASHBOARD
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_dashboard(request):

    bookings = Booking.objects.filter(customer_id=request.user.id)

    return Response({
        "customer": request.user.username,
        "total_bookings": bookings.count(),
        "bookings": BookingSerializer(bookings, many=True).data
    })


# =========================
# WORKER DASHBOARD
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_dashboard(request):

    bookings = Booking.objects.filter(worker_id=request.user.id)

    return Response({
        "worker": request.user.username,
        "total": bookings.count(),
        "pending": bookings.filter(status="pending").count(),
        "accepted": bookings.filter(status="accepted").count(),
        "completed": bookings.filter(status="completed").count(),
        "bookings": BookingSerializer(bookings, many=True).data
    })