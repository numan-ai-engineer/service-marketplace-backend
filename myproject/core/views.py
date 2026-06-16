from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
# BOOKING API
# =========================
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer


# =========================
# PROTECTED TEST API (JWT)
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def test_protected(request):
    return Response({
        "message": "You are logged in!",
        "user": request.user.username,
        "role": request.user.role
    })

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_booking_status(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)

        # only assigned worker can update
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