import "./styles.css";

const Iteration3 = ({}) => {
  return (
    <div class="container">
      <h2>Food & Eaters</h2>

      <div class="grid">
        <section class="card" aria-label="Eaters Section">
          <div class="card-title">
            <h3>Eaters</h3>
            <span class="badge">Names list</span>
          </div>

          <div class="field">
            <label for="eaterInput">Enter eater name</label>
            <div class="row">
              <input id="eaterInput" type="text" placeholder="e.g. John" />
              <button class="btn btn-primary" type="button">
                Add eater
              </button>
            </div>
          </div>

          <ul class="list" aria-label="Eaters list">
            <li class="list-item">
              <span class="item-name">John</span>
              <button class="btn btn-danger" type="button">
                Delete
              </button>
            </li>
            <li class="list-item">
              <span class="item-name">Maria</span>
              <button class="btn btn-danger" type="button">
                Delete
              </button>
            </li>
          </ul>

          <p class="hint">
            This list displays eaters. Each row has its own Delete button.
          </p>
        </section>

        <section class="card" aria-label="Food Section">
          <div class="card-title">
            <h3>Food info</h3>
            <span class="badge">Separate section</span>
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
            <label for="namesSelect">Enter names</label>
            <select id="namesSelect">
              <option value="">Select eater</option>
              <option value="john">John</option>
              <option value="maria">Maria</option>
              <option value="alex">Alex</option>
            </select>
          </div>

          <button class="btn btn-primary" type="button">
            Submit food
          </button>

          <p class="hint">
            Food fields are clearly separated from eater management. Hook these
            up with JS as needed.
          </p>
        </section>
      </div>

      <div class="divider"></div>

      <p class="hint">
        If you want, I can add a small vanilla JS snippet so: 1) “Add eater”
        appends to the list, 2) Delete removes a row, 3) the dropdown updates
        from the eater list automatically.
      </p>
    </div>
  );
};
export default Iteration3;