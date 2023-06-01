# Sub-Store 配置指南

## 脚本配置：
* CNAME 专用添加感谢[@小一](https://github.com/xream/Sub-Store/tree/feature/scriptResourceCache/backend/src/utils)脚本持久化缓存 
* `$scriptResourceCache`
* `SCRIPT_RESOURCE_CACHE_KEY`
* `#sub-store-cached-script-resource` 缓存路径
* `TIMEDKEY` 时间默认48小时，Loon可插件内指定，也可以参数指定详见脚本说明
* [本仓库位置](https://github.com/Keywos/Sub-Store/tree/feature-scriptResourceCache)
* Surge or Loon [专用](https://github.com/Keywos/rule/raw/main/cname.js)
### 1. Loon
安装使用[插件](https://raw.githubusercontent.com/Peng-YM/Sub-Store/master/config/Loon.plugin)即可。
### 2. Surge
安装使用[模块](https://raw.githubusercontent.com/Peng-YM/Sub-Store/master/config/Surge.sgmodule)即可。

## 使用 Sub-Store
1. 使用 Safari 打开这个 https://sub.store 如网页正常打开并且未弹出任何错误提示，说明 Sub-Store 已经配置成功。
2. 可以把 Sub-Store 添加到主屏幕，即可获得类似于 APP 的使用体验。
3. 更详细的使用指南请参考[文档](https://www.notion.so/Sub-Store-6259586994d34c11a4ced5c406264b46)。