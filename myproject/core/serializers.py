from rest_framework import serializers
from .models import User, Service, WorkerProfile, Booking, Review


# =========================
# USER SERIALIZER
# =========================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


# =========================
# SERVICE SERIALIZER
# =========================
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


# =========================
# WORKER SERIALIZER
# =========================
class WorkerProfileSerializer(serializers.ModelSerializer):

    user = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()

    class Meta:
        model = WorkerProfile
        fields = '__all__'

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "name": obj.user.username,
            "phone": obj.user.phone,
        }

    def get_services(self, obj):
        return [service.name for service in obj.services.all()]


# =========================
# BOOKING SERIALIZER (FINAL FIX)
# =========================
class BookingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['customer', 'worker']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["customer"] = {
            "id": instance.customer.id,
            "name": instance.customer.username,
            "phone": instance.customer.phone,
        }

        data["worker"] = {
            "id": instance.worker.id,
            "name": instance.worker.username,
            "phone": instance.worker.phone,
        }

        data["service"] = {
            "id": instance.service.id,
            "name": instance.service.name,
        }

        data["booking_date"] = instance.created_at
        
        return data
    # Review Serializer
class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.username",
        read_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "customer",
            "customer_name",
            "worker",
            "booking",
            "rating",
            "comment",
            "created_at",
        ]

        read_only_fields = [
            "customer",
            "worker",
            "created_at",
        ]

# Varification Serializer
class WorkerVerificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkerProfile
        fields = [
            "cnic",
            "cnic_front",
            "cnic_back",
            "selfie",
            "verification_status",
            "is_verified",
        ]

        read_only_fields = [
            "verification_status",
            "is_verified",
        ]