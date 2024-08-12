router.get("/about", (req, res) => {
  res.render("user/about");
});

router.get("/blog", (req, res) => {
  res.render("user/blog");
});

router.get("/cart", (req, res) => {
  res.render("user/cart");
});

router.get("/checkout", (req, res) => {
  res.render("user/checkout");
});

router.get("/login", (req, res) => {
  res.render("user/login");
});

router.get("/myaccount", (req, res) => {
  res.render("user/myaccount");
});

router.get("/productView", (req, res) => {
  res.render("user/productView");
});

router.get("/shop", (req, res) => {
  res.render("user/shop");
});

router.get("/wishlist", (req, res) => {
  res.render("user/wishlist");
});

router.get("/quickView", (req, res) => {
  res.render("user/quickView");
});

router.get("/awaste", (req, res) => {
  res.render("user/awaste");
});

// below from admin side pages 

router.get("/chart", (req, res) => {
  res.render("admin/chart");
});

router.get("/form", (req, res) => {
  res.render("admin/zform");
});
router.get("/table", (req, res) => {
  res.render("admin/ztable");
});
router.get("/element", (req, res) => {
  res.render("admin/zelement");
});
router.get("/button", (req, res) => {
  res.render("admin/zbutton");
});
  

// below utter waste

const Cart = require("../models/cartSchema");

module.exports = {
  addToCart: async (userId, guestId, product) => {
    const cart = await Cart.findOne({ userId: userId, guestId: guestId });
    if (cart) {
      const item = cart.items.find(item => item.productId.equals(product._id));
      if (item) {
        item.quantity += 1;
        item.total = item.price * item.quantity;
      } else {
        cart.items.push({
          productId: product._id,
          price: product.price,
          quantity: 1,
          total: product.price
        });
      }
      await cart.save();
    } else {
      await Cart.create({
        userId: userId,
        guestId: guestId,
        items: [
          {
            productId: product._id,
            price: product.price,
            quantity: 1,
            total: product.price
          }
        ]
      });
    }
    return await Cart.findOne({ userId: userId, guestId: guestId }).populate("items.productId").lean();
  },

  updateCartItem: async (userId, guestId, itemId, quantity) => {
    const cart = await Cart.findOne({ userId: userId, guestId: guestId });
    const item = cart.items.id(itemId);
    item.quantity = quantity;
    item.total = item.price * item.quantity;
    await cart.save();
    return await Cart.findOne({ userId: userId, guestId: guestId }).populate("items.productId").lean();
  },

  removeCartItem: async (userId, guestId, itemId) => {
    const cart = await Cart.findOne({ userId: userId, guestId: guestId });
    cart.items.id(itemId).remove();
    await cart.save();
    return await Cart.findOne({ userId: userId, guestId: guestId }).populate("items.productId").lean();
  },

  getCart: async (userId, guestId) => {
    return await Cart.findOne({ userId: userId, guestId: guestId }).populate("items.productId").lean();
  }
};

// controller

const cartHelper = require("../helpers/cart");
const productHelper = require("../helpers/product");

const addToCart = async (req, res) => {
  const productId = req.query.q;
  const userId = req.session.user ? req.session.user._id : null;
  const guestId = req.sessionID;

  try {
    const product = await productHelper.viewSingleProduct(productId);
    if (!product) {
      return res.redirect("/404notfound");
    }
    
    const cart = await cartHelper.addToCart(userId, guestId, product);
    res.render("user/cart", { cart });
  } catch (error) {
    console.log(error);
    res.redirect("/500error");
  }
};

const updateCart = async (req, res) => {
  const { itemId, quantity } = req.body;
  const userId = req.session.user ? req.session.user._id : null;
  const guestId = req.sessionID;

  try {
    const cart = await cartHelper.updateCartItem(userId, guestId, itemId, quantity);
    res.json({ cart });
  } catch (error) {
    console.log(error);
  }
};

const removeFromCart = async (req, res) => {
  const { itemId } = req.body;
  const userId = req.session.user ? req.session.user._id : null;
  const guestId = req.sessionID;

  try {
    const cart = await cartHelper.removeCartItem(userId, guestId, itemId);
    res.json({ cart });
  } catch (error) {
    console.log(error);
  }
};

const productView = async (req, res) => {
  const productId = req.query.q;
  const userId = req.session.user ? req.session.user._id : null;
  const guestId = req.sessionID;

  try {
    const product = await productHelper.viewSingleProduct(productId);
    if (!product) {
      return res.redirect("/404notfound");
    }

    // Check if the product is already in the cart
    const cart = await cartHelper.getCart(userId, guestId);
    const isInCart = cart && cart.items.some(item => item.productId.equals(product._id));

    res.render("user/productView", { product, isInCart });
  } catch (error) {
    console.log(error);
    res.redirect("/500error");
  }
};

module.exports = {
  addToCart,
  updateCart,
  removeFromCart,
  productView,
};
