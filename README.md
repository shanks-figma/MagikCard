```bash
curl -X POST http://localhost:3000/api/add-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "redirect_url": "https://example.com/redirect",
    "user_id": "user123"
  }'
```

TODO:

- secure the images using cloudinary api secret
  Private images are not publicly accessible via a direct URL. You need to generate a signed URL using your API Secret on the server-side to provide temporary, secure access.
  Authenticated images can be accessed by users who have been granted specific permissions, often managed through Cloudinary's access control features.
