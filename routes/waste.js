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
  

