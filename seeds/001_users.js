
exports.seed = function(knex) {
  // Inserts user
  return knex('users').insert([
        //password = password
        {id: 1, password: '$2b$12$MhbcdBGpqlCXOetfPSJG2uGlCbqBB.DASnmZ8TjglGFchn9Ef.Ay6', email: 'user@fake.dk', tlf: "12345678", name: "user"},
        
      ]);
    
};
