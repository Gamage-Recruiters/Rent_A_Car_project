

///  Normalize phone number
// - Removes all non-digit characters
// - Keeps only numbers in clean format like "0701234567"
function normalizePhoneNumber(input) {
  return input.replace(/\D/g, '');  // remove everything except digits
}

/// De-normalize phone number
// - Converts "0701234567" → "070-123-4567" for display
function deNormalizePhoneNumber(input) {
  return input.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}

module.exports = { normalizePhoneNumber, deNormalizePhoneNumber };
