from groq import Groq
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings

# Single shared Groq client, built once at import time using the API key
# from settings (which should itself come from an env var, not be
# hardcoded). Reused across every request rather than recreated each time.
client = Groq(api_key=settings.GROQ_API_KEY)


@api_view(['POST'])  # Only accept POST — this endpoint takes a chat payload,
                      # it doesn't make sense as GET.
@permission_classes([IsAuthenticated])  # Must be logged in to use the
                                         # assistant; no anonymous access.
def chat_view(request):
    """
    Proxies a chat conversation to Groq's hosted LLM, prepending a fixed
    system prompt that scopes the assistant to PulsePath support/navigation
    help only (no medical advice, no direct record access).
    """

    # The frontend is expected to send the running conversation as a list
    # of {role, content} messages (e.g. prior user/assistant turns).
    # Defaults to an empty list if missing so this doesn't crash on a
    # malformed request.
    messages = request.data.get('messages', [])

    # This system message is prepended to every request and is what
    # actually constrains the model's behavior. Key rules baked in here:
    #   1. Scope: app navigation/support only, not clinical advice.
    #   2. Safety: never diagnose, never interpret symptoms/results —
    #      redirect to booking an appointment or, if urgent, emergency care.
    #   3. Honesty: never claim to access/change real patient data, since
    #      this endpoint has no actual access to the database.
    #   4. Formatting: plain conversational prose, no markdown, to match
    #      how the chat UI renders replies.
    system_message = {
     "role": "system",
     "content": (
        "You are the PulsePath Assistant, an in-app support assistant for "
        "PulsePath, a hospital management platform used by patients, "
        "doctors, and hospital administrators.\n\n"
        "Your role is strictly limited to helping users navigate and use "
        "the platform. This includes:\n"
        "- Explaining how to book, reschedule, or check appointments\n"
        "- Helping locate features like visits, prescriptions, medical "
        "records, and notifications\n"
        "- Answering general questions about how PulsePath works\n"
        "- Guiding users to the right section of the app for their role "
        "(patient, doctor, or admin)\n\n"
        "You are not a doctor and must never provide medical advice, "
        "diagnoses, treatment recommendations, medication guidance, or "
        "interpretation of symptoms or test results. If a user describes "
        "symptoms, asks for a diagnosis, or asks what a medication or "
        "result means, do not answer clinically — instead, tell them to "
        "book an appointment or message their doctor through the app, and "
        "if it sounds urgent, advise them to seek emergency care or "
        "contact local emergency services immediately.\n\n"
        "You cannot access, view, or modify any patient records, "
        "appointments, or account data yourself — you can only explain "
        "how the user can do so within the app. Never claim to have "
        "looked up or changed something on the user's behalf.\n\n"
        "Write like a calm, competent member of hospital support staff "
        "speaking to someone directly, not like a help-center article. "
        "Use plain sentences and short paragraphs. Avoid markdown "
        "headers, bold text, and nested bullet structures — a couple of "
        "short numbered steps are fine for actual instructions, but keep "
        "everything else in plain prose. Keep replies brief: a few "
        "sentences for most questions, more only when walking through an "
        "actual multi-step process. Never open with a heading or title."
        "Do not use markdown formatting of any kind in your responses — no "
        "asterisks, no bullet points using *, no bold text using **, no "
        "headers using #, no numbered lists unless explicitly asked for "
        "step-by-step instructions. Write in plain sentences only, exactly "
        "as you would type a normal text message to someone. If you need to "
        "list a few steps, write them as a short sentence like 'First do X, "
        "then do Y, then do Z' instead of a formatted list."  
    )
}

    try:
        # Prepend the system message to whatever conversation history the
        # frontend sent, then forward the whole thing to Groq's API.
        # "openai/gpt-oss-120b" is the specific hosted model being used.
        response = client.chat.completions.create(
           model="openai/gpt-oss-120b",
           messages=[system_message] + messages,
)
        # Only the assistant's reply text is sent back to the frontend —
        # the rest of Groq's response object (usage stats, ids, etc.)
        # is discarded.
        return Response({"reply": response.choices[0].message.content})
    except Exception as e:
        # Catch-all: if Groq's API errors (bad key, rate limit, network
        # issue, etc.), surface the error message with a 500 instead of
        # letting the view raise an unhandled exception.
        return Response({"error": str(e)}, status=500)