const { Model } = require('objection');
const User = require('./User');
const Booking = require('./Booking');

class UserBooking extends Model{
    static tableName = "user_booking"

    static relationMappings = {
        booking: {
            relation: Model.BelongsToOneRelation,
            modelClass : Booking,
            join: {
                from: "user_booking.booking_id",
                to: "booking.id"
            }
        },
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass : User,
            join: {
                from: "user_booking.user_id",
                to: "users.id"
            }
        }
    }
};

const knexfile = require('../knexfile');
const { BelongsToOneRelation } = require('./Booking');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
UserBooking.knex(knex);
module.exports = UserBooking;