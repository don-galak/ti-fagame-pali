import "./styles.css";

const Iteration2 = () => {
  return (
    <div class="container">
      <h2>Food Entry</h2>

      <div class="field">
        <label for="eaters">Enter eaters</label>
        <input type="text" id="eaters" placeholder="e.g. John, Maria" />
      </div>

      <div class="field">
        <label for="food">Enter food</label>
        <input type="text" id="food" placeholder="e.g. Pizza" />
      </div>

      <div class="field">
        <label for="price">Enter price</label>
        <input type="number" id="price" placeholder="e.g. 12.50" />
      </div>

      <div class="field">
        <label for="names">Enter names</label>
        <select id="names">
          <option value="">Select eater</option>
          <option value="john">John</option>
          <option value="maria">Maria</option>
          <option value="alex">Alex</option>
        </select>
      </div>

      <button type="button">Submit</button>
    </div>
  );
};

export default Iteration2;