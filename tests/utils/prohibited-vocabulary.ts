// Prohibited vocabulary check — ensures zero crypto vocabulary in user-visible copy.
const PROHIBITED_TERMS = [
  "wallet",
  "blockchain",
  "on-chain",
  "stellar",
  "soroban",
  "smart contract",
  "contract",
  "crypto",
  "xdr",
  "gas",
  "private key",
  "public key",
  "seed phrase",
  "ledger",
  "node",
];

export function assertNoProhibitedVocabulary(text: string): void {
  const lowerText = text.toLowerCase();
  const found = PROHIBITED_TERMS.filter((term) => lowerText.includes(term.toLowerCase()));

  if (found.length > 0) {
    throw new Error(
      `Prohibited vocabulary found: ${found.join(", ")}. ` +
        `Text: "${text.slice(0, 200)}..."`
    );
  }
}

export function getProhibitedTermsInText(text: string): string[] {
  const lowerText = text.toLowerCase();
  return PROHIBITED_TERMS.filter((term) => lowerText.includes(term.toLowerCase()));
}

export { PROHIBITED_TERMS };