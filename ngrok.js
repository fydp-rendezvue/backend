const ngrok = require('ngrok');
(async function() {
  const url = await ngrok.connect(8000);
  console.log(url);
})();