const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middleware/validate');
const authorize = require('../middleware/basic-auth')
const userService = require('./user-service');
const statsdClient = require('../utils/statsdUtil.js');
// routes
router.post('/user', registerUser, register);
router.get('/user/:userId', authorize, getById);
router.put('/user/:userId', authorize, updateUser, update);
router.put('/user/', authorize, updateUserNull);
router.post('/user/:userId', registerUserNull);
router.get('/user/', authorize, getByIdNull);

function updateUserNull(req,res){
    res.status(400).send("No user ID entered");
}

function registerUserNull(req,res){
    res.status(400).send("Bad request");
}

function getByIdNull(req,res){
    res.status(400).send("No user ID entered");
}

module.exports = router;
//To validate our req.body 
function registerUser(req, res, next) {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().min(6).required()
    });
    validateRequest(req, res, next, schema);
    next();
}

function register(req, res, next) {
    statsdClient.increment('post_/user');
    userService.create(req.body,req,res)
        .then(user => res.status(201).json(user))
        .catch(next);
}

function getById(req, res, next) {
    statsdClient.increment('get_/user');
    userService.getById(req.params.userId, req, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function updateUser(req, res, next) {
    const schema = Joi.object({
        first_name: Joi.string().empty(''),
        last_name: Joi.string().empty(''),
        username: Joi.string().empty(''),
        password: Joi.string().min(6).empty('')
    });
    validateRequest(req, res, next, schema);
    next();
}

function update(req, res, next) {
    statsdClient.increment('put_/user');
    userService.update(req.params.userId, req, req.body, res)
        .then(user => res.status(204).json(user))
        .catch(next);
}