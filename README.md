# trip-sync-api

REST API for **TripSync** — senior backend portfolio project.

- **Schema-first** validation via [`@trip-sync/contracts`](../trip-sync-contracts)
- **Fastify** + `fastify-type-provider-zod`
- **Prisma** + SQLite (local demo) / PostgreSQL-ready
- **OpenAPI UI** at `/docs` (spec from contracts)
- Idempotent `POST /bookings` and provider webhooks

## Quick start

```bash
cp .env.example .env
npm install
npm run db:generate && npm run db:push && npm run db:seed
npm run dev
```

- API: http://localhost:3333  
- Docs: http://localhost:3333/docs  

## Related repos

| Repo | Description |
|------|-------------|
| [trip-sync-contracts](https://github.com/kaiqueRoc/trip-sync-contracts) | Zod schemas + OpenAPI |
| [trip-sync-ops](https://github.com/kaiqueRoc/trip-sync-ops) | Ops dashboard (React) |
| [trip-sync-platform](https://github.com/kaiqueRoc/trip-sync-platform) | Full stack (Next.js) |

## Example

```bash
curl -s http://localhost:3333/health | jq
curl -s http://localhost:3333/bookings | jq
```

## License

MIT © Kaique Rocha
