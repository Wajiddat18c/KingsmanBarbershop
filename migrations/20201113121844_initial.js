
exports.up = function(knex) {
  return knex.schema
  .createTable("users", (table) => {
      table.increments("id");
  })
};

exports.down = function(knex) {
  
};
