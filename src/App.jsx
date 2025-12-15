import { createSignal } from "solid-js";
import Iteration1 from "./Iterations/1";
import Iteration2 from "./Iterations/2";
import Iteration3 from "./Iterations/3";
import Iteration4 from "./Iterations/4";

const iterations = [Iteration1, Iteration2, Iteration3, Iteration4];
const currentIteration = iterations[3];

const App = () => {
  const [currentEater, setCurrentEater] = createSignal("");
  const [eaters, setEaters] = createSignal([]);
  const [currentFood, setCurrentFood] = createSignal("");
  const [foods, setFoods] = createSignal([]);

  const onChangeEater = (e) => {
    e.preventDefault();
    setCurrentEater(e.target.value);
  };

  const onChangeFood = (e) => {
    e.preventDefault();
    setCurrentFood(e.target.value);
  };

  const handleSubmit = () => {
    if (eaters().includes(currentEater())) {
      setCurrentEater("");
      return;
    }

    setEaters([...eaters(), currentEater()]);
    setCurrentEater("");
  };

  const handleDelete = (eater) => {
    setEaters(eaters().filter((e) => e !== eater));
  };

  const handleSubmitFood = () => {
    if (foods().includes(currentFood())) {
      setCurrentFood("");
      return;
    }

    setFoods([...foods(), currentFood()]);
    setCurrentFood("");
  };

  const handleDeleteFood = (food) => {
    setFoods(foods().filter((f) => f !== food));
  };

  return (
    <Dynamic
      component={currentIteration}
      currentEater={currentEater}
      currentFood={currentFood}
      eaters={eaters}
      foods={foods}
      onChangeEater={onChangeEater}
      onChangeFood={onChangeFood}
      handleSubmit={handleSubmit}
      handleSubmitFood={handleSubmitFood}
      handleDelete={handleDelete}
      handleDeleteFood={handleDeleteFood}
    />
  );
};

export default App;
