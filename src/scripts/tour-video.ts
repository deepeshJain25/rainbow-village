// On a phone the portrait video should fill the screen once it plays.
// iPhone: without `playsinline`, Safari plays the video in its own full-screen player.
// Android and others: ask for full screen as playback starts (still inside the tap that started it).
const phone = window.matchMedia('(max-width: 860px)');

for (const video of document.querySelectorAll<HTMLVideoElement>('[data-tour-video]')) {
  const setInline = () => { video.playsInline = !phone.matches; };
  setInline();
  phone.addEventListener('change', setInline);

  // the big crayon button starts the video; once it's playing, the video's own controls take over
  const button = video.parentElement?.querySelector<HTMLButtonElement>('[data-tour-play]');
  const fillScreen = () => {
    if (!phone.matches || document.fullscreenElement || !document.fullscreenEnabled) return;
    video.requestFullscreen().catch(() => {});
  };
  // full screen is asked for straight from the tap, before the video has loaded, so the browser allows it
  button?.addEventListener('click', () => {
    fillScreen();
    video.play().catch(() => {});
  });

  video.addEventListener('play', () => {
    if (button) button.hidden = true;
    fillScreen();
  });
}
