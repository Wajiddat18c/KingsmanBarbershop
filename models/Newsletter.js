const { Model } = require('objection');

class Newsletter extends Model{
    static tableName = "newsletter";

};
const knexfile = require('../knexfile');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
Newsletter.knex(knex);
module.exports = Newsletter;