const crypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (app, db, secret) => {
  app.get('/user/:email', (req, res) => {
    db.user.findByPk(req.params.email).then(result =>
      res.json({
        firstname: result.firstname,
        lastname: result.lastname,
        email: result.email
      })
    );
  });

  app.post('/user/login', (req, res) => {
    db.user.findByPk(req.body.email).then(result => {
      crypt.compare(req.body.password, result.password, (err, success) => {
        if (success) {
          let expiration = Math.floor(Date.now() / 1000) + 3600;
          let token = jwt.sign(
            { userID: result.email, exp: expiration },
            secret
          );
          res.send(token);
        } else {
          res.sendStatus(400);
          console.error(err);
        }
      });
    });
  });

  app.post('/user', (req, res) => {
    crypt.hash(req.body.password, 10, (err, hash) => {
      if (err) res.sendStatus(500);
      db.user.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash
      });
      res.sendStatus(200);
    });
  });

  app.put('/user/:email', (req, res) => {
    db.user
      .update(req.body.update, { where: { email: req.params.email } })
      .then(
        result => {
          res.json({
            updated: result
          });
        },
        err => {
          res.sendStatus(500);
          console.error(err);
        }
      );
  });

  app.delete('/user/:email', (req, res) => {
    db.user
      .destroy({
        where: {
          email: req.params.email
        }
      })
      .then(
        result => {
          if (result === 1)
            res.json({
              deleted: result
            });
        },
        err => {
          console.error(err);
          res.sendStatus(500);
        }
      );
  });
};
