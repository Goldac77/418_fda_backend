import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
    User_ID: { type: Schema.Types.ObjectId, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Role_ID: { type: Schema.Types.ObjectId, ref: 'Role', required: true }
});

export default model('User', userSchema);