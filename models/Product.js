const { Model } = require('objection');

class Product extends Model{
    static tableName = "products";

};
const knexfile = require('../knexfile');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
Product.knex(knex);
module.exports = Product;