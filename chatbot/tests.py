from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser


class ChatbotTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = CustomUser.objects.create_user(
			email="chat@example.com",
			password="SecurePassword123!",
			first_name="Chat",
			last_name="User",
			role=CustomUser.Role.PATIENT,
		)

	def test_chat_requires_authentication(self):
		response = self.client.post(
			"/api/chat/",
			{"messages": [{"role": "user", "content": "Hello"}]},
			format="json",
		)

		self.assertEqual(response.status_code, 401)

	@patch("chatbot.views.client")
	def test_authenticated_chat_returns_assistant_reply(self, client):
		client.chat.completions.create.return_value.choices = [
			type("Choice", (), {
				"message": type("Message", (), {"content": "Hello from PulsePath."})()
			})()
		]
		self.client.force_authenticate(user=self.user)

		response = self.client.post(
			"/api/chat/",
			{"messages": [{"role": "user", "content": "Hello"}]},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["reply"], "Hello from PulsePath.")
		client.chat.completions.create.assert_called_once()
