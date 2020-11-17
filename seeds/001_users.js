
exports.seed = function(knex) {
  // Inserts user
  return knex('users').insert([
        {id: 1, password: '123', email: 'mail@mail.com', tlf: "23456789", name: "Anders"},
      ]);
    
};
