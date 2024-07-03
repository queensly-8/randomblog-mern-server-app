const User = require("../models/User.js");
const bcrypt = require('bcrypt');
const auth = require("../auth.js")

const { errorHandler , createAccessToken} = auth;

module.exports.registerUser = (req, res) => {
    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({message: "Invalid email format"});
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({message: "Mobile number is invalid"});
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({message: "Password must be atleast 8 characters long"});

    // If all needed requirements are achieved
    } 
    // Checks if firstName and lastName are strings
    else if(typeof req.body.firstName !== 'string' || typeof req.body.lastName !== 'string'){
        return res.status(400).send(false);     
    }
    else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        newUser.save()
        .then((result) => res.status(201).send({message: "User registered successfully"}))
        .catch(error => errorHandler(error, req, res));
    } 
};
module.exports.getProfile = (req, res) => {
    // Validate if user ID is provided
    if (!req.user || !req.user.id) {
        return res.status(400).send('Invalid user ID');
    }

    return User.findById(req.user.id)
        .then(user => {
            if (!user) {
                // Send status 404 if user not found
                return res.status(404).send('User not found');
            }

            // Clear password before sending user object
            user.password = undefined;
            return res.status(200).send(user);
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.loginUser = (req, res) => {
    console.log('Login attempt:', req.body); // Log the request body

    if (!req.body.email.includes("@")) {
        console.log('Invalid email format');
        return res.status(400).json({ message: 'Invalid email format' });
    }

    User.findOne({ email: req.body.email })
        .then(result => {
            if (result == null) {
                console.log('No email found');
                return res.status(404).json({ message: 'No email found' });
            } else {
                console.log('User found:', result); // Log the found user
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if (isPasswordCorrect) {
                    console.log('Password is correct');
                    try {
                        const token = auth.createAccessToken(result);
                        console.log('Token created:', token); // Log the created token
                        return res.status(201).json({
                            message: 'User logged in successfully',
                            access: token
                        });
                    } catch (tokenError) {
                        console.error('Error creating token:', tokenError);
                        return res.status(500).json({ message: 'Error creating token', error: tokenError });
                    }
                } else {
                    console.log('Incorrect email or password');
                    return res.status(401).json({ message: 'Incorrect email or password' });
                }
            }
        })
        .catch(err => {
            console.error('Error during user login:', err);
            return res.status(500).json({ message: 'Internal server error', error: err });
        });
};

module.exports.getProfile = (req, res) => {
    // Validate if user ID is provided
    if (!req.user || !req.user.id) {
        return res.status(400).send('Invalid user ID');
    }

    return User.findById(req.user.id)
        .then(user => {
            if (!user) {
                // Send status 404 if user not found
                return res.status(404).send('User not found');
            }

            // Clear password before sending user object
            user.password = undefined;
            return res.status(200).send(user);
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.registerAdmin = (req, res) => {
    const { firstName, lastName, email, mobileNo, password } = req.body;
    const isAdmin = true;

    // Validate input
    if (!firstName || !lastName || !email || !mobileNo || !password) {
        return res.status(400).send({ message: "All fields are required" });
    }

    // Hash the password
    let hashedPassword;
    try {
        hashedPassword = bcrypt.hashSync(password, 10);
    } catch (error) {
        return res.status(500).send({ message: "Error hashing password", error });
    }

    // Create a new admin user
    let newAdmin = new User({
        firstName,
        lastName,
        email,
        mobileNo,
        isAdmin,
        password: hashedPassword
    });

    // Save the new admin user
    newAdmin.save()
        .then(result => {
            return res.status(201).send({ message: "New admin registered", admin: result });
        })
        .catch(err => {
            return res.status(500).send({ message: "Error registering admin", error: err });
        });
};


