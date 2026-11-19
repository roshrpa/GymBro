export const RELEASE_API = 'https://api.github.com/repos/roshrpa/GymBro/releases/tags/latest';

// The CI writes "build N" into the release notes.
export function parseBuild(text) {
  const m = /build\s+(\d+)/i.exec(text || '');
  return m ? parseInt(m[1], 10) : null;
}

export const isNewer = (remote, local) => Number.isInteger(remote) && remote > local;

export function pickApkUrl(release) {
  const assets = (release && release.assets) || [];
  const apk = assets.find((a) => /\.apk$/i.test(a.name));
  return apk ? apk.browser_download_url : (release && release.html_url) || null;
}

// resolves { available, build, url } or { error }
export async function checkForUpdate(currentBuild, fetchFn = fetch, timeoutMs = 10000) {
  try {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    const res = await fetchFn(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' }, signal: ctrl ? ctrl.signal : undefined });
    if (timer) clearTimeout(timer);
    if (!res.ok) return { error: 'Could not check for updates.' };
    const release = await res.json();
    const build = parseBuild(release.body) ?? parseBuild(release.name);
    return { available: isNewer(build, currentBuild), build, url: pickApkUrl(release) };
  } catch {
    return { error: 'Could not check for updates. Check your internet connection.' };
  }
}
