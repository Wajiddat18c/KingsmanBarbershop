
exports.up = function(knex) {
  return knex.schema
  .createTable("users", (table) => {
      table.increments("id");
      table.string("password").notNullable();
      table.string("email").unique().notNullable();
      table.integer("tlf").notNullable();
      table.string("name").notNullable();
      table.string("resetToken").unique().defaultTo(knex.raw("NULL"));
  })
  .createTable("newsletter", (table) => {
    table.increments("id");
    table.string("email").unique().notNullable();
  })
  
  .createTable("categories", (table) => {
    table.increments("id");
    table.string("name").unique().notNullable();
  })
  
  .createTable("images", (table) => {
    table.increments("id");
    table.string("name").notNullable();
    table.string("path").notNullable();

  })
  .createTable("shop", (table) => {
    table.increments("id");
    table.string("address").notNullable();
    table.string("open_hours").notNullable();
    table.integer("tlf").notNullable();
    table.string("email").notNullable();
    table.string("description").notNullable();
    table.string("name").notNullable();
  })
  .createTable("services", (table) => {
    table.increments("id");
    table.integer("price").notNullable();
    table.string("name").notNullable();
    table.string("description").notNullable();
    table.integer("duration").notNullable();
    table.boolean("available").notNullable().defaultsTo(true);
  })
  .createTable("customer", (table)=>{
    table.increments("id");
    table.string("name").notNullable();
    table.string("email").notNullable();
    table.integer("tlf").notNullable();
  })
  //tables with relations
   .createTable("products", (table) =>{
     table.increments("id");
     table.string("name").notNullable();
     table.string("description").notNullable();
     table.integer("price").notNullable();
     table.integer("cat_id").unsigned().notNullable();
     table.foreign("cat_id").references("categories.id");
     table.string("img").notNullable().defaultTo(" ");
   })
   .createTable("product_img", (table) => {
     table.increments("id");
     table.integer("prod_id").unsigned().notNullable();
     table.foreign("prod_id").references("products.id");
     table.integer("img_id").unsigned().notNullable();
     table.foreign("img_id").references("images.id");
   })
   .createTable("booking", (table) => {
     table.increments("id");
     table.integer("service_id").unsigned().notNullable();
     table.foreign("service_id").references("services.id");
     table.integer("customer_id").unsigned().notNullable();
     table.foreign("customer_id").references("customer.id");
     table.timestamp("start_time");
   })
   .createTable("user_booking", (table) => {
     table.increments("id");
     table.integer("booking_id").unsigned().notNullable();
     table.foreign("booking_id").references("booking.id");
     table.integer("user_id").unsigned().notNullable();
     table.foreign("user_id").references("users.id");
   })
   .createTable("booking_services", (table) => {
     table.increments("id");
     table.integer("booking_id").unsigned().notNullable();
     table.foreign("booking_id").references("booking.id");
     table.integer("service_id").unsigned().notNullable();
     table.foreign("service_id").references("services.id");
   })
   .createTable("booking_products", (table) => {
    table.increments("id");
    table.integer("booking_id").unsigned().notNullable();
    table.foreign("booking_id").references("booking.id");
    table.integer("product_id").unsigned().notNullable();
    table.foreign("product_id").references("products.id");
    table.integer("amount").notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema
  .dropTableIfExists("booking_services")
  .dropTableIfExists("booking_products")
  .dropTableIfExists("newsletter")
  .dropTableIfExists("shop")
  
  
  .dropTableIfExists("product_img")
  .dropTableIfExists("products")
  .dropTableIfExists("categories")
  .dropTableIfExists("images")
  .dropTableIfExists("user_booking")
  .dropTableIfExists("users")
  .dropTableIfExists("booking")
  .dropTableIfExists("customer")
  .dropTableIfExists("services")
  
  
};
