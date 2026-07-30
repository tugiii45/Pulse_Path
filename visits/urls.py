"""
Visits URL configuration.

Defines API routes for patient visits and appointments.
"""

from django.urls import path
from .views import VisitListCreateView, VisitDetailView, AppointmentListCreateView, AppointmentDetailView

urlpatterns = [
    # Visit management
    path("", VisitListCreateView.as_view(), name="visit-list-create"),
    path("visits/<int:pk>/", VisitDetailView.as_view(), name="visit-detail"),
    # Appointment management
    path("appointments/", AppointmentListCreateView.as_view(), name="appointment-list"),
    path("appointments/<int:pk>/", AppointmentDetailView.as_view(), name="appointment-detail"),
]
