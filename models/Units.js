var bookshelf = require('../config/bookshelf');

var Unit = bookshelf.Model.extend({
  tableName: 'units',
  hasTimestamps: true,

  // initialize: function() {
  //   this.on('saving', this.hashPassword, this);
  // },
});

module.exports = Unit;
