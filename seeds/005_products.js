
exports.seed = function(knex) {
  
  return knex('products').insert([
    {id: 1, name: 'Id Hårvoks', price: 200, description: "Populær hårvoks", cat_id: 1},
    {name: 'Beard oil 300ml', price: 120, description: 'Essentielt til at vedligeholde ens skæg', cat_id:2},
  ]);
};
