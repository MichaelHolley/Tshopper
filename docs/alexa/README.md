# Alexa skill

Add items to Tshopper by voice through a private Alexa skill that runs on your own Echo devices.
It stays in development mode, so it is never published and needs no certification.

> "Alexa, tell tee shopper to add milk and two packs of butter."
>
> "Added Milk and 2 packs Butter to Aldi."

You can also say "Alexa, open tee shopper" and then "add eggs", or name a store: "Alexa, tell tee
shopper to add coffee for Lidl".

The skill speaks English and German. An Echo set to German understands German phrases and replies in
German:

> „Alexa, sag tee shopper, füge Milch und zwei Packungen Butter hinzu."
>
> „Milch und 2 Packungen Butter zu Aldi hinzugefügt."

## How it works

```
Echo ──▶ Alexa cloud ──HTTPS──▶ POST /api/alexa ──▶ addItems() ──▶ live item list
```

- Alexa sends the spoken phrase to `POST /api/alexa` on your server. AWS Lambda and Alexa-hosted
  skills aren't involved.
- The endpoint has no login. Instead, every request is checked the way Amazon requires for
  self-hosted skills:
  - the body is signed by Amazon's `echo-api.amazon.com` certificate;
  - the request is less than 150 seconds old;
  - it was sent for the skill in `ALEXA_SKILL_ID`.
- The phrase goes to `OPENROUTER_MODEL`, which splits it into items with quantities and picks up a
  store name if you said one. Otherwise the items go to the default store, or to Unassigned if no
  default is set. Item names stay in the language you spoke them in.
- Alexa answers in the language of the Echo that sent the request.
- If the model fails or takes longer than 5 seconds, the whole phrase is added as one item, so
  nothing you said gets lost.
- Items are added through the same service layer as the app, so they appear on every open device
  right away.

The code is in [`src/routes/api/alexa/+server.ts`](../src/routes/api/alexa/+server.ts) and
[`src/lib/server/alexa.ts`](../src/lib/server/alexa.ts).

## Cost

Building and running a private skill is free. Each voice command costs one OpenRouter call, a
fraction of a cent on a small model.

## Setup

### 1. Make `/api/alexa` reachable over HTTPS

Alexa only calls a public HTTPS URL with a certificate from a trusted CA. A Let's Encrypt
certificate on your reverse proxy works. Self-signed certificates would need an extra upload step,
which this guide doesn't cover.

Check that `https://<your-domain>/api/alexa` reaches the app. Before step 4 it answers `404`.

### 2. Create the skill

1. Sign in to the [Alexa developer console](https://developer.amazon.com/alexa/console/ask) with
   the same Amazon account your Echo devices use.
2. **Create Skill**: pick any name, **English (US)** or **German (DE)** as the primary locale,
   the **Other** experience, the **Custom** model, and **Provision your own** hosting. Then start
   from scratch.
3. Add the other languages your Echo devices use in the language dropdown at the top of the build
   page (**Language settings**). See [Languages](#languages) for which file goes with which locale.
4. For each language, switch to it, open **Interaction Model → JSON Editor**, paste its file, then
   **Save** and **Build skill**.

### 3. Point the skill at your server

1. Open **Endpoint**, choose **HTTPS**, and enter `https://<your-domain>/api/alexa` as the default
   region. The endpoint is shared by all languages.
2. For the SSL certificate type, pick **My development endpoint has a certificate from a trusted
   certificate authority**, then save.
3. Copy the **Skill ID** shown on that page (`amzn1.ask.skill.…`).

### 4. Turn the endpoint on

Set the skill ID on the Tshopper container and restart it:

```yaml
environment:
  - ALEXA_SKILL_ID=amzn1.ask.skill.your-skill-id
```

### 5. Enable testing

On the **Test** tab, switch skill testing to **Development**. Pick a language and type "ask tee
shopper to add milk" (or "sag tee shopper, füge Milch hinzu") in the simulator. Milk should show up
in the app, and your Echo devices accept the same phrase.

## Customizing

- **Invocation name**: change `invocationName` in the JSON. Each language has its own, so they can
  differ. It must be lowercase, and Amazon rejects some single-word or brand-like names. Rebuild the
  model afterwards.
- **Phrases**: add entries to the `AddItemIntent` samples. Every sample needs words around
  `{item}`, because Amazon doesn't allow a sample made of only an `AMAZON.SearchQuery` slot.

## Languages

| Locale in the console        | Interaction model                                              |
| ---------------------------- | -------------------------------------------------------------- |
| English (US, UK, CA, AU, IN) | [`interaction-model.en-US.json`](interaction-model.en-US.json) |
| German (DE)                  | [`interaction-model.de-DE.json`](interaction-model.de-DE.json) |

All English locales share one file, so add as many as your devices use.

Alexa's replies are in `REPLIES` in `src/routes/api/alexa/+server.ts`, keyed by language. A request
in a language that isn't there gets English replies. To add one, such as French:

1. Add a `fr` entry to `REPLIES`.
2. Add a translated interaction model and paste it into the new locale in the console.
3. Mention the language in the prompt of `parseSpokenItems` in `src/lib/server/ai.ts`.

## Troubleshooting

- **"There was a problem with the requested skill's response"**: check the container logs. The
  endpoint logs why it rejected a request (`Rejected Alexa request: …`), e.g. a skill ID mismatch
  or a clock that is far off.
- **Items come out lowercase or as one long item**: parsing failed or timed out, and the logs show
  `Adding the spoken phrase as is`. Check `OPENROUTER_API_KEY`, or switch to a faster model.
- **The skill fails and the logs show nothing**: `ALEXA_SKILL_ID` is probably not set on the
  running container, so the endpoint answers `404`.
