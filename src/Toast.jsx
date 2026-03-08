import { onMount, onCleanup, createSignal } from "solid-js";

const Toast = ({ message, duration = 4000, onDone }) => {
  const [visible, setVisible] = createSignal(false);

  let timer;

  onMount(() => {
    requestAnimationFrame(() => setVisible(true));
    timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 300);
    }, duration);
  });

  onCleanup(() => clearTimeout(timer));

  return (
    <div class={`toast ${visible() ? "toast-visible" : ""}`} role="alert">
      <svg
        class="toast-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        width="18"
        height="18"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span class="toast-message">{message}</span>
    </div>
  );
};

export default Toast;
