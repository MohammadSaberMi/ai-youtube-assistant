(async () => {
  // 1. Grab the player JSON from ytInitialPlayerResponse
  const scripts = Array.from(document.scripts);
  let playerJson = null;
  for (let s of scripts) {
    const txt = s.textContent;
    if (txt && txt.includes('ytInitialPlayerResponse')) {
      const match = txt.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
      if (match) {
        playerJson = JSON.parse(match[1]);
        break;
      }
    }
  }
  if (!playerJson) {
    console.warn('No ytInitialPlayerResponse found.');
    return;
  }

  // 2. Find caption tracks
  const tracks = playerJson.captions
    ?.playerCaptionsTracklistRenderer
    ?.captionTracks || [];
  if (!tracks.length) {
    console.log('No captions available for this video.');
    return;
  }

  // 3. Pick a track (e.g. langCode="en" or fallback to first)
  const track = tracks.find(t => t.languageCode === 'fa') || tracks[0];
  console.log(`Using captions: ${track.name.simpleText} [${track.languageCode}]`);

  // 4. Fetch captions XML
  let res;
  try {
    res = await fetch(track.baseUrl);
    if (!res.ok) throw new Error(res.status);
  } catch (e) {
    console.warn('Failed to fetch captions:', e);
    return;
  }
  const xml = await res.text();

  // 5. Parse and log
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const lines = Array.from(doc.querySelectorAll('text'))
    .map(n => n.textContent.trim())
    .filter(Boolean);
  console.log(`📝 Transcript (${track.languageCode}):\n`, lines.join(' '));
})();
