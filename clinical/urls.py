from django.urls import path
from .views import ClinicalRecordListCreateView, ClinicalRecordDetailView
from .views.diagnosis import DiagnosisListCreateView, DiagnosisDetailView

urlpatterns = [
    path("", ClinicalRecordListCreateView.as_view(), name='clinical-list-create'),
    path("<int:pk>/", ClinicalRecordDetailView.as_view(), name='clinical-detail'),
    path("diagnosis/", DiagnosisListCreateView.as_view(), name='diagnosis-list-create'),
    path ("diagnosis/<int:pk>/", DiagnosisDetailView.as_view(), name='diagnosis-detail'),
]
