"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(exports,"__esModule",{value:!0});var _winston=require("winston"),_winston2=_interopRequireDefault(_winston),logger=new _winston2.default.Logger({transports:[new _winston2.default.transports.Console({json:!0,colorize:!0})]});exports.default=logger,module.exports=exports.default;