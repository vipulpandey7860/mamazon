const express = require('express');
const { default: mongoose } = require('mongoose');
mongoose.set('strictQuery', false)
const plm = require('passport-local-mongoose')


const productSchema = mongoose.Schema({
  username :String,
  name: String,
  sellerid: {
    type: mongoose.Types.ObjectId,
    ref:'user'
  },
  pic:{
    type:Array,
    default:[]
  },
  price:Number,
  discount:{
    type:Number,
    default:0
  },
  desc:String,

})



productSchema.plugin(plm);
module.exports = mongoose.model('product', productSchema)