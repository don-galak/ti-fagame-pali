import "./index.css";

const Iteration4 = ({
  currentEater,
  handleSubmit,
  handleSubmitFood,
  handleDeleteEater,
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
        food: formData.get("food"),
        price: formData.get("price"),
        people: formData.getAll("people"),
      };
      console.log("foodSubmitHandler", data);
      accessor()(data);
      // ref.reset();
    };
  };

  const onSubmitFood = (data) => {
    handleSubmitFood(data);
  };

  const splitAmountsPerPerson = () => {
    const amountsToPay = eaters().reduce((acc, eater) => {
      acc[eater] = 0;
      return acc;
    }, {});

    for (const [, entry] of Object.entries(foodInfo)) {
      const amountPerPerson = Number(
        (entry.price / entry.people.length).toFixed(2)
      );

      for (const person of [...entry.people]) {
        amountsToPay[person] += amountPerPerson;
      }
    }

    return amountsToPay;
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

          <div class="card-title">
            <h3>Food info</h3>
            <span class="badge">Add foods</span>
          </div>

          <form use:foodSubmitHandler={onSubmitFood}>
            <div class="field">
              <input
                name="food"
                id="foodInput"
                type="text"
                placeholder="e.g. Pizza"
              />
            </div>

            <div class="field">
              <input
                name="price"
                id="priceInput"
                type="number"
                step="0.01"
                placeholder="e.g. 12.50"
              />
            </div>

            <div class="field">
              <p>Who ate it?</p>
              <div class="checkbox-group">
                <For each={eaters()}>
                  {(eater) => (
                    <label class="checkbox-item">
                      <input type="checkbox" name="people" value={eater} />
                      <span>{eater}</span>
                      <button
                        type="button"
                        class="btn btn-danger delete-eater"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteEater(eater);
                        }}
                      >
                        X
                      </button>
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
                  <span class="item-title">{food.food}</span>
                  <span class="item-meta">
                    €{food.price} • Eaten by: {food.people.join(", ")}
                  </span>
                </div>
                <button
                  class="btn btn-danger"
                  type="button"
                  onClick={() => handleDeleteFood(index())}
                >
                  Delete
                </button>
              </li>
            )}
          </For>
        </ul>
      </section>

      <div class="divider"></div>

      <section class="card" aria-label="Foods List Section">
        <div class="card-title">
          <h3>Splitted amounts per person</h3>
          <span class="badge">Amounts</span>
        </div>

        <code>{JSON.stringify(splitAmountsPerPerson())}</code>
      </section>
    </div>
  );
};

export default Iteration4;
