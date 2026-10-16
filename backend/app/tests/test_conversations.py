import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_list_conversations(client: AsyncClient, auth_headers: dict):
    # Create conversation
    create_res = await client.post(
        "/api/conversations",
        headers=auth_headers,
        json={"title": "Test Chat with Vicky", "model": "gemma3:4b"},
    )
    assert create_res.status_code == 201
    created_data = create_res.json()
    conv_id = created_data["id"]
    assert created_data["title"] == "Test Chat with Vicky"
    assert created_data["model"] == "gemma3:4b"

    # List conversations
    list_res = await client.get("/api/conversations", headers=auth_headers)
    assert list_res.status_code == 200
    conv_list = list_res.json()
    assert len(conv_list) == 1
    assert conv_list[0]["id"] == conv_id


@pytest.mark.asyncio
async def test_user_isolation(
    client: AsyncClient,
    auth_headers: dict,
    another_auth_headers: dict,
):
    # User 1 creates conversation
    create_res = await client.post(
        "/api/conversations",
        headers=auth_headers,
        json={"title": "User 1 Secret Chat", "model": "gemma3:4b"},
    )
    conv_id = create_res.json()["id"]

    # User 2 cannot retrieve User 1's conversation
    get_res = await client.get(f"/api/conversations/{conv_id}", headers=another_auth_headers)
    assert get_res.status_code == 404

    # User 2 cannot update User 1's conversation
    patch_res = await client.patch(
        f"/api/conversations/{conv_id}",
        headers=another_auth_headers,
        json={"title": "Hacked Title"},
    )
    assert patch_res.status_code == 404

    # User 2 cannot delete User 1's conversation
    del_res = await client.delete(f"/api/conversations/{conv_id}", headers=another_auth_headers)
    assert del_res.status_code == 404


@pytest.mark.asyncio
async def test_update_and_archive_conversation(client: AsyncClient, auth_headers: dict):
    # Create
    create_res = await client.post(
        "/api/conversations",
        headers=auth_headers,
        json={"title": "Original Title", "model": "gemma3:4b"},
    )
    conv_id = create_res.json()["id"]

    # Update title and archive
    patch_res = await client.patch(
        f"/api/conversations/{conv_id}",
        headers=auth_headers,
        json={"title": "Updated Title", "archived": True},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["title"] == "Updated Title"
    assert updated["archived"] is True

    # Check active list excludes archived by default
    list_active = await client.get("/api/conversations", headers=auth_headers)
    assert len(list_active.json()) == 0

    # Check including archived
    list_all = await client.get("/api/conversations?include_archived=true", headers=auth_headers)
    assert len(list_all.json()) == 1


@pytest.mark.asyncio
async def test_delete_conversation(client: AsyncClient, auth_headers: dict):
    create_res = await client.post(
        "/api/conversations",
        headers=auth_headers,
        json={"title": "Delete Me", "model": "gemma3:4b"},
    )
    conv_id = create_res.json()["id"]

    del_res = await client.delete(f"/api/conversations/{conv_id}", headers=auth_headers)
    assert del_res.status_code == 204

    get_res = await client.get(f"/api/conversations/{conv_id}", headers=auth_headers)
    assert get_res.status_code == 404
