import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import Form from "./Form";
import Toast from "./Toast";

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

function decodeHashState() {
  const hash = window.location.hash.slice(1);
  if (!hash) return { state: null, error: null };
  try {
    const json = fromBase64(hash);
    const state = JSON.parse(json);
    if (Array.isArray(state.eaters) && Array.isArray(state.foodInfo)) {
      return { state, error: null };
    }
    return { state: null, error: "Shared link data is incomplete or invalid." };
  } catch {
    return { state: null, error: "Could not read the shared link — it may be corrupted." };
  }
}

const App = () => {
  const { state: restored, error: hashError } = decodeHashState();
  const [toastMessage, setToastMessage] = createSignal(hashError);

  const [currentEater, setCurrentEater] = createSignal("");
  const [eaters, setEaters] = createSignal(restored?.eaters ?? []);
  const [foodInfo, setFoodInfo] = createStore(restored?.foodInfo ?? []);

  const onChangeEater = (e) => {
    e.preventDefault();
    setCurrentEater(e.target.value);
  };

  const handleSubmit = () => {
    if (eaters().includes(currentEater())) {
      setCurrentEater("");
      return;
    }

    setEaters([...eaters(), currentEater()]);
    setCurrentEater("");
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

  const handleShare = async () => {
    try {
      const state = { eaters: eaters(), foodInfo: [...foodInfo] };
      const hash = toBase64(JSON.stringify(state));
      window.location.hash = hash;
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copied. Send it to the table!");
      } catch {
        showToast("Copy the link from the address bar to share it.");
      }
    } catch {
      showToast("Something went wrong while creating the share link.");
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
    </>
  );
};

export default App;
