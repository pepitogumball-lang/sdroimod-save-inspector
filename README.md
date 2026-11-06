# SDroiMod Save Editor (experimental)

Static, browser-only editor for SDroiMod ZIP exports. Files are processed in the browser and are not uploaded by the page. The repository is public; do not commit saves you consider private.

## Supported edits

- Reads ZIP exports with 1–3 recognized `slotN.player` entries.
- Checks ZIP structure, CRC-32, the `SDMOD_ENC_V1:` envelope, AES-128-ECB/PKCS5Padding, and strict UTF-8.
- Allows changing only `character.gold`, `character.coins`, and `character.level`, and only when each occurs once as a simple decimal assignment in the unique `character` block.
- Patches only the numeric source spans; unknown text and fields remain unchanged.
- Downloads a new `.sdroimod`, then reopens the generated ZIP, checks each entry's CRC, decrypts it, and compares the resulting text before enabling a successful download.

The format and key were recovered from the inspected game APK and checked against a shared sample. This is not an official tool. CRC is not authentication. ECB is unauthenticated. No runtime import test has confirmed game compatibility. Preserve your original and test only with a disposable save.

## Privacy

No analytics, network APIs, or external runtime scripts are used. The GitHub Pages artifact is assembled from an explicit allowlist and does not contain repository test fixtures. GitHub serves the page, so visitors connect to GitHub to download it. The repository itself is public: a file committed here is publicly accessible, even when it is encrypted.

## Local development

```sh
npm install
npx playwright install chromium
npm test
```

Tests use a synthetic disposable fixture and block unexpected external browser requests. Deployment runs only after tests pass.

## Included browser libraries

CryptoJS 4.2.0 (MIT) and fflate 0.8.2 (MIT) are embedded in `index.html` for offline use. They are pinned in `package.json` for the synthetic test harness.
