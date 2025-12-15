import "./index.css";

const Iteration4 = ({
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

          <div class="field">
            <label for="foodInput">Enter food</label>
            <input id="foodInput" type="text" placeholder="e.g. Pizza" />
          </div>

          <div class="field">
            <label for="priceInput">Enter price</label>
            <input
              id="priceInput"
              type="number"
              step="0.01"
              placeholder="e.g. 12.50"
            />
          </div>

          <div class="field">
            <label for="namesSelect">People who ate it</label>
            <select id="namesSelect">
              <option value="john">John</option>
              <option value="maria">Maria</option>
              <option value="alex">Alex</option>
            </select>
          </div>

          <button class="btn btn-primary" type="button">
            Add food
          </button>
        </section>
      </div>

      <div class="divider"></div>

      <section class="card" aria-label="Foods List Section">
        <div class="card-title">
          <h3>Provided foods</h3>
          <span class="badge">History</span>
        </div>

        <ul class="list" aria-label="Foods list">
          <li class="list-item">
            <div class="item-left">
              <span class="item-title">Pizza</span>
              <span class="item-meta">€12.50 • Eaten by: John, Maria</span>
            </div>
            <button class="btn btn-danger" type="button">
              Delete
            </button>
          </li>

          <li class="list-item">
            <div class="item-left">
              <span class="item-title">Souvlaki</span>
              <span class="item-meta">€9.00 • Eaten by: Alex</span>
            </div>
            <button class="btn btn-danger" type="button">
              Delete
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Iteration4;
