const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let buffer;
let source;
let gainNode;
// timeout should be cancelled when audio paused
let crossfadeTimeout;
const crossfadeDuration = 2; // duration of the crossfade in seconds

let isPlaying = false;
const audioToggleButton = document.getElementById('audio-toggle-button');
let buttonTimeout;

// Load the audio file
fetch('/assets/audio1.m4a')
  .then(response => response.arrayBuffer())
  .then(data => audioContext.decodeAudioData(data))
  .then(decodedData => {
    buffer = decodedData;
  });

function playAudio() {
  source = audioContext.createBufferSource();
  source.buffer = buffer;
  gainNode = audioContext.createGain();
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + crossfadeDuration);

  source.start(0);

  // Schedule crossfade before the end of the track
  const crossfadeStartTime = buffer.duration - crossfadeDuration;
  crossfadeTimeout = setTimeout(() => {
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + crossfadeDuration);
    playAudio();
  }, crossfadeStartTime * 1000);
}

function toggleAudio() {
  if (isPlaying) {
    source.stop();
    clearTimeout(crossfadeTimeout);
    isPlaying = false;
  } else {
    playAudio();
    isPlaying = true;
  }
  resetButtonTimeout();
}

// function resetButtonTimeout() {
//   clearTimeout(buttonTimeout);
//   audioToggleButton.style.opacity = 1;
//   buttonTimeout = setTimeout(() => {
//     audioToggleButton.style.opacity = 0;
//   }, 4000);
// }

audioToggleButton.addEventListener('click', toggleAudio);

// cancel timeout for next crossfade
document.body.addEventListener('pause', () => {
  clearTimeout(crossfadeTimeout);
  isPlaying = false;
});
