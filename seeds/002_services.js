
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('services').insert([
    {id: 1, name: 'Herre klipning', price: 200, description: "Klipning af kort hår", duration: 60},
    {id: 2,name: 'Barbering', price: 150, description: "Barbering, i hvilkensomhelst stil", duration: 30},
  ]);
};
