import { cleanup, render, screen, within } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
  const API = "https://api.test";

  // A fake share server: POST stores the bill, GET returns it.
  const useFakeApi = ({ down = false } = {}) => {
    const bills = new Map();
    let nextId = 0;
    const reply = (body, status) => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    });
    const fetchMock = vi.fn(async (url, options = {}) => {
      if (down) throw new TypeError("Failed to fetch");
      if (options.method === "POST" && url === `${API}/share`) {
        const id = `bill${String(nextId++).padStart(4, "0")}`;
        bills.set(id, JSON.parse(options.body));
        return reply({ id }, 201);
      }
      const id = url.match(/\/share\/([a-z0-9]{8})$/)?.[1];
      return bills.has(id) ? reply(bills.get(id), 200) : reply({}, 404);
    });
    vi.stubEnv("VITE_SHARE_API_URL", `${API}/`);
    vi.stubGlobal("fetch", fetchMock);
    return { fetchMock, bills };
  };

  const share = (user) =>
    user.click(screen.getByRole("button", { name: /Share with the table/ }));

  it("saves the bill and copies a short link", async () => {
    const { fetchMock, bills } = useFakeApi();
    const user = setup();
    await addPerson(user, "Maria");
    await addItem(user, "Pizza", 12);
    await share(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Link copied. Send it to the table!"
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${API}/share`,
      expect.objectContaining({ method: "POST" })
    );
    expect(bills.get("bill0000")).toEqual({
      eaters: ["Maria"],
      foodInfo: [{ food: "Pizza", price: 12, people: [] }],
    });
    expect(window.location.hash).toBe("#bill0000");
    expect(await navigator.clipboard.readText()).toBe(window.location.href);
  });

  it("opens the same bill for a friend who follows the link", async () => {
    useFakeApi();
    const user = setup();
    await addPerson(user, "Μαρία");
    await addPerson(user, "Nikos");
    await addItem(user, "Χωριάτικη", 12);
    await addItem(user, "Wine", 14);
    await toggle(user, "Χωριάτικη", "Μαρία");
    await share(user);
    await screen.findByRole("alert");

    // A friend opens the link.
    cleanup();
    render(() => <App />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading the bill");
    await screen.findByRole("list", { name: "Bill items" });

    expect(people()).toEqual(["Μαρία", "Nikos"]);
    expect(chip("Χωριάτικη", "Μαρία")).toHaveAttribute("aria-pressed", "true");
    expect(billItem("Wine")).toHaveTextContent("Not assigned yet");
    expect(owed("Μαρία")).toBe("12.00");
    expect(billTotal()).toBe("€26.00");
  });

  it("shows an error and changes nothing when the share server is down", async () => {
    useFakeApi({ down: true });
    const user = setup();
    await addPerson(user, "Maria");
    await share(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't create a link."
    );
    expect(window.location.hash).toBe("");
    expect(people()).toEqual(["Maria"]);
  });

  it("explains when a link has expired", async () => {
    useFakeApi();
    window.location.hash = "gone1234";
    render(() => <App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This link has expired or doesn't exist."
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(people()).toEqual([]);
  });

  it("explains when a bill can't be loaded", async () => {
    useFakeApi({ down: true });
    window.location.hash = "bill0000";
    render(() => <App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't load the shared bill"
    );
  });

  it("rejects links that aren't share links", async () => {
    const { fetchMock } = useFakeApi();
    window.location.hash = "eyJlYXRlcnMiOltdLCJmb29kSW5mbyI6W119";
    render(() => <App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This link isn't valid."
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
