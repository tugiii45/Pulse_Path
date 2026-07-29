import json
from rest_framework.renderers import JSONRenderer


class StandardJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        status_code = getattr(response, 'status_code', 200)

        if data is None:
            payload = {'success': True, 'message': 'Request completed successfully.', 'data': None}
        elif isinstance(data, dict) and 'results' in data:
            payload = {'success': True, 'message': 'Request completed successfully.', 'data': data}
        else:
            payload = {'success': True, 'message': 'Request completed successfully.', 'data': data}

        if status_code >= 400:
            payload = {'success': False, 'message': 'Request failed.', 'errors': data}

        return super().render(payload, accepted_media_type, renderer_context)
