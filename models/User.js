const { Model } = require('objection');
const UserBooking = require('./UserBooking');
class User extends Model{
    static tableName = "users";
    static relationMappings = {
        userBooking: {
            relationMappings: Model.BelongsToOneRelation,
            modelClass: UserBooking,
            join: {
                from: "user_booking.user_id",
                to: "users.id"
            }
        }
    }
};
const knexfile = require('../knexfile');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
User.knex(knex);
module.exports = User;