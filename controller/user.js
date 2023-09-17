// Reference: https://www.cloudnweb.dev/2019/8/building-rest-api-using-node-express-and-sequelize

let User = require('../models').User;

module.exports = {
    async create(req, res) {
        try {
            const newUser = await User.create({
                username : req.body.username,
                passwordHash: req.body.password
            });
            console.log(newUser instanceof User); // true
            console.log(newUser.name);
            res.status(201).send(newUser);
        }
        catch(err){
            console.log(err);
            res.status(400).send(err);
        }
                    
    }



}