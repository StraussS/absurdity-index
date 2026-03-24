# Operations

## Manual snapshot

Run a one-shot daily snapshot:

```bash
cd /home/porishi/.openclaw/workspace/projects/absurdity-index/web
npm run snapshot
```

This will:
- aggregate current enabled sources
- dedupe and score items
- persist today's snapshot into `data/history/YYYY-MM-DD.json`
- print a short JSON summary to stdout

## Suggested cron

If you want one snapshot every day at 09:00:

```bash
cd /home/porishi/.openclaw/workspace/projects/absurdity-index/web && npm run snapshot
```

Suggested schedule example:
- `0 9 * * *`

## Optional environment variables

- `WEIBO_COOKIE`
- `ABSURDITY_ENABLED_SOURCES`
- `ABSURDITY_DISABLED_SOURCES`
- `ABSURDITY_SOURCE_LIMITS`
- `ABSURDITY_SOURCE_CONFIG_URL`
