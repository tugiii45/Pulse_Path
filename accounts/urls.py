from django.urls import path
from .views import RegisterView, ProfileView
from .views import PatientProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('patient_profile/', PatientProfileView.as_view(), name='patient_profile'),

]