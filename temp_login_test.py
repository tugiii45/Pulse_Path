import json, urllib.request, urllib.error
url = "http://127.0.0.1:8000/api/login/"
headers = {"Content-Type": "application/json"}
data = json.dumps({"email": "test@example.com", "password": "password"}).encode("utf-8")
req = urllib.request.Request(url, data, headers, method="POST")
try:
    res = urllib.request.urlopen(req, timeout=5)
    print("STATUS", res.status)
    print(res.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("STATUS", e.code)
    print(e.read().decode("utf-8"))
except Exception as e:
    print("ERROR", e)
