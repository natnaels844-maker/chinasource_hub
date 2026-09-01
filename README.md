# ChinaSource Hub

Global China product sourcing catalog and supplier-access platform.

## Current prototype
- Global product catalog
- Search and category filtering
- Supplier identity protection on public product pages
- Supplier-access unlock flow
- Admin product catalog view
- Request-a-quote form
- Sourcing services and workflow pages
- Responsive mobile design

## Security architecture
Private supplier fields must remain server-side in production. The frontend must never receive supplier address, supplier name, or original listing URL before payment authorization. The current unlock is a demo state only.

## Run
```bash
npm install
npm run dev
```

## Production next steps
1. Connect a real database (Supabase/Firebase/Postgres).
2. Add server-side authentication and authorization.
3. Store private supplier fields only in protected tables.
4. Integrate a payment provider available to your business and target customers.
5. Verify payment server-side before releasing supplier information.
6. Add secure file/image storage.
7. Connect Gemini through a server-side API layer and environment variable.
8. Deploy to Vercel or another production host.
