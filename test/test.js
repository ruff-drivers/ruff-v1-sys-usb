/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var assert = require('assert');
var mock = require('ruff-mock');
var any = mock.any;
var when = mock.when;

var EventEmitter = require('events');
var fs = require('fs');
var path = require('path');

var CameraManager = require('./cameraManager');
var HotplugMessage = require('./hotplugMessage');
var SysUsb = require('../');

require('t');

var cameraMountMessage = {
    action: 'mount',
    devPath: '/devices/usb/1-1'
};

var unknownMountMessage = {
    action: 'mount',
    devPath: '/devices/usb/1-2'
};

var cameraUnmountMessage = {
    action: 'unmount',
    devPath: '/devices/usb/1-1'
};

var unknowUnmountMessage = {
    action: 'unmount',
    devPath: '/devices/usb/1-2'
};

describe('Driver for sys-usb', function () {
    var sysUsb;

    var cameraManager;
    var hotplugMessage;

    beforeEach(function () {
        hotplugMessage = new HotplugMessage();
        cameraManager = new CameraManager();
        sysUsb = new SysUsb({}, {
            message: hotplugMessage,
            usbBusPath: path.join(__dirname, 'devices/link')
        });
    });

    it('should invoke callback when `install` method get one manager', function (done) {
        sysUsb.install(cameraManager, function (error) {
            assert(cameraManager.isAttached);
            done(error);
        });
    });

    it('should invoke callback when `install` method get two managers', function (done) {
        sysUsb.install(cameraManager, cameraManager, function (error) {
            assert(cameraManager.isAttached);
            done(error);
        });
    });

    it('should invoke device attach when `install` method is invoked', function (done) {
        sysUsb.install(cameraManager, function (error) {
            assert(cameraManager.isAttached);
            done(error);
        });
    });

    it('should create a target device while a specified device is mounted', function (done) {
        sysUsb.install(cameraManager);

        cameraManager.on('mount', function (device) {
            assert(device);
            done();
        });

        hotplugMessage.send(cameraMountMessage);
    });

    it('should not receive any event while a unknown device is mounted', function (done) {
        sysUsb.install(cameraManager);

        cameraManager.on('mount', function () {
            done(new Error('should not receivce mount event'));
        });

        hotplugMessage.send(unknownMountMessage);
        setTimeout(done, 100);
    });

    it('should unmount target device when a specified device is unmounted', function (done) {
        sysUsb.install(cameraManager);

        cameraManager.on('unmount', function (camera) {
            assert(camera);
            done();
        });

        hotplugMessage.send(cameraMountMessage, function (error) {
            if (error) {
                done(error);
                return;
            }
            hotplugMessage.send(cameraUnmountMessage);
        });
    });

    it('should not receive any event while a unknown device is unmounted', function (done) {
        sysUsb.install(cameraManager);

        cameraManager.on('unmount', function () {
            done(new Error('should not receivce unmount event'));
        });

        hotplugMessage.send(unknowUnmountMessage);
        setTimeout(done, 100);
    });

    it('should invoke device detach when sysUsb detach is invoked', function (done) {
        sysUsb.install(cameraManager);

        sysUsb.detach(function () {
            assert(cameraManager.isDetached);
            done();
        });
    });

    it('should create target devices which are already plugged when sysUsb install is invoked', function (done) {
        var usbBusPath = path.join(__dirname, 'devices/link');
        var deviceManager = mock(new EventEmitter(), true);
        var actualDeviceNum = 0;
        var devicesPath = fs.readdirSync(usbBusPath);
        var ecpectedDeviceNum = devicesPath.length;
        when(deviceManager).attach(any).then(function (callback) {
            callback && callback();
        });

        devicesPath.forEach(function (devPath) {
            var destPath = path.join(usbBusPath, fs.readlinkSync(path.join(usbBusPath, devPath)));
            when(deviceManager).mountDevice(destPath).then(function () {
                deviceManager.emit('mount');
            });
        });

        deviceManager.on('mount', function () {
            actualDeviceNum++;
        });

        sysUsb.install(deviceManager);
        setTimeout(function () {
            assert.equal(actualDeviceNum, ecpectedDeviceNum);
            done();
        }, 100);
    });
});
