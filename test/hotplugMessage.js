/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var EventEmitter = require('events');
var util = require('util');

function HotplugMessage() {
    EventEmitter.call(this);
}
util.inherits(HotplugMessage, EventEmitter);

HotplugMessage.prototype.send = function (event, callback) {
    this.emit('uevent', event);
    callback && callback();
};

HotplugMessage.prototype.start = function (callback) {
    callback && callback();
};

HotplugMessage.prototype.stop = function (callback) {
    callback && callback();
};

module.exports = HotplugMessage;
