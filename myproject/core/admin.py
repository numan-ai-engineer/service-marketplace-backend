from django.contrib import admin
from .models import User, Service, WorkerProfile, Booking, Review

admin.site.register(User)
admin.site.register(Service)
admin.site.register(WorkerProfile)
admin.site.register(Booking)
admin.site.register(Review)