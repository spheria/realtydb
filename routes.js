var express = require('express');
var router = express.Router();

// Controllers
var userController = require('./controllers/user');
var contactController = require('./controllers/contact');
var unitsController = require('./controllers/units');



router.post('/contact', contactController.contactPost);
router.put('/account', userController.ensureAuthenticated, userController.accountPut);
router.delete('/account', userController.ensureAuthenticated, userController.accountDelete);
router.post('/signup', userController.signupPost);
router.post('/login', userController.loginPost);
router.post('/forgot', userController.forgotPost);
router.post('/reset/:token', userController.resetPost);
router.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);


router.post('/units', unitsController.createUnit);
router.put('/units/id', unitsController.updateUnit);
router.delete('/units/id', unitsController.deleteUnit);

module.exports = router;
