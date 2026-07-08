from django.contrib import admin
from .models import User, Service, WorkerProfile, Booking, Review, Notification

admin.site.register(User)
admin.site.register(Service)
admin.site.register(WorkerProfile)
admin.site.register(Booking)
admin.site.register(Review)
admin.site.register(Notification)