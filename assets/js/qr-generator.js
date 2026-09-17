/**
 * Real QR Code Generator for Maharashtra Food Trust Mission
 * Uses an external API to generate a fully functional, scannable QR Code.
 */
(function (global) {
  function generateQRCodeSVG(text, size) {
    size = size || 180;
    // Using a reliable public API to generate a real QR code image
    var encodedText = encodeURIComponent(text);
    var url = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodedText;
    
    // We return an HTML image tag containing the real QR code instead of the fake SVG.
    return '<img src="' + url + '" alt="QR Code" width="' + size + '" height="' + size + '" style="border-radius: 8px; border: 1px solid #d9ded9;" />';
  }

  global.generateQRCodeSVG = generateQRCodeSVG;
})(window);

