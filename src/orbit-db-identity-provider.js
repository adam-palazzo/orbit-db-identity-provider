'use strict'
const IdentityProviderInterface = require('./identity-provider-interface')
const Keystore = require('orbit-db-keystore')
const type = 'orbitdb'

class OrbitDBIdentityProvider extends IdentityProviderInterface {
  constructor(options = {}) {
    super()
    this._keystore = options.keystore || Keystore.create(options.keypath || './orbitdb/identity/keys')
  }

  // Returns the type of the identity provider
  static get type () { return type }

  async getPublicKey(options = {}) {
    const id = options.id
    if (!id)
      throw new Error('id is required')

    const keystore = options.keystore || this._keystore
    const key = await keystore.getKey(id) || await keystore.createKey(id)
    return key.getPublic('hex')
  }

  async signPubKeySignature(pubKeyIdSig, options = {}) {
    const keystore = options.keystore || this._keystore
    const id = options.id
    const key = await keystore.getKey(id)
    if(!key)
      throw new Error(`Signing key for '${id}' not found`)
    return await keystore.sign(key, pubKeyIdSig)
  }

  static async verifyIdentity (identity, options = {}) {
    // Verify that identity was signed by the ID
    const keystore = options.keystore || options.provider._keystore
    const verified = await keystore.verify(
      identity.signatures.publicKey,
      identity.id,
      identity.publicKey + identity.signatures.id
    )
    return verified
  }
}

module.exports = OrbitDBIdentityProvider
