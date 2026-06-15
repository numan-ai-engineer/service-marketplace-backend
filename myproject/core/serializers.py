from rest_framework import serializers
from .models import User, Service, WorkerProfile, Booking


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


# ⭐ PROFESSIONAL WORKER SERIALIZER
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

class BookingSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    worker = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'

    def get_customer(self, obj):
        return {
            "id": obj.customer.id,
            "name": obj.customer.username,
            "phone": obj.customer.phone,
        }

    def get_worker(self, obj):
        return {
            "id": obj.worker.id,
            "name": obj.worker.username,
            "phone": obj.worker.phone,
        }

    def get_service(self, obj):
        return {
            "id": obj.service.id,
            "name": obj.service.name,
        }