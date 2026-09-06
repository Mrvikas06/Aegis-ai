/**
 * Agora token service (FR-1, FR-2).
 *
 * Aegis joins the incident's voice channel as a real RTC participant, and
 * uses RTM for out-of-band signaling (state pushes to any Agora-native
 * client, separate from our Socket.io dashboard feed). Both need
 * short-lived tokens minted server-side from the App Certificate — never
 * expose the certificate to a client.
 *
 * Requires env: AGORA_APP_ID, AGORA_APP_CERTIFICATE. If unset, this
 * service runs in "stub mode" and returns null tokens with a warning,
 * so the rest of the app still boots for local dev/demo without Agora
 * credentials (same pattern as services/persistence.js for Mongo).
 */
import pkg from "agora-token";
const { RtcTokenBuilder, RtcRole, RtmTokenBuilder } = pkg;

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const TOKEN_TTL_SECONDS = 3600;

export function agoraConfigured() {
  return Boolean(APP_ID && APP_CERTIFICATE);
}

/** Token for Aegis (or a dashboard viewer) to join the incident's RTC channel. */
export function buildRtcToken(channelName, uid, role = RtcRole.PUBLISHER) {
  if (!agoraConfigured()) {
    console.warn("[agora] AGORA_APP_ID/AGORA_APP_CERTIFICATE not set — returning stub token.");
    return { appId: null, token: null, channel: channelName, uid };
  }
  const expireAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, expireAt);
  return { appId: APP_ID, token, channel: channelName, uid };
}

/** Token for RTM signaling (state broadcast to native Agora clients). */
export function buildRtmToken(userAccount) {
  if (!agoraConfigured()) {
    return { appId: null, token: null, userAccount };
  }
  const expireAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  // agora-token v2: buildToken(appId, appCertificate, userId, expire) — no role param
  const token = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, userAccount, expireAt);
  return { appId: APP_ID, token, userAccount };
}

export { RtcRole };

