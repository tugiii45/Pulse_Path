from django.test import TestCase
from rest_framework.test import APIClient, APIRequestFactory

from accounts.models import CustomUser, Patient
from accounts.permissions import IsDoctorOrAdminOrPatientOwner


class PermissionTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.admin = CustomUser.objects.create_user(
            email="admin@example.com",
            password="secret123",
            first_name="Ada",
            last_name="Admin",
            role=CustomUser.Role.ADMIN,
        )
        self.doctor = CustomUser.objects.create_user(
            email="doctor@example.com",
            password="secret123",
            first_name="Doc",
            last_name="One",
            role=CustomUser.Role.DOCTOR,
        )
        self.patient = CustomUser.objects.create_user(
            email="patient@example.com",
            password="secret123",
            first_name="Pat",
            last_name="One",
            role=CustomUser.Role.PATIENT,
        )
        self.other_patient = CustomUser.objects.create_user(
            email="other@example.com",
            password="secret123",
            first_name="Other",
            last_name="Patient",
            role=CustomUser.Role.PATIENT,
        )

        self.patient_profile = Patient.objects.create(
            user=self.patient,
            date_of_birth="2000-01-01",
            gender="FEMALE",
            emergency_contact="1234567890",
            address="123 Main St",
        )
        self.other_patient_profile = Patient.objects.create(
            user=self.other_patient,
            date_of_birth="1995-05-20",
            gender="MALE",
            emergency_contact="0987654321",
            address="456 Oak Ave",
        )

    def _request(self, user, method="GET"):
        request = getattr(self.factory, method.lower())("/")
        request.user = user
        return request

    def test_patient_can_read_own_records_but_not_create_them(self):
        permission = IsDoctorOrAdminOrPatientOwner()

        read_request = self._request(self.patient, "GET")
        create_request = self._request(self.patient, "POST")

        self.assertTrue(permission.has_permission(read_request, None))
        self.assertFalse(permission.has_permission(create_request, None))
        self.assertTrue(permission.has_object_permission(read_request, None, self.patient_profile))
        self.assertFalse(permission.has_object_permission(read_request, None, self.other_patient_profile))

    def test_doctor_and_admin_can_access_all_records(self):
        permission = IsDoctorOrAdminOrPatientOwner()

        doctor_request = self._request(self.doctor, "POST")
        admin_request = self._request(self.admin, "POST")

        self.assertTrue(permission.has_permission(doctor_request, None))
        self.assertTrue(permission.has_permission(admin_request, None))
        self.assertTrue(permission.has_object_permission(doctor_request, None, self.other_patient_profile))
        self.assertTrue(permission.has_object_permission(admin_request, None, self.patient_profile))

    def test_admin_and_doctor_can_login_with_email(self):
        client = APIClient()

        admin_login = client.post(
            "/api/login/",
            {"email": self.admin.email, "password": "secret123"},
            format="json",
        )
        doctor_login = client.post(
            "/api/login/",
            {"email": self.doctor.email, "password": "secret123"},
            format="json",
        )

        self.assertEqual(admin_login.status_code, 200, admin_login.content)
        self.assertIn("access", admin_login.data)
        self.assertEqual(doctor_login.status_code, 200, doctor_login.content)
        self.assertIn("access", doctor_login.data)
