const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let buffer;
let source;
let gainNode;
// timeout should be cancelled when audio paused
let crossfadeTimeout;
const crossfadeDuration = 4; // duration of the crossfade in seconds

let isPlaying = false;
const audioToggleButton = document.getElementById('audio-toggle-button');
let buttonTimeout;
const audioEl = document.getElementById('audio-element');

// Load the audio file
fetch('assets/audio1.m4a')
  .then(response => response.arrayBuffer())
  .then(data => audioContext.decodeAudioData(data))
  .then(decodedData => {
    buffer = decodedData;
    startMediaSession();
  });


function startMediaSession() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'breathe',
      // artist: 'Artist Name',
      artwork: [
        { src: 'assets/blue_sphere.png', sizes: '512x512', type: 'image/png' },
      ]
    });
    navigator.mediaSession.setActionHandler('play', playAudio);
    navigator.mediaSession.setActionHandler('pause', stopAudio);
    navigator.mediaSession.setActionHandler('stop', stopAudio);
  }
}

function updateMediaSessionPlaybackState() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }
}

function playAudio() {
  console.log('playig')
  source = audioContext.createBufferSource();
  source.buffer = buffer;
  gainNode = audioContext.createGain();
  source.connect(gainNode);
  const destination = audioContext.createMediaStreamDestination();
  gainNode.connect(destination);
  audioEl.srcObject = destination.stream;

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + crossfadeDuration);

  source.start(0);
  isPlaying = true;
  updateMediaSessionPlaybackState();
  audioEl.play();

  // Schedule crossfade before the end of the track
  const crossfadeStartTime = buffer.duration - crossfadeDuration;
  crossfadeTimeout = setTimeout(() => {
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + crossfadeDuration);
    playAudio();
  }, crossfadeStartTime * 1000);

  startMediaSession();
}

function stopAudio() {
  source.stop();
  clearTimeout(crossfadeTimeout);
  isPlaying = false;
  updateMediaSessionPlaybackState();
}

function toggleAudio() {
  if (isPlaying) {
    stopAudio();
  } else {
    playAudio();
  }
  // resetButtonTimeout();
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


