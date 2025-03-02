```bash
curl -X POST http://localhost:3000/api/add-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "redirect_url": "https://example.com/redirect",
    "user_id": "user123"
  }'
```
