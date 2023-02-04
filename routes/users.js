const express = require('express');
const { default: mongoose } = require('mongoose');
mongoose.set('strictQuery', false)
const plm = require('passport-local-mongoose')

mongoose.connect("mongodb://0.0.0.0:27017/mamazon").then(function () {
  console.log("connected to Mamazon")
})

const userSchema = mongoose.Schema({
  name: String,
  password: String,
  username: String,
  productid: [{
    type: mongoose.Types.ObjectId,
    ref: 'product'
  }],
  dp:String,
  contactnumber: Number,
  email: String,
  wishlist: {
    type: Array,
    default:[]
  },
  gstin: {
    type: String,
    default: '',
  },
  pan: {
    type: String,
    default: '',
  },
  isSeller: {
    type: Boolean,
    default:false,
  } ,
  address: {
    type: String,
    default: '',
  },
})



userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema)