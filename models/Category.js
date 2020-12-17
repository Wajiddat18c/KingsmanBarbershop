const { Model } = require("objection");

class Category extends Model {
    static tableName = "categories";
}

const knexfile = require('../knexfile');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
Category.knex(knex);
module.exports = Category;