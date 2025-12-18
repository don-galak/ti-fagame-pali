import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import Form from "./Form";

const App = () => {
  const [currentEater, setCurrentEater] = createSignal("");
  const [eaters, setEaters] = createSignal([]);
  const [foodInfo, setFoodInfo] = createStore([]);

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

  return (
    <Form
      currentEater={currentEater}
      eaters={eaters}
      onChangeEater={onChangeEater}
      handleSubmit={handleSubmit}
      handleSubmitFood={handleSubmitFood}
      handleDeleteEater={handleDeleteEater}
      handleDeleteFood={handleDeleteFood}
      foodInfo={foodInfo}
    />
  );
};

export default App;
