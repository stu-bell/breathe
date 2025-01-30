function supportsKeyframeAnimations() {
  const prefixes = ["", "webkit", "moz", "o", "ms"];
  const element = document.createElement("div");
  for (const prefix of prefixes) {
    const prop = prefix ? prefix + "Animation" : "animation";
    if (element.style[prop] !== undefined) {
      return true;
    }
  }
  return false;
}
document.addEventListener("DOMContentLoaded", () => {
  if (supportsKeyframeAnimations()) {
    document.getElementById("unsupported_message").remove();
  }
});

// TODO: function to take number of seconds of each stage of box breathing, calc %s, and update the animation duration with the total
// update keyframe offsets for breathing animation to configure box breathing
function updateKeyframes(inhale, hold1, exhale) {
  const ss = Array.from(document.styleSheets).find(
    (sheet) => sheet.ownerNode.id === "breathe_4353"
  );
  ss.deleteRule(
    Array.from(ss.cssRules).findIndex((x) =>
      x.cssText.startsWith("@keyframes breathe")
    )
  );
  ss.insertRule(` @keyframes breathe {
      0%, 100% {
        /* Inhale */
        transform: scale(1);
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      ${inhale}% {
        /* Hold */
        transform: scale(2);
        animation-timing-function: linear;
      }
      ${hold1}% {
        /* Exhale */
        transform: scale(2);
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      ${exhale}% {
        /* Hold */
        transform: scale(1);
        animation-timing-function: linear;
      }
        }`);
}

// document.addEventListener('DOMContentLoaded', updateKeyframes(30, 40, 90))
