'use strict';
'use esversion:6';

require('dotenv').config();
const express = require('express');
const app = express();

const port = process.env.PORT || 8080;

const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USERNAME,
  process.env.PASSWORD,
  {
    host: process.env.HOSTNAME,
    dialect: 'postgres'
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection established successfully...');
  })
  .catch(err => {
    console.error(`Error encountered while connecting: ${err}`);
  });

const User = sequelize.define(
  'user',
  {
    firstname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

// here you can create relations like:
/**
 * User.associate = models => {
 *   User.hasMany(models.form);
 * };
 */

sequelize.sync().then(() => {
  const bodyParser = require('body-parser');

  // add the controllers here:
  const userRoute = require('./controllers/user');
  userRoute(app, sequelize, process.env.SECRET);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  const root = '/api';

  app.use(root, userRoute);

  app.listen(port, console.log(`\nListening on port: ${port}\n`));
});

module.exports = app;
