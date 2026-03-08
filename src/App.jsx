import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import Form from "./Form";
/* Serialize eaters and foodInfo as Base64 JSON in the URL hash
fragment so users can share a pre-filled form with a single link.
On load, the app decodes the hash and hydrates the signals/store.
A "Share link" button copies the full URL to the clipboard with
brief visual feedback.
 */
function decodeHashState() {
  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    const json = atob(hash);
    const state = JSON.parse(json);
    if (Array.isArray(state.eaters) && Array.isArray(state.foodInfo)) {
      return state;
    }
  } catch {
    // ignore malformed hash
  }
  return null;
}

const App = () => {
  const restored = decodeHashState();

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
  };

  const handleSubmitFood = (foodData) => {
    setFoodInfo([...foodInfo, foodData]);
  };

  const handleDeleteFood = (foodIndex) => {
    setFoodInfo(foodInfo.filter((_, index) => index !== foodIndex));
  };

  const handleShare = async () => {
    const state = { eaters: eaters(), foodInfo: [...foodInfo] };
    const hash = btoa(JSON.stringify(state));
    window.location.hash = hash;
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Form
      currentEater={currentEater}
      eaters={eaters}
      onChangeEater={onChangeEater}
      handleSubmit={handleSubmit}
      handleSubmitFood={handleSubmitFood}
      handleDeleteEater={handleDeleteEater}
      handleDeleteFood={handleDeleteFood}
      handleShare={handleShare}
      foodInfo={foodInfo}
    />
  );
};

export default App;
