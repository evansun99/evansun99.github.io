// Yuji Black Duck order receiver
// 1) Create a new Google Apps Script project.
// 2) Paste this file into Code.gs.
// 3) Replace NOTIFY_EMAIL, then Deploy > New deployment > Web app.
// 4) Execute as Me and set Who has access to Anyone.

const NOTIFY_EMAIL = 'PASTE_YOUR_RECEIVING_EMAIL_HERE';
const OPTIONAL_SHEET_ID = ''; // Optional: paste a Google Sheet ID to keep a backup table.

function doGet() {
  return json_({ ok: true, service: 'Yuji Black Duck order receiver' });
}

function doPost(e) {
  try {
    const order = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!order.orderNumber || !order.customer || !order.pricing || !order.pricing.total) {
      throw new Error('Invalid order payload');
    }

    const items = (order.items || []).map(function (item) {
      return item.name + ' × ' + item.quantity + '（A$' + Number(item.lineTotal || 0).toFixed(2) + '）';
    }).join('\n');

    const subject = '俞记黑鸭新订单 ' + order.orderNumber + ' · A$' + Number(order.pricing.total).toFixed(2);
    const text = [
      '俞记黑鸭收到新订单',
      '订单号：' + order.orderNumber,
      '下单时间：' + (order.createdAt || ''),
      '取餐方式：' + ((order.fulfilment && order.fulfilment.method) || ''),
      '配送地址：' + ((order.fulfilment && order.fulfilment.address) || '—'),
      '包装方式：' + (order.packaging || ''),
      '姓名：' + (order.customer.name || ''),
      '手机号：' + (order.customer.phone || ''),
      '订单备注：' + (order.note || '—'),
      '',
      '商品：', items,
      '',
      '商品小计：A$' + Number(order.pricing.subtotal || 0).toFixed(2),
      '配送费：A$' + Number(order.pricing.deliveryFee || 0).toFixed(2),
      '合计：A$' + Number(order.pricing.total || 0).toFixed(2),
      '付款方式：' + ((order.payment && order.payment.method) || '顾客未填写'),
      '',
      '请人工核对收款后再确认订单。'
    ].join('\n');

    MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, body: text });
    appendToSheet_(order, items);
    return json_({ ok: true, orderNumber: order.orderNumber });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function appendToSheet_(order, items) {
  if (!OPTIONAL_SHEET_ID) return;
  const sheet = SpreadsheetApp.openById(OPTIONAL_SHEET_ID).getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['时间', '订单号', '姓名', '手机号', '取餐方式', '包装方式', '地址', '商品', '小计', '配送费', '合计', '付款方式', '备注']);
  }
  sheet.appendRow([
    order.createdAt || new Date(), order.orderNumber, order.customer.name || '', order.customer.phone || '',
    (order.fulfilment && order.fulfilment.method) || '', order.packaging || '',
    (order.fulfilment && order.fulfilment.address) || '', items,
    Number(order.pricing.subtotal || 0), Number(order.pricing.deliveryFee || 0),
    Number(order.pricing.total || 0), (order.payment && order.payment.method) || '', order.note || ''
  ]);
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
