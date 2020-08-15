const os = require('os');
const ifaces = os.networkInterfaces();

const addresses = [];
// https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
Object.keys(ifaces).forEach(function (ifname) {
  let alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    const serveURL = `http://${iface.address}`;
    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      addresses.push({ name: `${ifname}:{alias}`, url: serveURL });
    } else {
      // this interface has only one ipv4 adress
      addresses.push({ name: ifname, url: serveURL });
    }
    ++alias;
  });
});

contextBridge.exposeInMainWorld('server', {
  addresses,
});
