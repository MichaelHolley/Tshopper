# Alexa skill

A private Alexa skill, left in development mode, adds items and reads the list back by voice in
English or German. Each locale has its own invocation name: "kitchen helper" in English,
„küchenhelfer" in German. Saying only the invocation name opens the skill and Alexa asks how it
can help.

- Add items: "Alexa, ask kitchen helper to add milk for Aldi" or
  „Alexa, benutze den Küchenhelfer, um Milch hinzuzufügen".
- Read the list: "Alexa, ask kitchen helper what's on the list" or
  „Alexa, frag Küchenhelfer, was steht auf der Liste".
- Read a store's list: "Alexa, ask kitchen helper what's on the list for Lidl" or
  „Alexa, frag Küchenhelfer, was brauche ich bei Lidl".

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
- **Duplicates:** Alexa skips items already unchecked on the target store's list (or Unassigned
  when no store is selected), matching names case-insensitively after trimming whitespace.
  Checked items can be added again. Repeated names in one request are only processed once,
  keeping the first quantity without merging or summing quantities. UI and chat additions are
  unchanged.
- **Replies:** Alexa answers in the request's locale, from `REPLIES` in `+server.ts`, naming both
  the items added and those already on the list. If all are already there, nothing is added.

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
