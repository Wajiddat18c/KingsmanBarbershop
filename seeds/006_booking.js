
exports.seed = function(knex) {
      return knex('booking').insert([
        {id: 1, service_id: 1, customer_id: 1, start_time: "2020/11/30 11:15"}
      ]);
};
