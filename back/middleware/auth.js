const { CognitoJwtVerifier } = require('aws-jwt-verify')

const verifier = CognitoJwtVerifier.create({
    userPoolId: 'eu-west-3_bgVqzu4n4',
    tokenUse: 'id',
    clientId: '3f83hd6046q3sv7ffn242u0icg',
})

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ error: 'Missing authorization token' })
    }

    const token = authHeader.slice('Bearer '.length)

    try {
        const payload = await verifier.verify(token)
        req.userId = payload.sub
        req.userEmail = payload.email
    } catch (err) {
        return res.status(401).send({ error: 'Invalid authorization token' })
    }

    next()
}

module.exports = requireAuth
