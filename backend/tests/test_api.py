import os
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite:///./test_clubofsports.db"
Path("test_clubofsports.db").unlink(missing_ok=True)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def login(token: str, name: str):
    response = client.post("/auth/login", json={"id_token": token, "name": name})
    assert response.status_code == 200
    return response.json()["access_token"], response.json()["user"]["id"]

def test_auth_and_posts_are_private_to_connections():
    token_a, user_a = login("test-a", "Athlete A")
    token_b, user_b = login("test-b", "Athlete B")
    token_c, _ = login("test-c", "Athlete C")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}
    headers_c = {"Authorization": f"Bearer {token_c}"}
    assert client.post("/posts", headers=headers_a, json={"caption": "A private club update"}).status_code == 201
    assert client.get("/posts/feed", headers=headers_b).json() == []
    request = client.post("/connections/request", headers=headers_a, json={"user_id": user_b})
    assert request.status_code == 200
    connection_id = request.json()["id"]
    assert client.post(f"/connections/{connection_id}/accept", headers=headers_b).status_code == 200
    assert len(client.get("/posts/feed", headers=headers_b).json()) == 1
    assert client.get("/posts/feed", headers=headers_c).json() == []

def test_history_includes_posts():
    token, _ = login("history-user", "History Athlete")
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/posts", headers=headers, json={"caption": "History item"})
    history = client.get("/history", headers=headers)
    assert history.status_code == 200
    assert history.json()["my_posts"][0]["caption"] == "History item"
