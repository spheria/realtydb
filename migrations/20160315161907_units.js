exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('units', function(table) {
      table.increments();
      table.string('name');
      table.string('model');
      table.string('developer');
      table.integer('pagibig_dp_terms');
      table.integer('pagibig_dp_percent');
      table.integer('bank_dp_terms');
      table.integer('bank_dp_percent');
      table.string('bank_affiliate');
      table.string('property_type');
      table.string('floor_area');
      table.string('google_map_link');
      table.integer('bedroom_count');
      table.integer('bathroom_count');
      table.dateTime('date_of_release');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('units')
  ])
};
