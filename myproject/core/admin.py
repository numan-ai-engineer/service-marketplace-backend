from django.contrib import admin
from .models import User, Service, WorkerProfile, Booking

admin.site.register(User)
admin.site.register(Service)
admin.site.register(WorkerProfile)
admin.site.register(Booking)