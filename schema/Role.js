import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const roleSchema = new Schema({
    Role_ID: { type: Schema.Types.ObjectId, required: true },
    Role_Name: { type: String, required: true }
});

export default model('Role', roleSchema);