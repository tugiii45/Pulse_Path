"""
Visits serializers module.

Exports serializer classes for the visits app:
- VisitSerializer: Serializes patient visits with appointment validation.
- AppointmentSerializer: Serializes appointments with scheduling rules.
"""
from .visit import VisitSerializer
from .appointment import AppointmentSerializer
