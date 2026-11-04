import { cleanup, render, screen, within } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

// ---------- helpers ----------

const setup = () => {
  const user = userEvent.setup();
  render(() => <App />);
  return user;
};

const addPerson = async (user, name) => {
  await user.type(screen.getByLabelText("Name"), name);
  await user.click(screen.getByRole("button", { name: "Add person" }));
};

const addItem = async (user, item, price) => {
  await user.type(screen.getByLabelText("Item"), item);
  if (price !== undefined) {
    await user.type(screen.getByLabelText("Price (€)"), String(price));
  }
  await user.click(screen.getByRole("button", { name: "Add to the bill" }));
};

const billItems = () =>
  within(screen.getByRole("list", { name: "Bill items" })).getAllByRole(
    "listitem"
  );

const billItem = (name) => {
  const item = billItems().find((li) => within(li).queryByText(name));
  if (!item) {
    const titles = billItems().map(
      (li) => li.querySelector(".item-title")?.textContent
    );
    throw new Error(
      `No bill item called "${name}". Items on the bill: ${JSON.stringify(titles)}`
    );
  }
  return item;
};

const chip = (itemName, label) =>
  within(billItem(itemName)).getByRole("button", { name: label });

const toggle = (user, itemName, label) => user.click(chip(itemName, label));

const people = () =>
  screen
    .queryAllByRole("button", { name: /^Remove .+/ })
    .map((b) => b.getAttribute("aria-label").replace(/^Remove /, ""));

const owed = (name) => {
  const card = [...document.querySelectorAll(".amount-card")].find((c) =>
    within(c).queryByText(name)
  );
  return card ? card.querySelector(".amount-number").textContent : undefined;
};

const billTotal = () => document.querySelector(".total-value").textContent;

const encodeState = (state) => btoa(JSON.stringify(state));

// ---------- tests ----------

describe("empty app", () => {
  it("shows the empty state for every step", () => {
    setup();
    expect(screen.getByText("No one at the table yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Add what you ordered, then tap who had each item.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add people and items to see who owes what.")
    ).toBeInTheDocument();
  });
});

describe("1. Who's at the table?", () => {
  it("adds people with the button and clears the input", async () => {
    const user = setup();
    await addPerson(user, "Maria");
    await addPerson(user, "Nikos");

    expect(people()).toEqual(["Maria", "Nikos"]);
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("adds a person when pressing Enter", async () => {
    const user = setup();
    await user.type(screen.getByLabelText("Name"), "Eleni{Enter}");

    expect(people()).toEqual(["Eleni"]);
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("ignores empty names and duplicates", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Add person" }));
    await addPerson(user, "   ");
    await addPerson(user, "Maria");
    await addPerson(user, "  Maria ");

    expect(people()).toEqual(["Maria"]);
  });

  it("removes a person", async () => {
    const user = setup();
    await addPerson(user, "Maria");
    await addPerson(user, "Nikos");
    await user.click(screen.getByRole("button", { name: "Remove Maria" }));

    expect(people()).toEqual(["Nikos"]);
  });
});

describe("2. What did you order?", () => {
  it("adds an item, clears the form and refocuses the item field", async () => {
    const user = setup();
    await addItem(user, "Pizza", 12);

    expect(billItems()).toHaveLength(1);
    expect(billItem("Pizza")).toHaveTextContent("€12.00");
    expect(screen.getByLabelText("Item")).toHaveValue("");
    expect(screen.getByLabelText("Price (€)")).toHaveValue(null);
    expect(screen.getByLabelText("Item")).toHaveFocus();
  });

  it("does not add an item without a price", async () => {
    const user = setup();
    await addItem(user, "Pizza");

    expect(screen.queryByRole("list", { name: "Bill items" })).toBeNull();
  });

  it("does not add an item without a name", async () => {
    const user = setup();
    await user.type(screen.getByLabelText("Price (€)"), "12");
    await user.click(screen.getByRole("button", { name: "Add to the bill" }));

    expect(screen.queryByRole("list", { name: "Bill items" })).toBeNull();
  });

  it("removes an item and updates the totals", async () => {
    const user = setup();
    await addPerson(user, "Maria");
    await addItem(user, "Pizza", 12);
    await addItem(user, "Wine", 14);
    await toggle(user, "Pizza", "Maria");
    await toggle(user, "Wine", "Maria");
    expect(owed("Maria")).toBe("26.00");

    await user.click(
      within(billItem("Pizza")).getByRole("button", { name: "Remove" })
    );

    expect(billItems()).toHaveLength(1);
    expect(owed("Maria")).toBe("14.00");
    expect(billTotal()).toBe("€14.00");
  });
});

describe("3. Who had what?", () => {
  it("asks for people first when items exist but nobody is at the table", async () => {
    const user = setup();
    await addItem(user, "Pizza", 12);

    expect(
      within(billItem("Pizza")).getByText("Add the people at the table first.")
    ).toBeInTheDocument();

    await addPerson(user, "Maria");
    expect(chip("Pizza", "Maria")).toBeInTheDocument();
  });

  it("marks new items as not assigned and flags them in the summary", async () => {
    const user = setup();
    await addPerson(user, "Maria");
    await addItem(user, "Pizza", 12);

    expect(billItem("Pizza")).toHaveTextContent("Not assigned yet");
    expect(screen.getByText(/€12\.00 not assigned yet/)).toBeInTheDocument();
    expect(owed("Maria")).toBe("0.00");
    expect(billTotal()).toBe("€12.00");
  });

  it("toggles people on and off an item", async () => {
    const user = setup();
    await addPerson(user, "Maria");
    await addPerson(user, "Nikos");
    await addItem(user, "Pizza", 12);

    await toggle(user, "Pizza", "Maria");
    expect(chip("Pizza", "Maria")).toHaveAttribute("aria-pressed", "true");
    expect(billItem("Pizza")).toHaveTextContent("1 person");
    expect(owed("Maria")).toBe("12.00");

    await toggle(user, "Pizza", "Nikos");
    expect(billItem("Pizza")).toHaveTextContent("€6.00 each");
    expect(owed("Maria")).toBe("6.00");
    expect(owed("Nikos")).toBe("6.00");
    expect(screen.queryByText(/not assigned yet/)).toBeNull();

    await toggle(user, "Pizza", "Maria");
    expect(chip("Pizza", "Maria")).toHaveAttribute("aria-pressed", "false");
    expect(owed("Maria")).toBe("0.00");
    expect(owed("Nikos")).toBe("12.00");
  });

  it("assigns and unassigns everyone at once", async () => {
    const user = setup();
    await addPerson(user, "Maria");
    await addPerson(user, "Nikos");
    await addPerson(user, "Eleni");
    await addItem(user, "Bread", 9);

    await toggle(user, "Bread", "Maria");
    expect(chip("Bread", "Everyone")).toHaveAttribute("aria-pressed", "false");

    await toggle(user, "Bread", "Everyone");
    for (const name of ["Maria", "Nikos", "Eleni", "Everyone"]) {
      expect(chip("Bread", name)).toHaveAttribute("aria-pressed", "true");
    }
    expect(billItem("Bread")).toHaveTextContent("€3.00 each");

    await toggle(user, "Bread", "Everyone");
    for (const name of ["Maria", "Nikos", "Eleni", "Everyone"]) {
      expect(chip("Bread", name)).toHaveAttribute("aria-pressed", "false");
    }
    expect(billItem("Bread")).toHaveTextContent("Not assigned yet");
  });

  it("takes a removed person off every item", async () => {
    const user = setup();
    await addPerson(user, "Maria");
    await addPerson(user, "Nikos");
    await addItem(user, "Pizza", 12);
    await addItem(user, "Wine", 14);
    await toggle(user, "Pizza", "Maria");
    await toggle(user, "Wine", "Everyone");

    await user.click(screen.getByRole("button", { name: "Remove Maria" }));

    expect(billItem("Pizza")).toHaveTextContent("Not assigned yet");
    expect(billItem("Wine")).toHaveTextContent("1 person");
    expect(owed("Maria")).toBeUndefined();
    expect(owed("Nikos")).toBe("14.00");
    expect(screen.getByText(/€12\.00 not assigned yet/)).toBeInTheDocument();
  });
});

describe("4. Who owes what", () => {
  it("adds up a full dinner", async () => {
    const user = setup();
    for (const name of ["Maria", "Nikos", "Eleni"]) await addPerson(user, name);
    await addItem(user, "Pizza", 12);
    await addItem(user, "Souvlaki", 9);
    await addItem(user, "Wine", 15);

    await toggle(user, "Pizza", "Maria");
    await toggle(user, "Pizza", "Nikos");
    await toggle(user, "Souvlaki", "Eleni");
    await toggle(user, "Wine", "Everyone");

    expect(owed("Maria")).toBe("11.00"); // 6 + 5
    expect(owed("Nikos")).toBe("11.00"); // 6 + 5
    expect(owed("Eleni")).toBe("14.00"); // 9 + 5
    expect(billTotal()).toBe("€36.00");
  });

  it("keeps the bill total exact when shares don't divide evenly", async () => {
    const user = setup();
    for (const name of ["Maria", "Nikos", "Eleni"]) await addPerson(user, name);
    await addItem(user, "Starter", 10);
    await toggle(user, "Starter", "Everyone");

    expect(billItem("Starter")).toHaveTextContent("€3.33 each");
    expect(owed("Maria")).toBe("3.33");
    expect(billTotal()).toBe("€10.00");
  });
});

describe("sharing", () => {
  it("copies a link that restores the whole bill", async () => {
    const user = setup();
    await addPerson(user, "Maria");
    await addPerson(user, "Nikos");
    await addItem(user, "Pizza", 12);
    await addItem(user, "Wine", 14);
    await toggle(user, "Pizza", "Maria");

    await user.click(
      screen.getByRole("button", { name: /Share with the table/ })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Link copied. Send it to the table!"
    );
    const link = await navigator.clipboard.readText();
    expect(link).toBe(window.location.href);
    expect(window.location.hash.length).toBeGreaterThan(1);

    // A friend opens the link.
    cleanup();
    render(() => <App />);

    expect(people()).toEqual(["Maria", "Nikos"]);
    expect(billItems()).toHaveLength(2);
    expect(chip("Pizza", "Maria")).toHaveAttribute("aria-pressed", "true");
    expect(billItem("Wine")).toHaveTextContent("Not assigned yet");
    expect(owed("Maria")).toBe("12.00");
    expect(billTotal()).toBe("€26.00");
  });

  it("restores names and items with non-English characters", async () => {
    const state = {
      eaters: ["Μαρία", "Νίκος"],
      foodInfo: [{ food: "Χωριάτικη", price: 8, people: ["Μαρία", "Νίκος"] }],
    };
    const bytes = new TextEncoder().encode(JSON.stringify(state));
    window.location.hash = btoa(String.fromCharCode(...bytes));
    render(() => <App />);

    expect(people()).toEqual(["Μαρία", "Νίκος"]);
    expect(billItem("Χωριάτικη")).toHaveTextContent("€4.00 each");
  });

  it("opens links made by the previous version of the app", () => {
    // Older links stored the price as a string and always had people assigned.
    window.location.hash = encodeState({
      eaters: ["Maria", "Nikos"],
      foodInfo: [{ food: "Pizza", price: "12", people: ["Maria", "Nikos"] }],
    });
    render(() => <App />);

    expect(billItem("Pizza")).toHaveTextContent("€6.00 each");
    expect(owed("Maria")).toBe("6.00");
    expect(billTotal()).toBe("€12.00");
  });

  it("shows an error for a corrupted link", async () => {
    window.location.hash = "%%%not-base64";
    render(() => <App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not read the shared link"
    );
    expect(people()).toEqual([]);
  });

  it("shows an error for a link with missing data", async () => {
    window.location.hash = encodeState({ eaters: ["Maria"] });
    render(() => <App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Shared link data is incomplete or invalid."
    );
    expect(people()).toEqual([]);
  });
});
