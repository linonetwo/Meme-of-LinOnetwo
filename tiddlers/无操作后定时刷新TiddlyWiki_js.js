const RELOAD_INTERVAL = 1000 * 60 * 60;
const CHECK_ACTIVITY_INTERVAL = 1000 * 3;

let time = new Date().getTime();

const refreshTime = () => {
  time = new Date().getTime();
};
document.addEventListener('keyup', refreshTime);
document.addEventListener('mousemove', refreshTime);
document.addEventListener('mouseup', refreshTime);

function refresh() {
    const serverNotStarted = !document || document.querySelector('.tc-site-title') === null;
    const notActivatedForLong = new Date().getTime() - time >= RELOAD_INTERVAL;
  if (serverNotStarted || notActivatedForLong) {
    window.location.reload(true);
  } else {
    setTimeout(refresh, CHECK_ACTIVITY_INTERVAL);
  }
}

setTimeout(refresh, CHECK_ACTIVITY_INTERVAL);