from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from ..models import Appointment
from ..serializers import AppointmentSerializer
from accounts.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
from accounts.views.mixins import HospitalQuerySetMixin


class AppointmentListCreateView(HospitalQuerySetMixin, generics.ListCreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdminOrPatientOwner]

    filter_backends=[DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = ["patient", "doctor", "status", ]
    search_fields = ["patient__user__first_name", "patient__user__last_name", "doctor__user__first_name", "doctor__user__last_name",]
    ordering_fields = ["appointment_date", "created_at", ]
    ordering = ["-appointment_date"]


class AppointmentDetailView(HospitalQuerySetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
