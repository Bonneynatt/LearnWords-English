
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password, university, address } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, university, address });
        res.status(201).json({ 
            success: true,
            token: generateToken(user.id),
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                university: user.university, 
                address: user.address 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ 
                success: true,
                token: generateToken(user.id),
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    university: user.university, 
                    address: user.address 
                } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = { registerUser, loginUser };
