//@Key svvvvip nettest 2023-06-14 20:53:04

Promise.all([(async()=>{try{let e="",t="",s="",i="",l="";let n,a=$network,r=a.dns;let o="";let c=a["cellular-data"]&&a["cellular-data"].radio||"";let p=a.v4.primaryAddress;let u=a.v6.primaryAddress!==null?"v6":"";let d=a.wifi.ssid!==null?"Wifi:"+a.wifi.ssid:"";if(d!==""){for(let e=0;e<r.length;e++){if(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(r[e])){o=r[e];break}}const e=await tKey(`http://${o}`,500);n="内网: "+d+u+" \t"+smKey(p,16)+e.tk+"ms\n"}else{n="内网: "+c+u+" \t"+smKey(p,16)+"\n"}const f=await tKey("https://api.live.bilibili.com/ip_service/v1/ip_service/get_ip_addr",500);if(f.code===0){let{addr:e,province:s,city:i,isp:l}=f.data,n=f.tk;l=l.replace(/.*广电.*/g, "广电");t="本机: "+s+l+" \t"+smKey(e,16)+n+"ms\n"}else{t="Biliapi "+f+"\n"}const y=await tKey("http://chat.openai.com/cdn-cgi/trace",1e3);const m=["CN","TW","HK","IR","KP","RU","VE","BY"];if(typeof y!=="string"){let{loc:e,tk:t,warp:i,ip:l}=y,n=m.indexOf(e),a="";if(n==-1){a="GPT: "+e+" ✓"}else{a="GPT: "+e+" ×"}if(i="plus"){i="Plus"}s=a+"       ➟     Priv: "+i+"   "+t+"ms"}else{s="ChatGPT "+y}const w=await tKey("http://ip-api.com/json/?lang=zh-CN",1e3);let K=new Date;let h="   "+(K.getMonth()+1)+"月"+K.getDate()+" "+K.getHours()+":"+K.getMinutes();if(w.status==="success"){let{country:t,countryCode:s,query:l,city:n,org:a,as:r,tk:o}=w;e=l;ast=sK(r,3);r=sK(r,2);a=sK(a,1);let c=r.split(" ")[1];let p="";if(c.toLowerCase()===a.toLowerCase()){p=ast}else{p=r+g+a}i=t+" "+s+"   \t"+smKey(l,16)+o+"ms\n"+smKey(p,22)}else{i="落地ipapi "+w+"\n"}const P=await httpAPI();let v,$=P.requests.filter((e=>/\(Proxy\)/.test(e.remoteAddress)&&/ip-api\.com/.test(e.URL))).map((e=>e.remoteAddress.replace(" (Proxy)","")));if($.length>0){v=$[0]}else{v="Noip"}let k=false,A="spe",C=false,z="edtest";isv6=false,cn=true,zl="";if(v==e){cn=false;zl="直连: "}else{zl="落地: "}if(v==="Noip"){k=true}else if(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v)){C=true}else if(/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v)){isv6=true}if(cn){if(!k||C){const e=await tKey(`https://api-v3.${A}${z}.cn/ip?ip=${v}`,500);if(e.code===0){let{province:t,isp:s,city:i}=e.data,n=e.tk;s=sK(s,4);l="入口: "+i+s+" \t"+smKey(v,16)+n+"ms\n"}else{l="入口IPA"+e+"\n"}}else if(!k||isv6){const e=await tKey(`http://ip-api.com/json/${v}?lang=zh-CN`,1e3);if(e.status==="success"){let{country:t,city:s,org:i,tk:n}=e;l="入口: "+s+i+n+" \t"+smKey(v,16)+n+"ms\n"}else{l="入口IPB"+e+"\n"}}}$done({title:s,content:n+t+l+zl+i+h})}catch(e){$done({title:outgpt,content:local+outbli+outik+outld+zl+day})}})()]);function smKey(e,t){if(e.length>t){return e.slice(0,t)}else if(e.length<t){return e.toString().padEnd(t," ")}else{return e}}function sK(e,t){return e.split(" ",t).join(" ").replace(/\.|\,|com|\u4e2d\u56fd/g,"")}async function httpAPI(e="/v1/requests/recent",t="GET",s=null){return new Promise(((i,l)=>{$httpAPI(t,e,s,(e=>{i(e)}))}))}async function tKey(e,t){let s=1,i=1;const l=new Promise(((l,a)=>{const r=async o=>{try{const s=await Promise.race([new Promise(((t,s)=>{let i=Date.now();$httpClient.get({url:e},((e,l,n)=>{if(e){s(e)}else{if(/^\s*[\{]/.test(n)){let e=JSON.parse(n);e.tk=Date.now()-i;t(e)}else{let e=n.split("\n");let s=e.reduce(((e,t)=>{let[s,l]=t.split("=");e[s]=l;e.tk=Date.now()-i;return e}),{});t(s)}}}))})),new Promise(((e,s)=>{setTimeout((()=>s(new Error("timeout"))),t)}))]);if(s){l(s)}else{a(new Error(n.message))}}catch(e){if(o<s){i++;r(o+1)}else{l("检测失败, 重试次数"+i)}}};r(0)}));return l}
