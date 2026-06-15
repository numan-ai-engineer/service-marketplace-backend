from django.contrib.auth.models import AbstractUser
from django.db import models


# Custom User
class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('worker', 'Worker'),
    )

    role = models.CharField(
    max_length=20,
    choices=ROLE_CHOICES,
    default="customer",
)
    phone = models.CharField(max_length=15, unique=True)


# Service Types (Electrician, Plumber etc)
class Service(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


# Worker Profile
class WorkerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    services = models.ManyToManyField(Service)
    city = models.CharField(max_length=100)
    experience_years = models.IntegerField(default=0)
    rating = models.FloatField(default=0)

    def __str__(self):
        return self.user.username


# Booking System
class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
    )

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_bookings')
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='worker_bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)