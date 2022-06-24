const jws = require('jws');

exports.getSignature = (algorithm, payload, privateKey) => {
  return jws.sign({
    header: { alg: algorithm },
    payload,
    privateKey,
  });
};

exports.verifySignature = (signature, algorithm, publicKey) => {
  return jws.verify(signature, algorithm, publicKey);
};
