const asyncHandler = (requestHandler)=> {
  (req,res,next)=> {
    Promise.resolve(requestHandler(req,res,next)).catch((err)=> next(err));
  }
} 

export {asyncHandler}

/*
TRY-CATCH SYNTAX

const asyncHandler = (func)=>async(req,res,next)=> {
  try {
    await func(req,res,next)
  } catch(err) {
    res.status(err.code || 500).json({
      message: err.message,
      success: false
    }) 
  }
  }
*/