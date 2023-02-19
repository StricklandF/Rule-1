// 加入了百度和bilibili测速,感谢@小白脸重写脚本原脚本,原作者@yibeizipeini来自于https://raw.githubusercontent.com/yibeizipeini/JavaScript/Surge/ConnectivityTest.js
let $ = {
baidu:'https://www.baidu.com',
bilibili:'https://www.bilibili.com',
google:'https://www.google.com/generate_204',
github:'https://www.github.com'
youtube:'https://www.youtube.com/'
}
!(async () => {
await Promise.all([http($.baidu),http($.bilibili),http($. github),http($. google),http($.youtube)]).then((x)=>{
	$done({
    title: 'Network Connectivity Test',
    content: x.join('\n'),
    icon: 'timer',
    'icon-color': '#FF5A9AF9',
  })
})
})();

function http(req) {
    return new Promise((r) => {
			let time = Date.now();
        $httpClient.post(req, (err, resp, data) => {
            r(req.split(".")[1]+
						'\xa0\xa0\xa0\xa0\xa0\t: ' +
						(Date.now() - time)+' ms');
        });
    });
}