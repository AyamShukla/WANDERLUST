const mongoose = require('mongoose');
const Listing = require('./models/listing');
const User = require('./models/user');
 
mongoose.connect('mongodb://127.0.0.1:27017/wanderlust').then(async () => {
    // Assign all ownerless listings to first user
    const user = await User.findOne({});
    await Listing.updateMany({ owner: null }, { owner: user._id });
    console.log('All listings assigned to:', user.username);
 
    // Make that user admin
    await User.findByIdAndUpdate(user._id, { isAdmin: true });
    console.log(user.username, 'is now admin');
 
    mongoose.disconnect();
});
 