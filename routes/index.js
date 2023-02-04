var express = require('express');
var router = express.Router();
const passport = require('passport')
const userModel = require('../routes/users');
const productModel = require('../routes/product');

const multer = require('multer')
const config = require('../config/config')

const userImageStorage = multer({ storage: config.userImageStorage })
const productImageStorage = multer({ storage: config.productImageStorage })

const localStrategy = require('passport-local');
const { request } = require('express');
passport.use(new localStrategy(userModel.authenticate()));



/* GET home page. */
router.get('/', isRedirected, function (req, res, next) {
  res.render('index');
});

router.post('/loggedin', function (req, res, next) {
  res.send('logged in')
});


router.post("/register", function (req, res, next) {

  const newuser = new userModel({
    name: req.body.name,
    username: req.body.username,
    contactnumber: req.body.contactnumber,
    email: req.body.email,
    isSeller: req.body.isSeller,
  })

  userModel.register(newuser, req.body.password).then(function () {
    passport.authenticate('local')(req, res, function () {
      res.redirect('/profile')
    })
  })
})

router.get('/profile', isLoggedin, async function (req, res, next) {
  let user = await userModel.findOne({ username: req.session.passport.user }).populate('productid')

  let verified = true;

  let ans = user.toJSON();


  let ignore = ['productid', 'wishlist'];

  for (let val in ans) {
    if (ignore.indexOf(val) === -1 && ans[val].length === 0) {
      verified = false;
    }
  }


  res.render('profile', { user, verified })
});


router.post("/login", passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/'
}), function (req, res) {

})




function isLoggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/')
  }
}

function isRedirected(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/profile')
  }
  else {
    return next();
  }
}

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})


router.get("/verify", isLoggedin, function (req, res, next) {

  userModel.findOne({ username: req.session.passport.user }).then(function (users) {
    res.render("verify", { user: users })
  })

})

router.post('/verified', isLoggedin, function (req, res, next) {
  let data = {
    name: req.body.name,
    username: req.body.username,
    contactnumber: req.body.contactnumber,
    email: req.body.email,
    isSeller: req.body.isSeller,
    pan: req.body.pan,
    gstin: req.body.gstin,
    address: req.body.address,

  }

  userModel.findOneAndUpdate({ username: req.session.passport.user }, data)
    .then(function (user) {
      res.redirect('/profile')
    })
})

router.post('/upload', isLoggedin, userImageStorage.single('image'), function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      user.dp = req.body.dp;
      user.save()
        .then(function (updateduser) {
          res.send(updateduser + "dp updated")
        })

    })

})

router.post("/create/product", isLoggedin, productImageStorage.array('pic', 3), async function (req, res, next) {

  let userData = await userModel.findOne({ username: req.session.passport.user });

  if (userData.isSeller) {
    let data = {
      sellerid: userData._id,
      name: req.body.name,
      pic: req.files.map(elem => elem.filename),
      price: req.body.price,
      desc: req.body.desc,
    };
    let productdata = await productModel.create(data);
    userData.productid.push(productdata._id);
    await userData.save();
  }

  else {
    res.send("you are not seller at mamazon")
  }
  res.redirect('back')

})

router.get('/mart', isLoggedin, async function (req, res, next) {
  // let user = await userModel.findOne({ username: req.session.passport.user }).populate("productid")
  let product = await productModel.find().populate('sellerid').limit(4);

  let user = await userModel.findOne({ username: req.session.passport.user })

  res.render("mart", { product, user })
})



router.get('/products', isLoggedin, async function (req, res, next) {
  let user = await userModel.findOne({ username: req.session.passport.user })

  let products = await productModel.find();

  res.render("products", { products, user })
})

router.get('/wishlist/products', isLoggedin, async function (req, res, next) {
  let user = await userModel.findOne({ username: req.session.passport.user }).populate('productid')

  let product = await productModel.find().populate('sellerid');


  res.render("wishlist", { product, user })
})

router.get('/wishlist/product/:id', isLoggedin, async function (req, res) {

  let user = await userModel.findOne({ username: req.session.passport.user }).populate("productid")
  var product = await productModel.findOne({ _id: req.params.id }).populate("sellerid");

  if (user.wishlist.indexOf(product._id) === -1) {
    user.wishlist.push(product._id);
  } else {
    user.wishlist.splice(user.wishlist.indexOf(product._id), 1);
  }
  await user.save()

  res.redirect('back')
});


router.get('edit/product/:id', isLoggedin, async function (req, res, next) {
  let product = await productModel.findOne({ _id: req.params.id });

  res.send("edit page")
})


router.post('/edit/product/:id', isLoggedin, async function (req, res) {

  let product = await productModel.findOneAndUpdate({ _id: req.params.id });
  //................
})


router.get('/delete/product/:id', isLoggedin, async function (req, res, next) {
  var user = await userModel.findOne({ username: req.session.passport.user });
  var product = await productModel.findOneAndDelete({ _id: req.params.id }).populate("sellerid");

  if (user.username === product.sellerid.username) {
    let productDelete = await productModel.findOneAndDelete({ _id: req.params.id });
    user.product.splice(user.productid.indexOf(user._id), 1);
    await user.save();
    res.redirect("back");
  }

  else {
    res.send("you cannot delete someone else product")
  }


})





module.exports = router;

