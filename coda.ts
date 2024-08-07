import {codaSdkDef, initCodaSDK} from '@opensdks/sdk-coda'
import {openIntProxyLink} from './openintProxyLink.js'

export const coda = initCodaSDK({
  // headers: {authorization: `Bearer ${process.env.CODA_API_KEY}`},
  links(defaultLinks) {
    return [
      openIntProxyLink({
        apiKey: process.env.OPENINT_API_KEY!,
        resourceId: process.env.OPENINT_CODA_RESOURCE_ID!,
        baseUrl: codaSdkDef.oasMeta.servers[0].url,
      }),
      ...defaultLinks,
    ]
  },
})

// const docs = await coda.GET('/docs').then((r) => r.data)

// console.log(docs)
