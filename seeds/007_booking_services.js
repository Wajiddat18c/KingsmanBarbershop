
exports.seed = function(knex) {
  // Deletes ALL existing entries
      return knex('booking_services').insert([
        {booking_id: 1, service_id: 1},
        {booking_id: 1, service_id: 2}
      ]);
};
