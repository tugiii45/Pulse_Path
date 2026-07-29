from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {
                'success': False,
                'message': 'An unexpected error occurred.',
                'errors': {'detail': str(exc)},
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    detail = response.data
    if isinstance(detail, dict) and 'detail' in detail:
        errors = {'detail': detail['detail']}
    elif isinstance(detail, dict):
        errors = detail
    else:
        errors = {'detail': str(detail)}

    return Response(
        {
            'success': False,
            'message': 'Request failed.',
            'errors': errors,
        },
        status=response.status_code,
    )
