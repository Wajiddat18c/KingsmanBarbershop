
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del().
  then(() => {
    return knex('services').del().then(() => {
      return knex('customer').del().then(() => {
        return knex('booking').del();
      })
    });
  });
};
