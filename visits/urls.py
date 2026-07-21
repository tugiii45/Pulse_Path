from django.urls import path
from .views.visit import VisitListCreateView


urlpatterns = [
    path("", VisitListCreateView.as_view(), name="visit-list-create"),
]