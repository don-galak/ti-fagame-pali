import { For, Show } from "solid-js";
import "./index.css";

const hueFor = (name) => (name.charCodeAt(0) * 7) % 360;

const formatEuro = (amount) => `€${amount.toFixed(2)}`;

const Form = ({
  currentEater,
  handleSubmit,
  handleSubmitFood,
  handleDeleteEater,
  handleDeleteFood,
  handleTogglePerson,
  handleToggleEveryone,
  handleShare,
  eaters,
  onChangeEater,
  foodInfo,
}) => {
  let itemInput;

  const foodSubmitHandler = (ref, accessor) => {
    ref.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(ref);
      const food = String(formData.get("food") ?? "").trim();
      const price = Number(formData.get("price"));
      if (!food || !(price > 0)) return;
      accessor()({ food, price, people: [] });
      ref.reset();
      itemInput?.focus();
    };
  };

  const onSubmitFood = (data) => {
    handleSubmitFood(data);
  };

  // Shares are summed unrounded and each person's total is rounded once,
  // so the amounts add up to the bill instead of drifting by a few cents.
  const summary = () => {
    const owed = Object.fromEntries(eaters().map((eater) => [eater, 0]));
    let billTotal = 0;
    let unassigned = 0;

    for (const item of foodInfo) {
      const price = Number(item.price) || 0;
      billTotal += price;
      const people = item.people.filter((p) => p in owed);
      if (people.length === 0) {
        unassigned += price;
        continue;
      }
      for (const person of people) {
        owed[person] += price / people.length;
      }
    }

    return { owed: Object.entries(owed), billTotal, unassigned };
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
                onkeyup={(event) => {
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

          <div class="checkbox-group people-group">
            <Show
              when={eaters().length > 0}
              fallback={
                <div class="empty-state">
                  <span class="empty-icon">👥</span>
                  <span>No one at the table yet.</span>
                </div>
              }
            >
              <For each={eaters()}>
                {(eater) => (
                  <div class="checkbox-item person-chip">
                    <span class="avatar" style={`--hue: ${hueFor(eater)}`}>
                      {eater.charAt(0).toUpperCase()}
                    </span>
                    <span class="eater-name">{eater}</span>
                    <button
                      type="button"
                      class="delete-btn"
                      onClick={() => handleDeleteEater(eater)}
                      title={`Remove ${eater}`}
                      aria-label={`Remove ${eater}`}
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
                  </div>
                )}
              </For>
            </Show>
          </div>

          <div class="card-title section-gap">
            <h3>2. What did you order?</h3>
          </div>

          <form use:foodSubmitHandler={onSubmitFood}>
            <div class="form-row">
              <div class="field">
                <label for="foodInput">Item</label>
                <input
                  ref={itemInput}
                  name="food"
                  id="foodInput"
                  type="text"
                  placeholder="e.g. Pizza, house wine"
                  required
                />
              </div>

              <div class="field">
                <label for="priceInput">Price (€)</label>
                <input
                  name="price"
                  id="priceInput"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="12.50"
                  required
                />
              </div>
            </div>

            <button class="btn btn-primary" type="submit">
              Add to the bill
            </button>
          </form>
        </section>
      </div>

      <div class="divider"></div>

      <section class="card" aria-label="Who had what">
        <div class="card-title">
          <h3>3. Who had what?</h3>
        </div>

        <Show
          when={foodInfo.length > 0}
          fallback={
            <div class="empty-state">
              <span class="empty-icon">🧾</span>
              <span>Add what you ordered, then tap who had each item.</span>
            </div>
          }
        >
          <ul class="list" aria-label="Bill items">
            <For each={foodInfo}>
              {(item, index) => {
                const sharers = () =>
                  item.people.filter((p) => eaters().includes(p));
                const everyone = () =>
                  eaters().length > 0 && sharers().length === eaters().length;

                return (
                  <li class="list-item bill-item">
                    <div class="bill-item-header">
                      <div class="item-left">
                        <span class="item-title">{item.food}</span>
                        <span class="item-meta">
                          {formatEuro(Number(item.price))}
                          <Show
                            when={sharers().length > 0}
                            fallback={
                              <span class="unassigned-tag">
                                {" "}
                                • Not assigned yet
                              </span>
                            }
                          >
                            {" "}
                            •{" "}
                            {sharers().length === 1
                              ? "1 person"
                              : `${formatEuro(
                                  Number(item.price) / sharers().length
                                )} each`}
                          </Show>
                        </span>
                      </div>
                      <button
                        class="btn btn-danger"
                        type="button"
                        onClick={() => handleDeleteFood(index())}
                      >
                        Remove
                      </button>
                    </div>

                    <Show
                      when={eaters().length > 0}
                      fallback={
                        <span class="item-meta">
                          Add the people at the table first.
                        </span>
                      }
                    >
                      <div
                        class="chip-row"
                        role="group"
                        aria-label={`Who had ${item.food}`}
                      >
                        <For each={eaters()}>
                          {(eater) => (
                            <button
                              type="button"
                              class="chip"
                              classList={{ "chip-on": sharers().includes(eater) }}
                              aria-pressed={sharers().includes(eater)}
                              style={`--hue: ${hueFor(eater)}`}
                              onClick={() => handleTogglePerson(index(), eater)}
                            >
                              {eater}
                            </button>
                          )}
                        </For>
                        <button
                          type="button"
                          class="chip chip-everyone"
                          classList={{ "chip-on": everyone() }}
                          aria-pressed={everyone()}
                          onClick={() => handleToggleEveryone(index())}
                        >
                          Everyone
                        </button>
                      </div>
                    </Show>
                  </li>
                );
              }}
            </For>
          </ul>
        </Show>
      </section>

      <div class="divider"></div>

      <section class="card amounts-card" aria-label="Who owes what">
        <div class="card-title">
          <h3>4. Who owes what</h3>
        </div>

        <Show
          when={summary().owed.length > 0}
          fallback={
            <div class="amounts-empty">
              <span class="amounts-empty-icon">🧮</span>
              <span>Add people and items to see who owes what.</span>
            </div>
          }
        >
          <div class="amounts-grid">
            <For each={summary().owed}>
              {([person, amount]) => (
                <div class="amount-card">
                  <div class="amount-header">
                    <span
                      class="amount-avatar"
                      style={`--hue: ${hueFor(person)}`}
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

          <Show when={summary().unassigned > 0.004}>
            <div class="unassigned-note">
              ⚠ {formatEuro(summary().unassigned)} not assigned yet
            </div>
          </Show>

          <div class="amounts-total">
            <span class="total-label">Bill total</span>
            <span class="total-value">{formatEuro(summary().billTotal)}</span>
          </div>
        </Show>
      </section>
    </div>
  );
};

export default Form;
