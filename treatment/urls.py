from django.urls import path
from .views import TreatmentListCreateView
from .views.prescription import PrescriptionListCreateView, PrescriptionDetailView
from .views.medication import MedicationListCreateView, MedicationDetailView

urlpatterns = [
    path("", TreatmentListCreateView.as_view(), name='treatment-list-create'),
    path("prescription/", PrescriptionListCreateView.as_view(), name='prescription-list-create'),
    path("prescription/<int:pk>/", PrescriptionDetailView.as_view(), name='prescription-detail'),
    path("medication/", MedicationListCreateView.as_view(), name='medication-list-create'),
    path("medication/<int:pk>/", MedicationDetailView.as_view(), name='medication-detail'),

]

