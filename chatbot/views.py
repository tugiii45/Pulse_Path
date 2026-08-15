from groq import Groq
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings

client = Groq(api_key=settings.GROQ_API_KEY)

@api_view(['POST'])
@permission_classes([AllowAny])  # switch to IsAuthenticated once auth is wired up
def chat_view(request):
    messages = request.data.get('messages', [])  # [{role, content}, ...]

    system_message = {
        "role": "system",
        "content": (
            "You are a helpful assistant for PulsePath, a healthcare management app. "
            "You can help with navigating the app, scheduling, and general questions. "
            "You are not a medical professional — for any medical/diagnostic questions, "
            "direct users to consult their doctor."
        )
    }

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[system_message] + messages,
        )
        return Response({"reply": response.choices[0].message.content})
    except Exception as e:
        return Response({"error": str(e)}, status=500)