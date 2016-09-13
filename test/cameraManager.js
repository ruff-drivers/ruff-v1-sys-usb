/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var EventEmitter = require('events');
var util = require('util');

function Camera(devInfo) {
    this.path = devInfo;
}

function CameraManager() {
    EventEmitter.call(this);
    this.isAttached = false;
    this.isDetached = false;
    this._devices = {};
}
util.inherits(CameraManager, EventEmitter);

CameraManager.prototype.attach = function (callback) {
    this.isAttached = true;
    callback && callback();
};

CameraManager.prototype.detach = function (callback) {
    this.isDetached = true;
    callback && callback();
};

CameraManager.prototype.mountDevice = function (devPath) {
    var devInfo = this._checkDeviceAvaliable(devPath);
    if (devInfo !== null) {
        var camera = new Camera(devInfo);
        this._devices[devPath] = camera;
        this.emit('mount', camera);
    }
};

CameraManager.prototype.unmountDevice = function (devPath) {
    if (this._devices[devPath]) {
        var camera = this._devices[devPath];
        delete this._devices[devPath];
        this.emit('unmount', camera);
    }
};

CameraManager.prototype._checkDeviceAvaliable = function (devPath) {
    if (devPath === '/devices/usb/1-1') {
        return '/dev/video0';
    } else {
        return null;
    }
};

module.exports = CameraManager;
