const { Model } = require('objection');

class Service extends Model{
    static tableName = "services";

};
const knexfile = require('../knexfile');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
Service.knex(knex);
module.exports = Service;