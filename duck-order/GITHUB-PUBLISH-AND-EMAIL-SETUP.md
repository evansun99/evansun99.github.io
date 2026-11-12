# 俞记黑鸭：GitHub Pages + 邮件收单

网站会放在你的现有仓库的 `duck-order/` 子目录，不会覆盖原来的个人主页。

上线地址：`https://evansun99.github.io/duck-order/`

## 1. 创建收单接口

1. 打开 <https://script.google.com/>，新建项目。
2. 将同目录的 `GOOGLE-APPS-SCRIPT-Code.gs` 全部粘贴到 `Code.gs`。
3. 确认 `NOTIFY_EMAIL` 为 `sxysnyy@163.com`。
4. 点“部署”→“新建部署”→类型选“Web 应用”。
5. 执行身份选“我”，访问权限选“任何人”，完成授权。
6. 复制部署后的 Web App URL。

## 2. 把 URL 接到网页

把下面一行加到 `duck-order/index.html` 的现有脚本之前，并把 URL 换成上一步复制的地址：

```html
<script>
  window.YUJI_ORDER_ENDPOINT = '粘贴你的 Apps Script Web App URL';
</script>
```

保存后，顾客在网页上提交订单，订单详情会发送到 `sxysnyy@163.com`。付款仍由你人工核对，网页不会自动判定收款成功。

## 3. 可选的 Google Sheet 备份

如果还想自动留一份订单表：新建一个 Google Sheet，复制它的网址中 `/d/` 和 `/edit` 之间的 ID，填入 `Code.gs` 的 `OPTIONAL_SHEET_ID`，然后重新部署一个新版本。脚本会自动创建表头并追加订单。

## 注意

- 163 邮箱只接收通知，不负责发送确认邮件给顾客。
- GitHub Pages 是静态网页，必须连接 Apps Script 后才会真正发邮件。
- 首次部署/重新部署需要你在自己的 Google 账号中完成一次授权；不要把 Google 密码发给任何人。
