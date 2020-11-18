const { Model } = require('objection');
const Booking = require('./Booking');
const Service = require('./Service');

class BookingServices extends Model {
    static tableName = "booking_services"
    
    static relationMappings = {
        booking : {
            relation: Model.HasOneRelation,
            modelClass: Booking,
            join : {
                from: "booking_services.booking_id",
                to: "booking.id"
            }
        },
        service : {
            relation: Model.HasOneRelation,
            modelClass: Service,
            join : {
                from: "booking_services.service_id",
                to: "services.id"
            }
        }
    }
}

const knexfile = require('../knexfile');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
BookingServices.knex(knex);
module.exports = BookingServices;