/*
@key 小白脸
#!name=Barkapps
#!desc= 利用Barkapp推送限免app，需要自己下载Bark并找到key填进argument
# 持久化缓存每次获取的列表，每个app只会推送一次，持久化数据位置: uuidkeys
# 点击的时候才会请求uuid然后跳转

[MITM]
hostname = %APPEND% barkapp.key.com

[Script]

BarkappREQ = type=http-request,pattern=^https?:\/\/barkapp\.key\.com,script-path=https://raw.githubusercontent.com/Keywos/rule/main/JS/surgepushBarkapps.js,requires-body=true
Barkapps=type=cron,cronexp=0 9,13,21 * * *,wake-system=1,timeout=120,script-path=https://raw.githubusercontent.com/Keywos/rule/main/JS/surgepushBarkapps.js,argument=填自己的key
*/

const key = this.$argument ?? "";
let url;if (typeof $request !== 'undefined' && $request.url)
{url = $request.url;} else {url = '0';}
Promise.all([
  (async () => {
    try {
    if(key !==""){
      if (/barkapp\.key\.com/.test(url)) {
            let spurl = url.split("&")[1];
          const uuapp = await tKey(
            {url: `https://api.gofans.cn/v1/m/apps/${spurl}`,
              headers: {
                referer: "https://m.gofans.cn/",
                origin: "https://m.gofans.cn",
              },},500,"get");
          $done({response: {status: 302,headers: {Location: uuapp.track_url}}}); 
      } else {
      const uuk = await tKey({url: "https://api.gofans.cn/v1/m/app_records?page=1&limit=10",
          headers: {
            referer: "https://m.gofans.cn/",
            origin: "https://m.gofans.cn",
          },},500,"get");
      let reu = $persistentStore.read("uuidkeys");
      let readuuid = reu ? JSON.parse(reu) : [""];
      if (readuuid.length > 10) {
        readuuid.splice(0, readuuid.length - 10);
      }
      let uuidList = uuk.data.filter(function (item) {
        return !readuuid.includes(item.uuid);
      });
      let uuids = uuidList
        .filter(function (i) {
          return i.uuid !== undefined;
        })
        .map(function (i) {
          return i.uuid;
        });
      console.log(uuids);

      if (uuids && uuids.length) {
        readuuid.push(...uuids);
        let writeuuid = JSON.stringify(readuuid);
        $persistentStore.write(writeuuid, "uuidkeys");
      }
      await Promise.all(
        uuidList.map(async (ik, nc) => {
            let {icon,name: napp,uuid,description,original_price: yj,price: xj,updated_at} = ik;
            //console.log(icon)
            const pushapp = await tKey(
              {
                url: "https://api.day.app/push",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify({
                  title: napp,
                  body: `${getTI(updated_at)}   CNY: ${yj} ➟ ${xj}\n${sK(description,1)}`,
                  device_key: key,
                  icon: icon,
                  //badge: "921", //通知数量
                  level: "passive",
                  //active：默认值，系统会立即亮屏显示通知
                  //timeSensitive：时效性通知，可在专注状态下显示通知。
                  //passive：仅将通知添加到通知列表，不会亮屏提醒。
                  url:`https://barkapp.key.com/key&${uuid}`
                }),
              },500,"post");
            }));}
    } else {
      $done($notification.post("", "", "未填写key"));
    } 
    } catch (error) {
      $done($notification.post("", "", "错误,反馈@key"));
    }
  })(),
]);

function sM(s, e) {
  if (s.length > e) {
    return s.slice(0, e);
  } else if (s.length < e) {
    return s.toString().padEnd(e, " ");
  } else {
    return s;
  }
}
function getTI(e) {
    const k = new Date(e * 1000);
    const y = k.toLocaleString("en-CN");
    return y.replace(/:\d\d$|,|^\d\d/g, "");
  }
  
function sK(s, e) {
return s.split("\n", e).join(" ");
}
async function tKey(options, timeout, method = "get") {
  let rec = 3,
    cskey = 1;
  const promise = new Promise((resolve, reject) => {
    const retry = async (attempt) => {
      try {
        const result = await Promise.race([
          new Promise((resolve, reject) => {
            let time = Date.now();
            $httpClient[method](options, (error, response, data) => {
              if (error) {
                reject(error);
              } else {
                let endtime = Date.now() - time;
                let ststus = response.status;
                switch (ststus) {
                  case 200:
                    let type = response.headers["Content-Type"];
                    switch (true) {
                      case type.includes("application/json"):
                        let keyj = JSON.parse(data);
                        keyj.tk = endtime;
                        resolve(keyj);
                        // console.log("application/json");
                        break;
                      case type.includes("text/html"):
                        // console.log("text/html");
                        break;
                      case type.includes("text/plain"):
                        // console.log("text/plain");
                        break;
                      case type.includes("image/svg+xml"):
                        // console.log("image/svg+xml");
                        let lines = data.split("\n");
                        let key = lines.reduce((acc, line) => {
                          let [key, value] = line.split("=");
                          acc[key] = value;
                          acc.tk = endtime;
                          return acc;
                        }, {});
                        resolve(key);
                        break;
                      default:
                        // console.log("未知");
                        break;
                    }
                    break;
                  case 204:
                    // console.log("204");
                    // console.log(endtime);
                    let tk = { tk: endtime };
                    // console.log(tk)
                    resolve(tk);
                    break;
                  case 429:
                    resolve("次数过多");
                    break;
                  case 404:
                    resolve("404");
                    break;
                  default:
                    break;
                }
              }
            });
          }),
          new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error("timeout")), timeout);
          }),
        ]);
        if (result) {
          resolve(result);
        } else {
          reject(new Error(n.message));
        }
      } catch (error) {
        if (attempt < rec) {
          cskey++;
          retry(attempt + 1);
        } else {
          resolve("重试次数" + cskey);
        }
      }
    };
    retry(0);
  });
  return promise;
}