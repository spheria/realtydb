var bookshelf = require('../config/bookshelf');

var Developer = bookshelf.Model.extend({
  tableName: 'developer',
  hasTimestamps: true,

  // initialize: function() {
  //   this.on('saving', this.hashPassword, this);
  // },
});

module.exports = Developer;
