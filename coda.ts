import {codaSdkDef, initCodaSDK} from '@opensdks/sdk-coda'
import {openIntProxyLink} from './openintProxyLink.js'

export const coda = initCodaSDK({
  headers: {authorization: `Bearer ${process.env.CODA_API_KEY}`},
  // links(defaultLinks) {
  //   return [
  //     openIntProxyLink({
  //       apiKey: process.env.OPENINT_API_KEY!,
  //       resourceId: process.env.OPENINT_CODA_RESOURCE_ID!,
  //       baseUrl: codaSdkDef.oasMeta.servers[0].url,
  //     }),
  //     ...defaultLinks,
  //   ]
  // },
})

// const docs = await coda.GET('/docs').then((r) => r.data)
// await coda.GET('/docs/{docId}/tables', {
//   params: {path: {docId: '0slx_kawnH'}},
// })
// console.log(docs)

// await coda.POST('/docs/{docId}/tables/{tableIdOrName}/rows', {
//   params: {path: {docId: '0slx_kawnH', tableIdOrName: 'grid-WVJN6_7yXG'}},
//   body: {
//     rows: [
//       {
//         cells: [
//           {
//             column: 'c-uMFar9-1Jr',
//             value: '$12.34',
//           },
//         ],
//       },
//     ],
//   },
// })
// grid-WVJN6_7yXG

await coda.POST('/docs/{docId}/pages', {
  params: {path: {docId: '0slx_kawnH'}},
  body: {
    name: 'Launch Status',
    subtitle: 'See the status of launch-related tasks.',
    iconName: 'rocket',
    imageUrl: 'https://example.com/image.jpg',
    pageContent: {
      type: 'canvas',
      canvasContent: {
        format: 'html',
        content: '<p><b>This</b> is rich text</p>',
      },
    },
  },
})
// console.log(docs)
