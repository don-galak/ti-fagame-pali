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

    return Object.entries(amountsToPay);
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
              <p class="field-label">Who ate it?</p>
              <div class="checkbox-group">
                <Show
                  when={eaters().length > 0}
                  fallback={
                    <div class="empty-state">
                      <span class="empty-icon">👥</span>
                      <span>No eaters yet. Add someone above!</span>
                    </div>
                  }
                >
                  <For each={eaters()}>
                    {(eater) => (
                      <label class="checkbox-item">
                        <input type="checkbox" name="people" value={eater} />
                        <span class="checkbox-custom">
                          <svg viewBox="0 0 12 10" fill="none">
                            <path
                              d="M1 5L4.5 8.5L11 1"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </span>
                        <span
                          class="avatar"
                          style={`--hue: ${(eater.charCodeAt(0) * 7) % 360}`}
                        >
                          {eater.charAt(0).toUpperCase()}
                        </span>
                        <span class="eater-name">{eater}</span>
                        <button
                          type="button"
                          class="delete-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteEater(eater);
                          }}
                          title={`Remove ${eater}`}
                        >
                          <svg viewBox="0 0 16 16" fill="none">
                            <path
                              d="M12 4L4 12M4 4L12 12"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                            />
                          </svg>
                        </button>
                      </label>
                    )}
                  </For>
                </Show>
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

      <section class="card amounts-card" aria-label="Amounts Section">
        <div class="card-title">
          <h3>Split amounts per person</h3>
          <span class="badge badge-green">💰 Summary</span>
        </div>

        <Show
          when={splitAmountsPerPerson().length > 0}
          fallback={
            <div class="amounts-empty">
              <span class="amounts-empty-icon">🧮</span>
              <span>Add eaters and foods to see the split</span>
            </div>
          }
        >
          <div class="amounts-grid">
            <For each={splitAmountsPerPerson()}>
              {([person, amount]) => {
                const maxAmount = Math.max(
                  ...splitAmountsPerPerson().map(([, a]) => a),
                  1
                );
                const percentage = (amount / maxAmount) * 100;
                return (
                  <div class="amount-card">
                    <div class="amount-header">
                      <span
                        class="amount-avatar"
                        style={`--hue: ${(person.charCodeAt(0) * 7) % 360}`}
                      >
                        {person.charAt(0).toUpperCase()}
                      </span>
                      <span class="amount-name">{person}</span>
                    </div>
                    <div class="amount-bar-container">
                      <div
                        class="amount-bar"
                        style={`width: ${percentage}%; --hue: ${(person.charCodeAt(0) * 7) % 360}`}
                      />
                    </div>
                    <div class="amount-value">
                      <span class="amount-currency">€</span>
                      <span class="amount-number">{amount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>

          <div class="amounts-total">
            <span class="total-label">Total</span>
            <span class="total-value">
              €
              {splitAmountsPerPerson()
                .reduce((sum, [, amount]) => sum + amount, 0)
                .toFixed(2)}
            </span>
          </div>
        </Show>
      </section>
    </div>
  );
};

export default Iteration4;
