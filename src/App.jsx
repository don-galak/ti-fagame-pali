import { createSignal, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import Form from "./Form";
import Toast from "./Toast";
import {
  isShortId,
  loadBill,
  saveBill,
  ShareNotFoundError,
} from "./shareApi";

const isValidState = (state) =>
  Array.isArray(state?.eaters) && Array.isArray(state?.foodInfo);

const App = () => {
  const hash = window.location.hash.slice(1);
  const shortId = isShortId(hash) ? hash : null;

  const [toastMessage, setToastMessage] = createSignal(
    hash && !shortId ? "This link isn't valid." : null
  );
  const [loading, setLoading] = createSignal(Boolean(shortId));
  const [sharing, setSharing] = createSignal(false);

  const [currentEater, setCurrentEater] = createSignal("");
  const [eaters, setEaters] = createSignal([]);
  const [foodInfo, setFoodInfo] = createStore([]);

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
      window.location.hash = await saveBill(state);

      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copied. Send it to the table!");
      } catch {
        showToast("Copy the link from the address bar to share it.");
      }
    } catch {
      showToast("Couldn't create a link. Check your connection and try again.");
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
