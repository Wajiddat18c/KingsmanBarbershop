
exports.seed = function(knex) {
  // Inserts user
  return knex('users').insert([
        {id: 1, password: '$2b$12$dS85NNRlvVSOwnPv6HWPdu1L04/Y0H2EcmnJICuZmn4CYE15qA9Qu', email: 'test@live.dk', tlf: "12345678", name: "test"},
      ]);
    
};
