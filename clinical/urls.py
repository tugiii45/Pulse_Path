from django.urls import path
from .views import ClinicalRecordListCreateView, ClinicalRecordDetailView

urlpatterns = [
    path("", ClinicalRecordListCreateView.as_view(), name='clinical-list-create'),
    path("<int:pk>/", ClinicalRecordDetailView.as_view(), name='clinical-detail'),
]
