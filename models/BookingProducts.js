const { Model } = require('objection');
const Booking = require('./Booking');
const Product = require('./Product');

class BookingProducts extends Model {
    static tableName = "booking_products"
    
    static relationMappings = {
        booking : {
            relation: Model.HasOneRelation,
            modelClass: Booking,
            join : {
                from: "booking_products.booking_id",
                to: "booking.id"
            }
        },
        service : {
            relation: Model.HasOneRelation,
            modelClass: Product,
            join : {
                from: "booking_products.product_id",
                to: "products.id"
            }
        }
    }
}

const knexfile = require('../knexfile');
const knex = require('knex')({
    client : knexfile.development.client,
    connection : knexfile.development.connection
});
BookingProducts.knex(knex);
module.exports = BookingProducts;