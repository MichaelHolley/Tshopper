import { X509Certificate, verify } from 'node:crypto';
import { rootCertificates } from 'node:tls';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

const CERT_HOST = 's3.amazonaws.com';
const CERT_PATH_PREFIX = '/echo.api/';
const SIGNING_HOST = 'echo-api.amazon.com';
const MAX_REQUEST_AGE_MS = 150 * 1000;
const CERT_FETCH_TIMEOUT_MS = 2000;
const PEM_CERTIFICATE = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g;

const trustedRoots = rootCertificates.map((pem) => new X509Certificate(pem));
const chainCache = new Map<string, X509Certificate[]>();

const envelopeSchema = z.object({
	context: z.object({
		System: z.object({ application: z.object({ applicationId: z.string() }) })
	}),
	request: z.object({
		type: z.string(),
		timestamp: z.coerce.date(),
		locale: z.string().default('en-US'),
		intent: z
			.object({
				name: z.string(),
				slots: z
					.record(z.string(), z.object({ name: z.string(), value: z.string().optional() }))
					.optional()
			})
			.optional()
	})
});

export type AlexaRequest = z.infer<typeof envelopeSchema>['request'];

function isAmazonCertUrl(raw: string): boolean {
	if (!URL.canParse(raw)) return false;
	const url = new URL(raw);
	return (
		url.protocol === 'https:' &&
		url.hostname === CERT_HOST &&
		url.port === '' &&
		url.pathname.startsWith(CERT_PATH_PREFIX)
	);
}

async function fetchChain(url: string): Promise<X509Certificate[]> {
	const cached = chainCache.get(url);
	if (cached) return cached;

	const response = await fetch(url, { signal: AbortSignal.timeout(CERT_FETCH_TIMEOUT_MS) });
	if (!response.ok) throw new Error(`Certificate download failed with ${response.status}`);
	const chain = ((await response.text()).match(PEM_CERTIFICATE) ?? []).map(
		(pem) => new X509Certificate(pem)
	);
	if (chain.length === 0) throw new Error('Certificate chain is empty');
	chainCache.set(url, chain);
	return chain;
}

const isIssuedBy = (cert: X509Certificate, issuer: X509Certificate) =>
	issuer.ca && cert.checkIssued(issuer) && cert.verify(issuer.publicKey);

/** Amazon's chain ends in a cross-signed root Node no longer trusts, so it is trusted from the first certificate a trusted root issued. */
function isTrustedChain(chain: X509Certificate[], now: Date): boolean {
	if (chain[0].checkHost(SIGNING_HOST, { subject: 'never' }) === undefined) return false;

	for (const [i, cert] of chain.entries()) {
		if (cert.validFromDate > now || now > cert.validToDate) return false;
		if (trustedRoots.some((root) => isIssuedBy(cert, root))) return true;
		const issuer = chain[i + 1];
		if (!issuer || !isIssuedBy(cert, issuer)) return false;
	}
	return false;
}

/**
 * Applies the checks Amazon requires of a self-hosted skill endpoint: the body is signed by
 * Amazon's certificate, the request is recent, and it was sent for this skill.
 * See https://developer.amazon.com/en-US/docs/alexa/custom-skills/host-a-custom-skill-as-a-web-service.html
 */
export async function readAlexaRequest(request: Request, skillId: string): Promise<AlexaRequest> {
	const certUrl = request.headers.get('SignatureCertChainUrl');
	const signature = request.headers.get('Signature-256');
	if (!certUrl || !signature) throw new Error('Missing signature headers');
	if (!isAmazonCertUrl(certUrl)) throw new Error(`Untrusted certificate URL ${certUrl}`);

	const body = await request.text();
	const chain = await fetchChain(certUrl);
	if (!isTrustedChain(chain, new Date())) {
		chainCache.delete(certUrl);
		throw new Error('Certificate chain is not trusted');
	}
	if (!verify('sha256', Buffer.from(body), chain[0].publicKey, Buffer.from(signature, 'base64'))) {
		throw new Error('Signature does not match the body');
	}

	const envelope = envelopeSchema.parse(JSON.parse(body));
	if (envelope.context.System.application.applicationId !== skillId) {
		throw new Error('Request is for a different skill');
	}
	if (Math.abs(Date.now() - envelope.request.timestamp.getTime()) > MAX_REQUEST_AGE_MS) {
		throw new Error('Request timestamp is too old');
	}
	return envelope.request;
}

const plainText = (text: string) => ({ type: 'PlainText', text });

export function say(text: string): Response {
	return json({
		version: '1.0',
		response: { outputSpeech: plainText(text), shouldEndSession: true }
	});
}

export function ask(text: string): Response {
	return json({
		version: '1.0',
		response: {
			outputSpeech: plainText(text),
			reprompt: { outputSpeech: plainText(text) },
			shouldEndSession: false
		}
	});
}

export function end(): Response {
	return json({ version: '1.0', response: {} });
}
