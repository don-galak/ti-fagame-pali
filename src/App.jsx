import { createSignal, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import Form from "./Form";
import Toast from "./Toast";
import {
  hasShareApi,
  isShortId,
  loadBill,
  saveBill,
  ShareNotFoundError,
} from "./shareApi";

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

function fromBase64(encoded) {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const isValidState = (state) =>
  Array.isArray(state?.eaters) && Array.isArray(state?.foodInfo);

// Long links (the bill encoded in the URL) are still supported, both for
// links shared before short links existed and as a fallback when the share
// API can't be reached.
function decodeHashState(hash) {
  if (!hash) return { state: null, error: null };
  try {
    const state = JSON.parse(fromBase64(hash));
    if (isValidState(state)) return { state, error: null };
    return { state: null, error: "Shared link data is incomplete or invalid." };
  } catch {
    return { state: null, error: "Could not read the shared link — it may be corrupted." };
  }
}

const App = () => {
  const hash = window.location.hash.slice(1);
  const shortId = isShortId(hash) ? hash : null;
  const { state: restored, error: hashError } = shortId
    ? { state: null, error: null }
    : decodeHashState(hash);

  const [toastMessage, setToastMessage] = createSignal(hashError);
  const [loading, setLoading] = createSignal(Boolean(shortId));
  const [sharing, setSharing] = createSignal(false);

  const [currentEater, setCurrentEater] = createSignal("");
  const [eaters, setEaters] = createSignal(restored?.eaters ?? []);
  const [foodInfo, setFoodInfo] = createStore(restored?.foodInfo ?? []);

  const onChangeEater = (e) => {
    e.preventDefault();
    setCurrentEater(e.target.value);
  };

  const handleSubmit = () => {
    const name = currentEater().trim();
    setCurrentEater("");
    if (!name || eaters().includes(name)) return;
    setEaters([...eaters(), name]);
  };

  const handleDeleteEater = (eater) => {
    setEaters(eaters().filter((e) => e !== eater));
    setFoodInfo(
      () => true,
      "people",
      (people) => people.filter((p) => p !== eater)
    );
  };

  const handleSubmitFood = (foodData) => {
    setFoodInfo([...foodInfo, foodData]);
  };

  const handleTogglePerson = (foodIndex, eater) => {
    setFoodInfo(foodIndex, "people", (people) =>
      people.includes(eater)
        ? people.filter((p) => p !== eater)
        : [...people, eater]
    );
  };

  const handleToggleEveryone = (foodIndex) => {
    const everyone = eaters();
    setFoodInfo(foodIndex, "people", (people) =>
      everyone.every((e) => people.includes(e)) ? [] : [...everyone]
    );
  };

  const handleDeleteFood = (foodIndex) => {
    setFoodInfo(foodInfo.filter((_, index) => index !== foodIndex));
  };

  const showToast = (msg) => {
    setToastMessage(null);
    queueMicrotask(() => setToastMessage(msg));
  };

  onMount(async () => {
    if (!shortId) return;
    try {
      const state = await loadBill(shortId);
      if (!isValidState(state)) throw new Error("Invalid bill");
      setEaters(state.eaters);
      setFoodInfo(state.foodInfo);
    } catch (error) {
      showToast(
        error instanceof ShareNotFoundError
          ? "This link has expired or doesn't exist."
          : "Couldn't load the shared bill. Check your connection and refresh."
      );
    } finally {
      setLoading(false);
    }
  });

  const handleShare = async () => {
    if (sharing()) return;
    setSharing(true);
    try {
      const state = { eaters: eaters(), foodInfo: [...foodInfo] };

      let id = null;
      if (hasShareApi()) {
        try {
          id = await saveBill(state);
        } catch {
          id = null; // fall back to a long link below
        }
      }
      window.location.hash = id ?? toBase64(JSON.stringify(state));

      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        showToast(
          id || !hasShareApi()
            ? "Link copied. Send it to the table!"
            : "Link copied (long version, the share server didn't respond)."
        );
      } catch {
        showToast("Copy the link from the address bar to share it.");
      }
    } catch {
      showToast("Something went wrong while creating the share link.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <Show when={toastMessage()}>
        <Toast
          message={toastMessage()}
          onDone={() => setToastMessage(null)}
        />
      </Show>
      <Show
        when={!loading()}
        fallback={
          <div class="container loading-bill" role="status">
            Loading the bill…
          </div>
        }
      >
      <Form
        currentEater={currentEater}
        eaters={eaters}
        onChangeEater={onChangeEater}
        handleSubmit={handleSubmit}
        handleSubmitFood={handleSubmitFood}
        handleDeleteEater={handleDeleteEater}
        handleDeleteFood={handleDeleteFood}
        handleTogglePerson={handleTogglePerson}
        handleToggleEveryone={handleToggleEveryone}
        handleShare={handleShare}
        foodInfo={foodInfo}
      />
      </Show>
    </>
  );
};

export default App;
