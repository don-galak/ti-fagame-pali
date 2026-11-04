import { For, Show } from "solid-js";
import "./index.css";

const Form = ({
  currentEater,
  handleSubmit,
  handleSubmitFood,
  handleDeleteEater,
  handleDeleteFood,
  handleShare,
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
      <div class="header-row">
        <h2>Split the bill</h2>
        <button class="btn btn-share" type="button" onClick={handleShare}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="16"
            height="16"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share with the table
        </button>
      </div>

      <div class="grid">
        <section class="card" aria-label="People and items">
          <div class="card-title">
            <h3>1. Who's at the table?</h3>
          </div>

          <div class="field">
            <label for="eaterInput">Name</label>
            <div class="row">
              <input
                id="eaterInput"
                type="text"
                placeholder="e.g. Maria"
                value={currentEater()}
                onChange={onChangeEater}
                onkeyup={event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                class="btn btn-primary"
                type="button"
                onClick={handleSubmit}
              >
                Add person
              </button>
            </div>
          </div>

          <div class="card-title">
            <h3>2. What did you order?</h3>
          </div>

          <form use:foodSubmitHandler={onSubmitFood}>
            <div class="form-row">
              <div class="field">
                <label for="foodInput">Item</label>
                <input
                  name="food"
                  id="foodInput"
                  type="text"
                  placeholder="e.g. Pizza, house wine"
                />
              </div>

              <div class="field">
                <label for="priceInput">Price (€)</label>
                <input
                  name="price"
                  id="priceInput"
                  type="number"
                  step="0.01"
                  placeholder="12.50"
                />
              </div>
            </div>

            <div class="field">
              <p class="field-label">Who's sharing this?</p>
              <div class="checkbox-group">
                <Show
                  when={eaters().length > 0}
                  fallback={
                    <div class="empty-state">
                      <span class="empty-icon">👥</span>
                      <span>Add the people at the table first.</span>
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
              Add to the bill
            </button>
          </form>
        </section>
      </div>

      <div class="divider"></div>

      <section class="card" aria-label="The bill">
        <div class="card-title">
          <h3>The bill</h3>
        </div>

        <ul class="list" aria-label="Bill items">
          <For each={foodInfo}>
            {(food, index) => (
              <li class="list-item">
                <div class="item-left">
                  <span class="item-title">{food.food}</span>
                  <span class="item-meta">
                    €{food.price} • Shared by {food.people.join(", ")}
                  </span>
                </div>
                <button
                  class="btn btn-danger"
                  type="button"
                  onClick={() => handleDeleteFood(index())}
                >
                  Remove
                </button>
              </li>
            )}
          </For>
        </ul>
      </section>

      <div class="divider"></div>

      <section class="card amounts-card" aria-label="Who owes what">
        <div class="card-title">
          <h3>3. Who owes what</h3>
        </div>

        <Show
          when={splitAmountsPerPerson().length > 0}
          fallback={
            <div class="amounts-empty">
              <span class="amounts-empty-icon">🧮</span>
              <span>Add people and items to see who owes what.</span>
            </div>
          }
        >
          <div class="amounts-grid">
            <For each={splitAmountsPerPerson()}>
              {([person, amount]) => (
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
                  <div class="amount-value">
                    <span class="amount-currency">€</span>
                    <span class="amount-number">{amount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </For>
          </div>

          <div class="amounts-total">
            <span class="total-label">Bill total</span>
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

export default Form;
