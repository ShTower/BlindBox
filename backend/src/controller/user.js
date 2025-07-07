const User = require('../model/user');

class UserService{
    async register(username,password){
        const existingUser = await User.findOne({username});
        if (existingUser) {
            throw new Error('User already exists');
        }

        const newUser = new User({username, password});
        await newUser.save();
        return newUser;
    }

    async login(username, password) {

        const user = await User.findOne({ username});
        if (!user) {
            throw new Error('User not exists');
        }

        if(user.password !== password) {
            throw new Error('Password is incorrect');
        }

        return user;
        
    }
}

module.exports = new UserService();
