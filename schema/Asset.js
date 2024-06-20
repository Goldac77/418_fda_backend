import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const assetSchema = new Schema({
    Asset_ID: { type: Schema.Types.ObjectId, required: true },
    Tag_ID: { type: String, unique: true, required: true },
    Serial_Number: { type: String, unique: true, required: true },
    Asset_Name: { type: String, required: true },
    Procurement_Date: { type: Date, required: true },
    Status_ID: { type: Schema.Types.ObjectId, ref: 'AssetStatus', required: true }
});

export default model('Asset', assetSchema);