import { Schema, SchemaTypes } from "mongoose";
import mongoose from "mongoose";

const urlSchema = new Schema({
    urlCode: SchemaTypes.String,
    redirectURL: SchemaTypes.String
})

export default mongoose.model("url", urlSchema, "urls");