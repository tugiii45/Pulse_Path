from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import Appointment
from ..serializers import AppointmentSerializer
from accounts.permissions import *

class AppointmentListCreateView(generics.ListCreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]