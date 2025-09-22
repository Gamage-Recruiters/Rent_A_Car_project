

/// use this before saving number plates to DB



// input is the vehicle numberPlate that user added when registering a new vehicle
// Should be string 
function normalizePlate(input) {
  return input
    .toUpperCase()              // convert all to capital letters
    .replace(/[^A-Z0-9]/g, ''); // Remove dashes, spaces, dots and output like 'UPAAA4251'
}



/// use this for get methods that shows correct vehicle numbers format from normalized Formate
function deNormalizePlate(input) {

  return input.replace(/(.{2})(.{3})(\d{4})/, '$1-$2 $3'); // Reformat: "UPAAA4251" → "UP-AAA 4251"
}