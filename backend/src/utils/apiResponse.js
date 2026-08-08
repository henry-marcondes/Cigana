function success(res, data = null, message = null, status = 200) {
    const response = {success: true };
    
    if (message) { response.message = message;}
    
    if (data !== null) { response.data = data;}

    return res.status(status).json(response);
}

function error(res, message, status = 400, details = null) {
    const response = {success: false, message };

    if (details) { response.details = details;}

    return res.status(status).json(response);
}

module.exports = {
    success,
    error
};
