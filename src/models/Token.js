import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresIn: { type: Number, required: true }, // en segundos
  lastUpdated: { type: Date, default: Date.now }, // fecha de última actualización
});

const Token = mongoose.model("Token", tokenSchema);

export default Token;