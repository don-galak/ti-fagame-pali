import "./index.css";

const Iteration4 = ({
  currentEater,
  handleSubmit,
  handleSubmitFood,
  handleDelete,
  handleDeleteFood,
  eaters,
  onChangeEater,
  foodInfo,
}) => {
  const foodSubmitHandler = (ref, accessor) => {
    ref.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(ref);
      const data = {
        foodName: formData.get("foodName"),
        foodPrice: formData.get("foodPrice"),
        foodPeople: formData.getAll("foodPeople"),
      };
      console.log('foodSubmitHandler', data);
      accessor()(data);
      // ref.reset();
    };
  };

  const onSubmitFood = (data) => {
    handleSubmitFood(data);
  };

  return (
    <div class="container">
      <h2>Food & Eaters</h2>

      <div class="grid">
        <section class="card" aria-label="Eaters Section">
          <div class="card-title">
            <h3>Eaters</h3>
            <span class="badge">Manage names</span>
          </div>

          <div class="field">
            <label for="eaterInput">Enter eater name</label>
            <div class="row">
              <input
                id="eaterInput"
                type="text"
                placeholder="e.g. John"
                value={currentEater()}
                onChange={onChangeEater}
              />
              <button
                class="btn btn-primary"
                type="button"
                onClick={handleSubmit}
              >
                Add eater
              </button>
            </div>
          </div>

          <ul class="list" aria-label="Eaters list">
            <Index each={eaters()}>
              {(eater, i) => (
                <li class="list-item">
                  <div class="item-left">
                    <span class="item-title">{eater()}</span>
                  </div>
                  <button
                    class="btn btn-danger"
                    type="button"
                    onClick={() => handleDelete(eater())}
                  >
                    Delete
                  </button>
                </li>
              )}
            </Index>
          </ul>
        </section>

        <section class="card" aria-label="Food Section">
          <div class="card-title">
            <h3>Food info</h3>
            <span class="badge">Add foods</span>
          </div>

          <form use:foodSubmitHandler={onSubmitFood}>
            <div class="field">
              <input
                name="foodName"
                id="foodInput"
                type="text"
                placeholder="e.g. Pizza"
              />
            </div>

            <div class="field">
              <input
                name="foodPrice"
                id="priceInput"
                type="number"
                step="0.01"
                placeholder="e.g. 12.50"
              />
            </div>

            <div class="field">
              <label>Who ate it?</label>
              <div class="checkbox-group">
                <For each={eaters()}>
                  {(eater) => (
                    <label class="checkbox-item">
                      <input type="checkbox" name='foodPeople' value={eater} />
                      <span>{eater}</span>
                    </label>
                  )}
                </For>
              </div>
            </div>

            <button class="btn btn-primary" type="submit">
              Add food
            </button>
          </form>
        </section>
      </div>

      <div class="divider"></div>

      <section class="card" aria-label="Foods List Section">
        <div class="card-title">
          <h3>Provided foods</h3>
          <span class="badge">History</span>
        </div>

        <ul class="list" aria-label="Foods list">
          <For each={foodInfo}>
            {(food, index) => (
              <li class="list-item">
                <div class="item-left">
                  <span class="item-title">{food.foodName}</span>
                  <span class="item-meta">€{food.foodPrice} • Eaten by: {food.foodPeople.join(', ')}</span>
                </div>
                <button class="btn btn-danger" type="button" onClick={() => handleDeleteFood(index())}>
                  Delete
                </button>
              </li>
            )}
          </For>
        </ul>
      </section>
    </div>
  );
};

export default Iteration4;
