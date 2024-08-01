module.exports = (req,res,next)=>{
  res.locals.layout = 'adminLayout';
  // console.log(req.path.split('/'));
  const path = req.path.split('/')[1]; // Assuming the second part of the path is the page name eg:admin/chart ,ans=chart
  res.locals.activePage = path || "index";
  next()
}
