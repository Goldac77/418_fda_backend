import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const assetStatusSchema = new Schema({
    Status_ID: { type: String, required: true },
    Status_Name: { type: String, required: true }
});

export default model('AssetStatus', assetStatusSchema);