
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('services').insert([
    {name: 'Service1', price: 100, description: "Service 1", duration: 30},
  ]);
};
