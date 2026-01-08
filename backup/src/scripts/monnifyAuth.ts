// utils/monnifyAuth.js
import axios from "axios";
// import { Buffer } from "buffer"
// import { Buffer } from "buffer";

export const getMonnifyToken = async () => {
    // Buffer.from()
  const auth = btoa(`${import.meta.env.VITE_MONNIFY_API_KEY}:${import.meta.env.VITE_MONNIFY_SECRET_KEY}`)
//   Buffer.from(
//     `${import.meta.env.VITE_MONNIFY_API_KEY}:${import.meta.env.VITE_MONNIFY_SECRET_KEY}`
//   ).toString("base64");

  const res = await axios.post(
    "https://sandbox.monnify.com/api/v1/auth/login",
    {},
    { headers: { Authorization: `Basic ${auth}` } }
  );

  console.log('res', res)

  return res.data.responseBody.accessToken;
};