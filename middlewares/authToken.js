const jwt = require('jsonwebtoken');

module.exports = function authenticateToken(req, res, next) {

  if(req.headers.authorization !== undefined){

    const token = req.headers['authorization'];

    if(token === null){ 

      res.status(401);
      next();

    }else{

      let data;
      try{
        data = jwt.verify(token, process.env.TOKEN_SECRET );
      }catch(err){
        if(err){
          return res.status(401).json({message:'invalid/non-existent token',ok:false});
        }
        next();
      }
      req.name = data.name;
      next();
    }
  }else{

    if(req.body.userName !== undefined && req.body.password !== undefined){

      next();
    }else{

      res.status(400);
      next();
    }
  }
}