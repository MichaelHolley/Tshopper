# Alexa skill

A private Alexa skill, left in development mode, adds items and reads the list back by voice in
English or German:

- Add items: "Alexa, tell tee shopper to add milk for Aldi" or
  „Alexa, sag tee shopper, füge Milch hinzu".
- Read the list: "Alexa, ask tee shopper what's on the list" or
  „Alexa, frag tee shopper, was steht auf der Liste".
- Read a store's list: "Alexa, ask tee shopper what's on the list for Lidl" or
  „Alexa, frag tee shopper, was brauche ich bei Lidl".

- **Endpoint:** Alexa calls `POST /api/alexa`
  ([`+server.ts`](../../src/routes/api/alexa/+server.ts)). It answers `404` until `ALEXA_SKILL_ID`
  is set.
- **Security:** each request is checked the way Amazon requires for self-hosted skills: Amazon
  signature, timestamp and skill ID ([`alexa.ts`](../../src/lib/server/alexa.ts)).
- **Adding items:** `OPENROUTER_MODEL` splits the phrase into items, quantities and an optional store.
  Without a store, items go to the default store. If parsing fails, the whole phrase becomes one
  item.
- **Reading the list:** no AI call is made. Store names are matched case-insensitively; an omitted
  or unknown store falls back to the default store (or Unassigned if no default is set). Alexa reads
  only unchecked items, with quantities, in list order. It reads at most 10 items, followed by
  "and N more" if needed, and gives a separate reply when the list is empty.
- **Replies:** Alexa answers in the request's locale, from `REPLIES` in `+server.ts`.

## Skill configuration

- In the [developer console](https://developer.amazon.com/alexa/console/ask), create a custom skill
  with self-provisioned hosting. Use the same Amazon account as your Echo devices.
- Paste [`interaction-model.en-US.json`](interaction-model.en-US.json) into each English locale and
  [`interaction-model.de-DE.json`](interaction-model.de-DE.json) into German (DE). Save and build
  the models. For an existing skill, reimport and rebuild both models to enable `ReadListIntent`.
- Set the HTTPS endpoint to `https://<your-domain>/api/alexa`, with the trusted-CA certificate
  option.
- Set the skill's ID as `ALEXA_SKILL_ID` on the container.

If Alexa reports a problem with the skill, the container logs show why a request was rejected
(`Rejected Alexa request: …`).
