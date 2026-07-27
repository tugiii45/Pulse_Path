from django.urls import path
from .views import TreatmentListCreateView
from .views.prescription import PrescriptionListCreateView, PrescriptionDetailView
from .views.medication import MedicationListCreateView, MedicationDetailView
from .views.medication_schedule import MedicationScheduleListCreateView, MedicationScheduleDetailView
from .views.medication_log import MedicationLogListCreateView, MedicationLogDetailView

urlpatterns = [
    path("", TreatmentListCreateView.as_view(), name='treatment-list-create'),
    path("prescription/", PrescriptionListCreateView.as_view(), name='prescription-list-create'),
    path("prescription/<int:pk>/", PrescriptionDetailView.as_view(), name='prescription-detail'),
    path("medication/", MedicationListCreateView.as_view(), name='medication-list-create'),
    path("medication/<int:pk>/", MedicationDetailView.as_view(), name='medication-detail'),
    path("medication_schedule/", MedicationScheduleListCreateView.as_view(), name='medication_schedule-list-create'),
    path("medication_schedule/<int:pk>/", MedicationScheduleDetailView.as_view(), name='medication_schedule-detail'),
    path("medication_log/", MedicationLogListCreateView.as_view(), name='medication-log-list-create'),
    path("medication_log/<int:pk>/", MedicationLogDetailView.as_view(), name='medication-log-detail')
]

