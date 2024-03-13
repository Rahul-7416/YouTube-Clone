// The function asyncHandler is a hihger order function which takes requestHandler as an argument
// and return the requestHandler asynchronously 
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        
        // This line wraps the invocation of the provided function requestHandler with Promise.resolve(), 
        // which ensures that the result of requestHandler(req, res, next) is converted to a promise. 
        // This is typically done to handle both synchronous and asynchronous functions uniformly.
        // As it becomes asynchronous in nature, now we can easily apply the chains of .then .catch etc
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err)); // This ensures that errors are properly propagated down the Express middleware chain.
    }
}


export { asyncHandler };



/*
// The function asyncHandler is a hihger order function which takes fn as an argument
// and return the fn asynchronously and wrapping it in try catch -> to handle the errors
function asyncHandler (fn) {
    return async function(req, res, next) {
        try {
            await fn(req, res, next);
        } catch (err) {
            res.status(err.code || 500).json({
                success: false,
                message: err.message
            })
        }
    }
}

This is the same code as above -> using arrow function
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

*/