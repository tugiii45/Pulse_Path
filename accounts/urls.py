from django.urls import path
from .views import RegisterView, ProfileView
from .views.patient import PatientProfileView, PatientListCreateView
from .views.department import DepartmentListCreateView, DepartmentDetailView
from .views.doctor import DoctorListCreateView, DoctorDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('patient_profile/', PatientProfileView.as_view(), name='patient_profile'),
    path('patients/', PatientListCreateView.as_view(), name='patients'),
    path('departments/', DepartmentListCreateView.as_view(), name='department-list-create'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='department-detail'),
    path('doctors/', DoctorListCreateView.as_view(), name='doctor-list-create'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
   

]