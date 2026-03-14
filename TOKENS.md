# MCP Token Setup

Each MCP server requires an OAuth token. Add these to `server/.env`.

---

## HubSpot

1. Go to [HubSpot Developer](https://developers.hubspot.com/)
2. Create a private app under **Settings → Integrations → Private Apps**
3. Grant scopes: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write`, `crm.objects.companies.read`
4. Copy the access token

```
HUBSPOT_MCP_TOKEN=pat-na1-xxxxxxxx
```

## Gmail

1. Visit [Claude MCP Connections](https://claude.ai/settings/mcp) in your Anthropic account
2. Connect your Google account for Gmail access
3. Copy the generated MCP token

```
GMAIL_MCP_TOKEN=your_gmail_mcp_token
```

## Google Calendar

1. Visit [Claude MCP Connections](https://claude.ai/settings/mcp) in your Anthropic account
2. Connect your Google account for Calendar access
3. Copy the generated MCP token

```
GCAL_MCP_TOKEN=your_gcal_mcp_token
```

## Notion

1. Visit [Claude MCP Connections](https://claude.ai/settings/mcp) in your Anthropic account
2. Connect your Notion workspace
3. Copy the generated MCP token

```
NOTION_MCP_TOKEN=your_notion_mcp_token
```

## Figma

1. Visit [Claude MCP Connections](https://claude.ai/settings/mcp) in your Anthropic account
2. Connect your Figma account
3. Copy the generated MCP token

```
FIGMA_MCP_TOKEN=your_figma_mcp_token
```

---

## Testing

Start the server and check the startup banner:

```bash
cd server && npx tsx src/index.ts
```

Each service will show connected or not connected. Test an agent with:

```bash
curl -X POST http://localhost:3001/api/test/agent \
  -H "Content-Type: application/json" \
  -d '{"agentId": "kim", "task": "List my recent HubSpot contacts"}'
```
