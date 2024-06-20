import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const logSchema = new Schema({
    Log_ID: { type: Schema.Types.ObjectId, required: true },
    Content: { type: String, required: true },
    Date: { type: Date, default: Date.now }
});

export default model('Log', logSchema);