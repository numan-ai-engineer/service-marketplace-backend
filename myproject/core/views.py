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