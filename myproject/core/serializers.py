from rest_framework import serializers
from .models import User, Service, WorkerProfile, Booking


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
# BOOKING SERIALIZER (FIXED)
# =========================
class BookingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['customer', 'worker']

    # response beautify (optional but helpful)
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

        return data