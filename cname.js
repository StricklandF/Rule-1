/*
版本：默认48H缓存版
日期：2023-05-26 17
注意：此脚本仅支持Surge和Loon 出问题时建议更新全部外部资源 清理持久化缓存
符号：🅳电信 🅻联通 🆈移动 🅶广电 🅲公司 🆉直连 🎮游戏
接口：入口查询[国内spapi 识别到国外为ip-api] 落地查询[ip-api]
功能：根据接口返回的真实结果，重新对节点命名。添加入口城市、落地国家或地区、国内运营商信息，并对这些数据做持久化缓存（48小时有效期），减少API请求次数，提高运行效率。
异常：如遇问题，Loon可以进入[配置]→[持久化缓存]→[删除指定数据]→输入Key key无log版脚本位置：[CNAMEKEY] 或 小一有log版本 [sub-store-cached-script-resource]并删除缓存。
     Surge需要进入[脚本编辑器]→左下角[设置]→[$persistentStore]→key无log版脚本位置：[CNAMEKEY] 或 小一有log版本 [sub-store-cached-script-resource]删除缓存数据。
作者：@Key @奶茶姐 @小一 @可莉
用法：Sub-Store脚本操作里添加
注意：必须安装以下模块，关闭官方版本才能使用: 目前SubStore还未更新脚本持久化缓存超时
 * Surge: https://github.com/Keywos/rule/raw/main/module/Sub-Store.sgmodule
 * Loon: https://github.com/Keywos/rule/raw/main/loon/sub-store.plugin
 * 可莉版本 Loon: https://gitlab.com/lodepuly/vpn_tool/-/raw/main/Tool/Loon/Plugin/Sub-Store.plugin
----------------
以下是此脚本支持的参数，必须以"#"开头，多个参数使用"&"连接
https://github.com/Keywos/rule/raw/main/cname.js#city&isp
[bl]      保留倍率
[isp]     运营商/直连
[dns]     DNS域名解析
[yun]     入口服务商
[city]    加入口城市
[game]    保留游戏标识
[flag]    添加落地旗帜
[sheng]   加入口省份
[offtz]   关闭脚本通知
[snone]   清理地区只有一个节点的01
[h=]      缓存过期时间小时
[tz=]     通知显示的机场名
[sn=]     国家与序号之间的分隔符，默认为空格
[min=]    缓存过期时间分钟,h和min只能二选一
[fgf=]    入口和落地之间的分隔符，默认为空格
[name=]   添加机场名称前缀
----------------
[timeout=] HTTP请求返回结果的超时时间，默认1510ms 《建议默认值》
[bs=]    批处理节点数建议10左右，如果经常读不到节点建议减小批处理个数，手机网络压力山大 (:
[cd=]    * 当部分有缓存，部分节点没有缓存的情况下， 对节点直接进行测试写入缓存的超时时间，默认460ms
* 仅当节点缓存接近完全的情况下, 《才建议》设置[cd=]的值小于50，这样会直接读取缓存。不发送请求, 减少不必要的请求,和时间 
* 影响输出预览速度的有 [bs=] [cd=] [timeout=] 节点质量
----------------
*/
const $ = $substore;
const bl = $arguments["bl"];
const isp = $arguments["isp"];
const dns = $arguments["dns"];
const yun = $arguments["yun"];
const city = $arguments["city"];
const flag = $arguments["flag"];
const game = $arguments["game"];
const offtz = $arguments["offtz"];
const sheng = $arguments["sheng"];
const debug = $arguments["debug"];
const numone = $arguments["snone"];
const { isLoon, isSurge, isQX } = $substore.env;
let cd = $arguments["cd"] ? $arguments["cd"] : 460;
let timeout = $arguments["timeout"] ? $arguments["timeout"] : 1520;
const tzname = $arguments.tz ? decodeURI($arguments.tz) : "";
const keynames = $arguments.name ? decodeURI($arguments.name) : "";
const FGF = $arguments.fgf == undefined ? " " : decodeURI($arguments.fgf);
const XHFGF = $arguments.sn == undefined ? " " : decodeURI($arguments.sn);
const target = isLoon ? "Loon" : isSurge ? "Surge" : isQX ? "QX" : undefined;
const min = $arguments.min ? decodeURI($arguments.min) : "";
const h = $arguments.h ? decodeURI($arguments.h) : "";
let writet = "";let innum = 172800000;let loontrue = false;let onen = false;let Sue = false;
if(min !== "") {Sue=true;innum = parseInt(min, 10) * 60000;writet = $persistentStore.write(JSON.stringify(innum), "CNAMEKEYD");} 
else if(h !== "") {Sue=true;innum = parseInt(h, 10) * 3600000;writet = $persistentStore.write(JSON.stringify(innum), "CNAMEKEYD");} 
else{writet = $persistentStore.write(JSON.stringify(innum), "CNAMEKEYD");}
const regexArray = [/游戏|game/i,];const valueArray = ["Game"];
const nameclear = /邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|到期|过期|已用|联系|邮箱|工单|群|贩卖|倒卖|防止|(\b(USE|USED|TOTAL|EXPIRE|EMAIL)\b)|\d\s?g/i;
async function operator(e) {let cs = 0;const startTime = new Date();
const support = isLoon || isSurge;if (!support) {$.error(`No Loon or Surge`);$notify("仅仅支持Loon或Surge", "", "");console.log("仅仅支持Loon或Surge");return e;}
if (typeof scriptResourceCache === 'undefined') {console.log("\nNCNAME: 不支持此 SubStore,\n查看脚本说明\nhttps://github.com/Keywos/rule/raw/main/cname.js");
if (target == "Surge") {$notification.post("NCNAME Sub-Store未更新", "", "请点击或查看Log查看脚本说明安装对应版本", { url: "https://github.com/Keywos/rule/raw/main/module/Sub-Store.sgmodule" })} 
else if (target == "Loon") {$notification.post("NCNAME Sub-Store未更新", "", "请点击安装插件, 或查看Log安装对应版本, 并关闭原本的Substore", "loon://import?plugin=https://gitlab.com/lodepuly/vpn_tool/-/raw/main/Tool/Loon/Plugin/Sub-Store.plugin")}return e;}
var bs = $arguments["bs"] ? $arguments["bs"] : 12;
const ein = e.length;
console.log(`设定API超时: ${timeout}毫秒`);
console.log(`有缓API超时: ${cd}毫秒`);
console.log(`批处理节点数: ${bs} 个`);
console.log(`开始处理节点: ${ein} 个`);
e = e.filter((item) => !nameclear.test(item.name));
let o = 0;
let Pushtd = "";
let intimed = "";
let stops = false;
do{
  while (o < e.length && !stops) {
  const batchs = e.slice(o, o + 1);
  await Promise.all(
    batchs.map(async (proxy) => {
      try {
        const inss = new Map();
        const id = getid(proxy);
        if (inss.has(id)){return inss.get(id)}
        const cacheds = scriptResourceCache.get(id);
        if (cacheds) {
          if(!onen){timeout=cd;onen=true;stops=true;}
          const readt = scriptResourceCache.gettime(id);
          let nt = new Date().getTime();
          let timedPush = "";if (target == "Loon") {let loontd = "";
          const loonkkk={"1分钟":"60000","5分钟":"300000","10分钟":"600000","30分钟":"1800000","1小时":"3600000","2小时":"7200000","3小时":"10800000","6小时":"21600000","12小时":"43200000","24小时":"86400000","48小时":"172800000","72小时":"259200000","SUB参数传入":"innums"}
          intimed = $persistentStore.read("缓存过期时间");loontd = loonkkk[intimed] || "172800000";
          if(loontd=="innums"){loontd=innum}timedPush = mTIme(parseInt(readt, 10) - nt + parseInt(loontd, 10))
          } else if(target == "Surge" && Sue){timedPush = mTIme(parseInt(readt, 10) - nt + parseInt(innum, 10));
          } else {timedPush = mTIme(parseInt(readt, 10) - nt + parseInt(TIMEDKEY, 10));
          }Pushtd = `, ${timedPush}后过期 \n`;
        }}catch(err){}}));o += 1;};
let i=0;while (i < e.length) {
const batch = e.slice(i, i + bs);
await Promise.all(
batch.map(async (proxy) => {
  try {   
    const alikey = await AliD(proxy.server);
    const spkey = await SPEC(proxy.server, alikey);
    if (debug) { console.log("国内入口🌸 " + JSON.stringify(spkey)) }
    let qcip = "";
    qcip = spkey.ip
    // 落地
    const outip = await OUTIA(proxy);
    let luodi = outip.country;
    let reld = ""; // 落地
    let cmcc = ""; //运营
    let cmfg = ""; // 符号
    let outg = ""; // 🎮
    let incity = ""; //入口
      if (debug) { console.log("落地信息🍓 " + JSON.stringify(outip)) }
      if (spkey.country == "中国" && spkey.city !== "") {
        if (city && sheng) {
          if (spkey.city == spkey.regionName) {incity = spkey.city
          } else {incity = spkey.regionName + FGF + spkey.city}
        } else if (city) {incity = spkey.city
        } else if (sheng) {incity = spkey.regionName}
        if (/电信|联通|移动|广电/.test(spkey.isp)) {cmcc = spkey.isp.replace(/中国/g, "");
        } else if (yun) {cmcc = spkey.isp;
        } else {cmcc = "企业";}
        if (flag) {
          if (isp) {
            const keycm = { '电信': '🅳', '联通': '🅻', '移动': '🆈', '广电': '🅶' };
            if (keycm.hasOwnProperty(cmcc)) {
              cmfg = keycm[cmcc];
            } else {cmfg = "🅲";}
          }
        } else {cmfg = cmcc;}
      } else {
        const inip = await INIA(proxy.server);
        if (debug) { console.log("国外入口 " + JSON.stringify(inip)) }
        incity = inip.country
        cmcc = inip.country
        if (incity == luodi) {
          incity = "直连";
          cmcc = ""; //防火墙
        }if (flag) {cmfg = "🆉"}
        qcip = inip.ip}
      let rename = "";//替换game
      regexArray.forEach((regex, index) => {
        if (regex.test(proxy.name)) {rename = valueArray[index];}});
      let inkey = "";
      if ((isp && city) || (sheng && city) || (isp && sheng) || (sheng && isp && city) || yun) {
        if (flag || yun || sheng || city) {inkey = cmfg + incity + FGF;}
          else {inkey = incity + cmcc + FGF;}
      } else if (flag) {
        inkey = cmfg + FGF;
      } else if (isp || yun) {
        inkey = cmcc + FGF;
      } else if (city || sheng) {
        inkey = incity + FGF;
      } else {inkey = "";}
        if (game) {
          //game
          if (rename === "") {outg = "";} else {//'UDP': '🆄',
          const keyoutg = { Game: "🎮" };
          if (keyoutg.hasOwnProperty(rename)) {outg = keyoutg[rename];} 
          else {outg = "";}}} 
        else {outg = "";};
        let nxx = "";
        if (bl) {
          const match = proxy.name.match(/(倍率\D?((\d\.)?\d+)\D?)|((\d\.)?\d+)(倍|X|x|×)/);
          if (match) {
            const matchedValue = match[0].match(/(\d[\d.]*)/)[0];
            if (matchedValue !== "1") {
              const newValue = matchedValue + "×";
              nxx = newValue
            }}
          if (outg !== "") {
            reld = luodi + outg + nxx;
          } else if (nxx !== "") {
            reld = luodi + outg + XHFGF + nxx;
          } else {
            reld = luodi;
          };} 
          else {reld = luodi + outg}
        let adflag = "";
        if (flag) {adflag = getflag(outip.countryCode)} else {adflag = "";}
        if (dns) { proxy.server = qcip }
        proxy.name = inkey + adflag + reld;
        proxy.qc = qcip + outip.query;
        }catch(err){}}));if(!onen){await sleep(50)};i+=bs}cs++;e=removels(e);
      if (e.length < ein*0.2 && cs === 1) {
    await sleep(50);}} while (e.length < ein*0.2 && cs < 2);
  if (cs < 3) {console.log("任务执行次数: "+cs)}
  e = removeqc(e);e = jxh(e);
  if(keynames !== ""){e.forEach((proxy)=>{proxy.name=keynames+" "+proxy.name;});}
  numone && (e = onee(e));
  let eout = e.length;
  const endTime = new Date();
  const timeDiff = endTime.getTime() - startTime.getTime();
  if (dns) { console.log(`DNS解析后共: ${eout} 个`) }
  apiRead > 0 ? console.log(`读取API缓存: ${apiRead} 个`) : null;
  apiw > 0 ? console.log(`写入API缓存: ${apiw} 个`) : null;
  console.log(`处理完后剩余: ${eout} 个`);
  if (target == "Loon") {console.log("缓存过期时间: " + intimed + ", 还剩" + Pushtd.replace(/,|\n/g, ""));
  } else {console.log("缓存过期时间: " + mTIme(TIMEDKEY) + ", 还剩" + Pushtd.replace(/,|\n/g, ""));}
  console.log(`此方法总用时: ${mTIme(timeDiff)}\n----For New CNAME----`);
  // Push
  const readlog = apiRead ? `读取缓存:${apiRead} ` : '';
  const writelog = apiw ? `写入缓存:${apiw}, ` : '';
  const Push = (eout == ein) ? "全部通过测试, " : "去除无效节点后有" + eout + "个, ";
  if (!offtz) {$notification.post(
    `${tzname}共${ein}个节点`,"",
    `${writelog}${readlog}${Pushtd}${Push}用时:${mTIme(timeDiff)}`
  )}return e;
}
function getid(e){let t="ld";return MD5(`${t}-${e.server}-${e.port}`)}
function getinid(e){let t="ia";return MD5(`${t}-${e}`)}
function getaliid(e){let t="al";return MD5(`${t}-${e}`)}
function getspcn(e){let t="sc";return MD5(`${t}-${e}`)}
var MD5=function(e){var t=M(V(Y(X(e),8*e.length)));return t.toLowerCase()};function M(e){for(var t,n="0123456789ABCDEF",s="",o=0;o<e.length;o++)t=e.charCodeAt(o),s+=n.charAt(t>>>4&15)+n.charAt(15&t);return s}function X(e){for(var t=Array(e.length>>2),n=0;n<t.length;n++)t[n]=0;for(n=0;n<8*e.length;n+=8)t[n>>5]|=(255&e.charCodeAt(n/8))<<n%32;return t}function V(e){for(var t="",n=0;n<32*e.length;n+=8)t+=String.fromCharCode(e[n>>5]>>>n%32&255);return t}function Y(e,t){e[t>>5]|=128<<t%32,e[14+(t+64>>>9<<4)]=t;for(var n=1732584193,s=-271733879,o=-1732584194,r=271733878,i=0;i<e.length;i+=16){var c=n,a=s,u=o,m=r;s=md5_ii(s=md5_ii(s=md5_ii(s=md5_ii(s=md5_hh(s=md5_hh(s=md5_hh(s=md5_hh(s=md5_gg(s=md5_gg(s=md5_gg(s=md5_gg(s=md5_ff(s=md5_ff(s=md5_ff(s=md5_ff(s,o=md5_ff(o,r=md5_ff(r,n=md5_ff(n,s,o,r,e[i+0],7,-680876936),s,o,e[i+1],12,-389564586),n,s,e[i+2],17,606105819),r,n,e[i+3],22,-1044525330),o=md5_ff(o,r=md5_ff(r,n=md5_ff(n,s,o,r,e[i+4],7,-176418897),s,o,e[i+5],12,1200080426),n,s,e[i+6],17,-1473231341),r,n,e[i+7],22,-45705983),o=md5_ff(o,r=md5_ff(r,n=md5_ff(n,s,o,r,e[i+8],7,1770035416),s,o,e[i+9],12,-1958414417),n,s,e[i+10],17,-42063),r,n,e[i+11],22,-1990404162),o=md5_ff(o,r=md5_ff(r,n=md5_ff(n,s,o,r,e[i+12],7,1804603682),s,o,e[i+13],12,-40341101),n,s,e[i+14],17,-1502002290),r,n,e[i+15],22,1236535329),o=md5_gg(o,r=md5_gg(r,n=md5_gg(n,s,o,r,e[i+1],5,-165796510),s,o,e[i+6],9,-1069501632),n,s,e[i+11],14,643717713),r,n,e[i+0],20,-373897302),o=md5_gg(o,r=md5_gg(r,n=md5_gg(n,s,o,r,e[i+5],5,-701558691),s,o,e[i+10],9,38016083),n,s,e[i+15],14,-660478335),r,n,e[i+4],20,-405537848),o=md5_gg(o,r=md5_gg(r,n=md5_gg(n,s,o,r,e[i+9],5,568446438),s,o,e[i+14],9,-1019803690),n,s,e[i+3],14,-187363961),r,n,e[i+8],20,1163531501),o=md5_gg(o,r=md5_gg(r,n=md5_gg(n,s,o,r,e[i+13],5,-1444681467),s,o,e[i+2],9,-51403784),n,s,e[i+7],14,1735328473),r,n,e[i+12],20,-1926607734),o=md5_hh(o,r=md5_hh(r,n=md5_hh(n,s,o,r,e[i+5],4,-378558),s,o,e[i+8],11,-2022574463),n,s,e[i+11],16,1839030562),r,n,e[i+14],23,-35309556),o=md5_hh(o,r=md5_hh(r,n=md5_hh(n,s,o,r,e[i+1],4,-1530992060),s,o,e[i+4],11,1272893353),n,s,e[i+7],16,-155497632),r,n,e[i+10],23,-1094730640),o=md5_hh(o,r=md5_hh(r,n=md5_hh(n,s,o,r,e[i+13],4,681279174),s,o,e[i+0],11,-358537222),n,s,e[i+3],16,-722521979),r,n,e[i+6],23,76029189),o=md5_hh(o,r=md5_hh(r,n=md5_hh(n,s,o,r,e[i+9],4,-640364487),s,o,e[i+12],11,-421815835),n,s,e[i+15],16,530742520),r,n,e[i+2],23,-995338651),o=md5_ii(o,r=md5_ii(r,n=md5_ii(n,s,o,r,e[i+0],6,-198630844),s,o,e[i+7],10,1126891415),n,s,e[i+14],15,-1416354905),r,n,e[i+5],21,-57434055),o=md5_ii(o,r=md5_ii(r,n=md5_ii(n,s,o,r,e[i+12],6,1700485571),s,o,e[i+3],10,-1894986606),n,s,e[i+10],15,-1051523),r,n,e[i+1],21,-2054922799),o=md5_ii(o,r=md5_ii(r,n=md5_ii(n,s,o,r,e[i+8],6,1873313359),s,o,e[i+15],10,-30611744),n,s,e[i+6],15,-1560198380),r,n,e[i+13],21,1309151649),o=md5_ii(o,r=md5_ii(r,n=md5_ii(n,s,o,r,e[i+4],6,-145523070),s,o,e[i+11],10,-1120210379),n,s,e[i+2],15,718787259),r,n,e[i+9],21,-343485551),n=safe_add(n,c),s=safe_add(s,a),o=safe_add(o,u),r=safe_add(r,m)}return Array(n,s,o,r)}function md5_cmn(e,t,n,s,o,r){return safe_add(bit_rol(safe_add(safe_add(t,e),safe_add(s,r)),o),n)}function md5_ff(e,t,n,s,o,r,i){return md5_cmn(t&n|~t&s,e,t,o,r,i)}function md5_gg(e,t,n,s,o,r,i){return md5_cmn(t&s|n&~s,e,t,o,r,i)}function md5_hh(e,t,n,s,o,r,i){return md5_cmn(t^n^s,e,t,o,r,i)}function md5_ii(e,t,n,s,o,r,i){return md5_cmn(n^(t|~s),e,t,o,r,i)}function safe_add(e,t){var n=(65535&e)+(65535&t);return(e>>16)+(t>>16)+(n>>16)<<16|65535&n}function bit_rol(e,t){return e<<t|e>>>32-t}
function getflag(e){const t=e.toUpperCase().split("").map((e=>127397+e.charCodeAt()));return String.fromCodePoint(...t).replace(/🇹🇼/g,"🇨🇳")}
function sleep(e){return new Promise((t=>setTimeout(t,e)))}
let apiRead=0;let apiw=0;const outs=new Map();async function OUTIA(e){const t=getid(e);if (outs.has(t)){return outs.get(t);}const n=scriptResourceCache.get(t);if (n){apiRead++;return n;}else{const maxRE=1;const n=new Promise((resolve,reject)=>{if (cd < 51 && onen){return n;}else{const retry=async (retryCount)=>{const url=`http://ip-api.com/json?lang=zh-CN&fields=status,message,country,countryCode,city,query`;let r=ProxyUtils.produce([e],target);try{const response=await Promise.race([ $.http.get({ url,node: r,"policy-descriptor": r}),new Promise((_,reject)=> setTimeout(()=> reject(new Error("timeout")),timeout) ),]);const data=JSON.parse(response.body);if (data.status==="success"){scriptResourceCache.set(t,data);apiw++;resolve(data);}else{reject(new Error(data.message));}}catch (error){if (retryCount < maxRE){retry(retryCount + 1);}else{reject(error);}}};retry(0);}});outs.set(t,n);return n;}}
const ali = new Map();async function AliD(e){const t=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(e);if(t){return e}else{const t=getaliid(e);if(ali.has(t)){return ali.get(t)}const n=scriptResourceCache.get(t);if(n){return n}else{const n=new Promise(((s,o)=>{if(cd<51&&onen){return n}else{const n=`http://223.5.5.5/resolve?name=${e}&type=A&short=1`;const r=new Promise(((e,t)=>{setTimeout((()=>{t(new Error("timeout"))}),timeout)}));const i=$.http.get({url:n}).then((e=>{const n=JSON.parse(e.body);if(n.length>0){scriptResourceCache.set(t,n[0]);s(n[0])}else{o(new Error)}})).catch((e=>{o(e)}));Promise.race([r,i]).catch((e=>{o(e)}))}}));ali.set(t,n);return n}}}
const spapi=new Map;async function SPEC(e,t){const n=getspcn(e);if(spapi.has(n)){return spapi.get(n)}const s=scriptResourceCache.get(n);if(s){return s}else{const e=new Promise(((s,o)=>{if(cd<51&&onen){return e}else{const e=t;const r=`https://api-v3.speedtest.cn/ip?ip=${e}`;const i=new Promise(((e,t)=>{setTimeout((()=>{t(new Error("timeout"))}),timeout)}));const c=$.http.get({url:r}).then((e=>{const t=JSON.parse(e.body);if(t.data){const{country:e,province:o,city:r,isp:i,ip:c}=t.data;const a={country:e,regionName:o,city:r,isp:i,ip:c};s(a);scriptResourceCache.set(n,a)}else{o(new Error)}})).catch((e=>{o(e)}));Promise.race([i,c]).catch((e=>{o(e)}))}}));ins.set(n,e);return e}}
const ins=new Map;async function INIA(e){const t=getinid(e);if(ins.has(t)){return ins.get(t)}const n=scriptResourceCache.get(t);if(n){return n}else{const n=new Promise(((s,o)=>{if(cd<51&&onen){return n}else{const n=e;const r=`http://ip-api.com/json/${n}?lang=zh-CN&fields=status,message,country,query,regionName`;const i=new Promise(((e,t)=>{setTimeout((()=>{t(new Error("timeout"))}),timeout)}));const c=$.http.get({url:r}).then((e=>{const o=JSON.parse(e.body);if(o.status==="success"){scriptResourceCache.set(t,o);s(o)}else{s(n)}})).catch((e=>{o(e)}));Promise.race([i,c]).catch((e=>{o(e)}))}}));ins.set(t,n);return n}}
function removels(e){const t=new Set;const n=[];for(const s of e){if(s.qc&&!t.has(s.qc)){t.add(s.qc);n.push(s)}}return n}
function removeqc(e){const t=new Set;const n=[];for(const s of e){if(!t.has(s.qc)){t.add(s.qc);const e={...s};delete e.qc;n.push(e)}}return n}
function jxh(e){const t=e.reduce(((e,t)=>{const n=e.find((e=>e.name===t.name));if(n){n.count++;n.items.push({...t,name:`${t.name}${XHFGF}${n.count.toString().padStart(2,"0")}`})}else{e.push({name:t.name,count:1,items:[{...t,name:`${t.name}${XHFGF}01`}]})}return e}),[]);const n=t.flatMap((e=>e.items));e.splice(0,e.length,...n);return e}
function onee(e){const t=e.reduce(((e,t)=>{const n=t.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/,"");if(!e[n]){e[n]=[]}e[n].push(t);return e}),{});for(const e in t){if(t[e].length===1&&t[e][0].name.endsWith("01")){const n=t[e][0];n.name=e}}return e}
function mTIme(e){e=e.toString().replace(/-/g, "");if(e<1e3){return`${Math.round(e)}毫秒`}else if(e<6e4){return`${Math.round(e/1e3)}秒`}else if(e<36e5){return`${Math.round(e/6e4)}分钟`}else if(e>=36e5){return`${Math.round(e/36e5)}小时`}}
