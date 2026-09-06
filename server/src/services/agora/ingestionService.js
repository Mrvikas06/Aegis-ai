/**
 * AgoraIngestionService — the bridge between the live voice room and
 * IncidentState.ingest() (FR-2, FR-3).
 *
 * Real-world flow this models:
 *   1. Aegis (or Agora's Conversational AI Engine, configured against the
 *      channel) joins the RTC channel as a participant using a token from
 *      tokenService.buildRtcToken().
 *   2. Each human joins the same channel from their own client with a
 *      per-uid token; the client (or a small join-time API call) tells us
 *      which participantId owns which numeric RTC uid — see registerUid().
 *   3. Agora's Conversational AI Engine streams live transcription back as
 *      the audio comes in. In production this arrives as a webhook per
 *      utterance (or an RTM message) carrying {channel, uid, text,
 *      confidence}. handleTranscript() is the single entry point for that.
 *   4. We resolve uid -> participantId and call IncidentState.ingest(),
 *      exactly the same call path the REST /utterances route uses — so
 *      the classifier, conflict detection, and timeline all just work.
 *
 * Diarization confidence (FR-3) rides along on the transcript payload;
 * low-confidence attributions are still ingested (never silently
 * dropped) but flagged so the UI can show an "uncertain speaker" hint.
 */
export class AgoraIngestionService {
  constructor(incidentManager) {
    this.incidentManager = incidentManager;
    // incidentId -> Map<uid, participantId>
    this.uidRosters = new Map();
  }

  /** Called when a human's client joins the RTC channel (FR-6: role capture at join). */
  registerUid(incidentId, uid, participantId) {
    if (!this.uidRosters.has(incidentId)) this.uidRosters.set(incidentId, new Map());
    this.uidRosters.get(incidentId).set(String(uid), participantId);
  }

  resolveSpeaker(incidentId, uid) {
    return this.uidRosters.get(incidentId)?.get(String(uid)) || null;
  }

  /**
   * Entry point for Agora Conversational AI Engine's transcript callback.
   * payload: { incidentId, uid, text, diarizationConfidence? }
   */
  handleTranscript(payload) {
    const { incidentId, uid, text, diarizationConfidence = 1.0 } = payload;
    const incident = this.incidentManager.get(incidentId);
    let speakerId = this.resolveSpeaker(incidentId, uid);

    if (!speakerId) {
      // Unregistered uid: don't drop the utterance (NFR-4 spirit — never go
      // silent), attribute to a placeholder speaker the room can correct.
      speakerId = `unmapped-${uid}`;
      if (!incident.state.participants.has(speakerId)) {
        incident.state.addParticipant(speakerId, `Unidentified speaker (${uid})`, "unknown", false);
      }
    }

    const item = incident.state.ingest(speakerId, text);
    item.diarizationConfidence = diarizationConfidence;
    return item;
  }
}
