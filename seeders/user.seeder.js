var Seeder = require('mongoose-data-seed').Seeder;
var User = require('../server/models/user.model');

var data = [
  {
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'admin@admin.com',
    password: 'admin@123',
    emailVerified: true,
    phone: '0123456789',
  },
];

var UserSeeder = Seeder.extend({
  shouldRun: () => {
    return User.count()
      .exec()
      .then((count) => count === 0);
  },
  run: () => {
    return User.create(data);
  },
});

module.exports = UserSeeder;
