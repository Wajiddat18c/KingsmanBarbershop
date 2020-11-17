const { Model } = require('objection');

class Customer extends Model{
    static tableName = "customer";

};
const knexfile = require('../knexfile');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
Customer.knex(knex);
module.exports = Customer;