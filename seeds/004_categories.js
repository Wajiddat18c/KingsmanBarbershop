
exports.seed = function(knex) {
      return knex('categories').insert([
        {id: 1, name: 'Hårvoks'},
        {id: 2, name: 'Skæg tilbehør'},
      ]);
};
