import json
from rest_framework.renderers import JSONRenderer

# This code defines a custom JSON renderer class called 
# StandardJSONRenderer
#  that extends Django REST Framework's 
# JSONRenderer
# . The 
# render
#  method of this class is responsible for serializing the response data into JSON format.

class StandardJSONRenderer(JSONRenderer):

    
# It defines the 
# StandardJSONRenderer
#  class that inherits from 
# JSONRenderer
# .
# The render method takes three arguments: data, accepted_media_type, and renderer_context.
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        status_code = getattr(response, 'status_code', 200)

#         It first checks if the renderer_context is provided, and if so, it retrieves the response object from it. Otherwise, it sets response to None.
# It retrieves the status_code from the response object or sets it to 200 if response is None.

# It checks the type of data and constructs a payload dictionary accordingly:
# If data is None, it sets payload to {'success': True, 'message': 'Request completed successfully.', 'data': None}.
# If data is a dictionary and it contains a key 'results', it sets payload to {'success': True, 'message': 'Request completed successfully.', 'data': data}.
# Otherwise, it sets payload to {'success': True, 'message': 'Request completed successfully.', 'data': data}.

# It checks the status_code and if it's greater than or equal to 400, it sets payload to {'success': False, 'message': 'Request failed.', 'errors': data}.
# Finally, it calls the 
# render
#  method of the parent 
# JSONRenderer class with the payload, accepted_media_type, and renderer_context arguments and returns the result.

        if data is None:
            payload = {'success': True, 'message': 'Request completed successfully.', 'data': None}
        elif isinstance(data, dict) and 'results' in data:
            payload = {'success': True, 'message': 'Request completed successfully.', 'data': data}
        else:
            payload = {'success': True, 'message': 'Request completed successfully.', 'data': data}

        if status_code >= 400:
            payload = {'success': False, 'message': 'Request failed.', 'errors': data}

        return super().render(payload, accepted_media_type, renderer_context)
