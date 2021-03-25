const Hapi = require('hapi')

let MetaApi = require('metaapi.cloud-sdk').default
const port = 3000

const token =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzM0NjA0MWNkMTU2NWFlZDRmODUwYzM1YzM5YzZmMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjE2NTk3ODgyLCJyZWFsVXNlcklkIjoiNTczNDYwNDFjZDE1NjVhZWQ0Zjg1MGMzNWMzOWM2ZjAifQ.fwBnpN8xVJEb-ARIGGqt9M46cqZ_RSMHIxQs7QWO8yPcmeFKsKvlkuErn-X3rB92u1QoIBpFEybR2ISkJjnlLxpO0A8tKNtqYQLH7dhbSsLBIZG9TmE0DHB4py-lhDFCc4EcFpmT0xXOAijpZCpC9KhoQ8sGhGQV26mUU5YuFGGgCjvAn4xLvtTSiHuV3i2KWU78zzA5eKix77cbxBSMDc6tzR-2c4Qh5WVONM8eoZAHHtUYfR0rnjaGGbmxB8Rz_gXjPqHNaJEhKVxA5qITIWG2dn0JkgOSu36fRu3cYQSpmmFvN-WOFCqtNNWN1i_hht313_aQnjzDosJ8tk5KyJYeX9Ne3MKjyloeH1mdFgEI9xbn88_sIMGkoPT5kqq1FwtnEQjjQNjdSein9RF-imk13ucUevqtLAHGAD0M05SxSBK8nDdUy1oIbLiUBUfRYgis80xaFbkqYR_lwRswPLU-XLhKngcOSqyh7P3GlrRckg-4aDJGtWRSkLWmEXzQK7z4Yspiruhrfvlgc3J0lClIPa6m-dRgCZSqiIlksDhtD2Ljb8YpxpNYTYpGxNSPXKsUuvoxSgqV0VBhE8MGfH3Uk2Jhbdi_DC7fcOovOgvc4gd6BXtH02LFSaAa4vFYLn8mzTMUwsG8-AnT3D9N5hM9oDGHYQubuZpmVm5btqM'
const api = new MetaApi(token)

// 创建一个服务监听8000端口
const server = Hapi.server({
  host: 'localhost',
  port: 3000,
  routes: {
    cors: {
      origin: ["*"],
    },
  },
})

// 添加路由
server.route({
  method: 'GET',
  path: '/get/profile/{version}/srv',
  handler: async function (request, h) {
    console.log(new Date(), request.params)
    const params = request.params
    let version = 0
    api.provisioningProfileApi.getProvisioningProfiles().then((profiles) => {
      const data = []
      profiles.forEach((profile) => {
        data.push(profile._data)
      })
      console.log(new Date())
      return {
        code: 0,
        msg: 'success',
        data,
      }
    })
    
  },
})

server.route({
  method: 'POST',
  path: '/upload/profile/{version}/srv',
  handler: async function (request, h) {
    const params = request.params
    const payload = request.payload
    console.log(new Date(), params, payload)

    const profiles = await api.provisioningProfileApi.getProvisioningProfiles()
    const data = []
    const brokerSrvName = request.brokerSrvName
    const brokerSrvBuffer = request.brokerSrvBuffer
    const brokerTimezone = request.brokerTimezone
    const brokerDSTSwitchTimezone = request.brokerDSTSwitchTimezone
    try {
      let profile = profiles.find((p) => p.name === serverName)
      if (!profile) {
        console.log('Creating account profile')
        profile = await api.provisioningProfileApi.createProvisioningProfile({
          name: brokerSrvName,
          version: 4,
          brokerTimezone: brokerTimezone || 'Etc/GMT+2',
          brokerDSTSwitchTimezone: brokerDSTSwitchTimezone || 'Etc/GMT+3',
        })
        await profile.uploadFile('broker.srv', brokerSrvBuffer)
      }
      if (profile && profile.status === 'new') {
        console.log('Uploading broker.srv')
        await profile.uploadFile('broker.srv', brokerSrvBuffer)
      } else {
        console.log('Account profile already created')
      }
      return {
        code: 0,
        msg: 'success',
        data,
      }
    } catch (e) {
      return { code: -1, msg: 'fail' }
    }
  },
})

// 启动服务
const start = async function () {
  try {
    await server.start()
    await server.register({
      plugin: require('hapi-pino'),
      options: {
        prettyPrint: true, // 格式化输出
      },
    })
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
  console.log('Server running at:', server.info.uri)
}
start()

async function getAllProfiles() {
  const profiles = await api.provisioningProfileApi.getProvisioningProfiles()
  return profiles
}
