import "./styles.css";

const Iteration1 = ({
  currentEater,
  currentFood,
  handleSubmit,
  handleSubmitFood,
  handleDelete,
  handleDeleteFood,
  eaters,
  foods,
  onChangeEater,
  onChangeFood,
}) => {
  return (
    <div class="wrapper">
      <div class="h">
        <h4>Enter eaters</h4>
        <br />
        <input
          name="eater"
          type="text"
          onChange={onChangeEater}
          value={currentEater()}
          class="eater-input"
        />
        <button type="submit" onClick={handleSubmit}>
          Submit eater
        </button>
      </div>
      <div class="h">
        <h4>Enter foods</h4>
        <br />
        <input
          name="food"
          type="text"
          onChange={onChangeFood}
          value={currentFood()}
          class="food-input"
        />
        <button type="submit" onClick={handleSubmitFood}>
          Submit food
        </button>
      </div>
      <div class="result">H3</div>
      <div class="eater-list">
        <Index each={eaters()}>
          {(eater, i) => (
            <div class="eater">
              <button
                class="delete-button"
                onClick={() => handleDelete(eater())}
              >
                X
              </button>
              {eater()}
            </div>
          )}
        </Index>
      </div>

      <div class="eater-list">
        <Index each={foods()}>
          {(food, i) => (
            <div>
              <button
                class="delete-button"
                onClick={() => handleDeleteFood(food())}
              >
                X
              </button>
              {food()}
            </div>
          )}
        </Index>
      </div>
    </div>
  );
};

export default Iteration1;