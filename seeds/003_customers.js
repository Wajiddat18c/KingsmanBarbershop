
exports.seed = function(knex) {
    return knex('customer').insert([
      {id: 1, name: "Jerry", email: 'jerry@mail.dk', tlf: 12345678},
      {name: "Hans", email: 'hans@mail.dk', tlf: 87654321}
    ]);
};
