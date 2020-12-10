const { Model } = require('objection');
const UserBooking = require('./UserBooking');
const Service = require('./Service');
const Customer = require('./Customer');

class Booking extends Model{
    static tableName = "booking";
    static relationMappings = {
        userBooking: {
            relation: Model.HasOneRelation,
            modelClass: UserBooking,
            join: {
                from: "user_booking.booking_id",
                to: "booking.id"
            }
        },
        service: {
            relation: Model.HasOneRelation,
            modelClass: Service,
            join: {
                from: "booking.service_id",
                to: "services.id"
            }
        },
        customer: {
            relation: Model.HasOneRelation,
            modelClass: Customer,
            join: {
                from: "booking.customer_id",
                to: "customer.id"
            }
        }
    }
};

const knexfile = require('../knexfile');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
Booking.knex(knex);
module.exports = Booking;