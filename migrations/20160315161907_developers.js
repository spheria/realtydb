exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('developers', function(table) {
      table.increments();
      table.string('name');
      table.string('developer');
      table.string('contact_person');
      table.string('contact_number');
      table.string('service_availability');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('developers')
  ])
};
