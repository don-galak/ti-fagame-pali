const P = 'Panagiotis';
const A = 'Aspa';
const M = 'Marios';
const D = 'Dimitris';

const foodMap = {
  TARTUFFO: { price: 14, people: [P, A, M, D] },
  GRECA: { price: 13, people: [P, M, D] },
  BOLOGNA: { price: 16, people: [P, A, M, D] },
  TAGLIATELLE: { price: 34, people: [M, D] },
  NIOCCHI: { price: 16, people: [P, A] },
  PANNACOTA: { price: 8, people: [A, M] },
  TIRAMISOU_DIMITRI_PANAGIOTI: { price: 18, people: [P, D] },
  TIRAMISOU_ASPA_MARIO: { price: 9, people: [P, M] },
  ACQUA_PANNA: { price: 3, people: [P, A, M, D] },
  SAN_PELEGRINO: { price: 14, people: [P, A, M, D] },
  PETRINES_PLAGIES: { price: 5.5, people: [A] },
};
const amountsToPay = {
  [P]: 0,
  [A]: 0,
  [M]: 0,
  [D]: 0,
};

for (const [food] of Object.entries(foodMap)) {
  const { price, people } = foodMap[food];
  const amountPerPerson = Number((price / people.length).toFixed(2));

  for (const person of people) {
    amountsToPay[person] += amountPerPerson;
  }
}
console.table(amountsToPay);
