module.exports.isLoggedIn = (req, res, next)=>{
    // console.log(req.user)
    if (!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You Must be logged In')
        return res.redirect('/auth/login');
    }
    else{
        next();
    }
}