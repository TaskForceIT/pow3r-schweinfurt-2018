module.exports = function(client) {
  let userAgent = client.handshake.headers["user-agent"];
  if (userAgent.match(/windows/gi)) {
    return "Windows";
  } else if (userAgent.match(/android/gi)) {
    return "Android";
  } else if (userAgent.match(/mac os/gi)) {
    return "iOS";
  } else {
    return "Unbekannt";
  }
};
