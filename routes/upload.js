'use strict';
const ControllerUpload = require('../upload_app/controllers/ControllerUpload');
const uploadMulter = require('../upload_app/models/ModelMulter')
module.exports = function(app) {
    app.route('/uploadSingle').post(uploadMulter.single('name'), ControllerUpload.uploadSingleFile);
    app.route('/uploadMultiple').post(uploadMulter.any(), ControllerUpload.uploadMultipleFiles);
}
