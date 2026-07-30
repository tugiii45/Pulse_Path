"""
Visits views module.

Exports API view classes for the visits app:
- VisitListCreateView: List and create patient visits.
- VisitDetailView: Retrieve, update, and delete a specific visit.
- AppointmentListCreateView: List and create appointments.
- AppointmentDetailView: Retrieve, update, and delete an appointment.
"""
from .appointment import AppointmentListCreateView, AppointmentDetailView
from .visit import VisitListCreateView, VisitDetailView
