const fs = require('fs');
const p = 'bundle.js';
let s = fs.readFileSync(p, 'utf8');

const replacement = `function Tp(e){let RECEIPT_LAYOUT_V9="readable-detail";let t='<?xml version="1.0" encoding="utf-8"?><epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">';let n=e.total-e.total/1.10,r=x=>At(x),o=x=>(Number(x)||0).toFixed(2)+' EUR',l=()=>'<text font="font_b">------------------------------------------</text><feed line="1"/>';t+='<text align="center" font="font_b">BEY-T</text><feed line="1"/>';t+='<text align="center" font="font_b">Traiteur Libanais</text><feed line="1"/>';t+='<text align="center" font="font_b">62 Av. Pierre Grenier</text><feed line="1"/>';t+='<text align="center" font="font_b">92100 Boulogne-Billancourt</text><feed line="1"/>';t+='<text align="center" font="font_c">SIRET 97961448400025</text><feed line="1"/>';t+=l();t+='<text align="center" font="font_b">Commande #'+r(e.num)+'</text><feed line="1"/>';t+='<text align="center" font="font_b">'+r((e.date||'')+'  '+(e.time||''))+'</text><feed line="1"/>';t+=l();t+='<text align="left" font="font_b">DETAIL DE LA COMMANDE</text><feed line="1"/>';e.items.forEach(a=>{t+='<text align="left" font="font_b">'+r(a.name)+'</text><feed line="1"/>';t+='<text align="left" font="font_b">'+r(a.qty+' x '+o(a.price)+' = '+o(a.qty*a.price))+'</text><feed line="1"/>';a.note&&(t+='<text align="left" font="font_b">'+r('> '+a.note)+'</text><feed line="1"/>')});e.discount>0&&(t+='<text align="right" font="font_b">'+r('Remise : -'+o(e.discount))+'</text><feed line="1"/>');t+=l();t+='<text align="center" font="font_b">TOTAL TTC '+r(o(e.total))+'</text><feed line="1"/>';t+='<text align="center" font="font_b">dont TVA 10% : '+r(o(n))+'</text><feed line="1"/>';t+='<text align="center" font="font_b">Paiement : '+r(e.paymentLabel.replace(/[^\\w\\s]/g,'').trim())+'</text><feed line="1"/>';if(e.paymentMode==='cash'&&e.cashGiven!=null){let a=Number(e.cashGiven)||0;t+='<text align="center" font="font_b">'+r('Recu : '+o(a))+'</text><feed line="1"/>';t+='<text align="center" font="font_b">'+r('Rendu : '+o(Math.max(0,a-e.total)))+'</text><feed line="1"/>'}t+=l();t+='<text align="center" font="font_b">Merci pour votre visite</text><feed line="1"/>';t+='<text align="center" font="font_b">A bientot chez Bey-T</text><feed line="1"/><cut type="feed"/></epos-print>';Pp(t)}function Np`;

const start = s.indexOf('function Tp(e){');
const end = s.indexOf('function Np(', start);
if (start < 0 || end < 0) throw new Error(`Tp/Np boundaries not found: start=${start}, end=${end}`);
s = s.slice(0, start) + replacement + s.slice(end + 'function Np'.length);

if (!s.includes('RECEIPT_LAYOUT_V9="readable-detail"')) throw new Error('Receipt V9 marker missing after patch');
if (!s.includes('DETAIL DE LA COMMANDE')) throw new Error('Order detail heading missing after patch');
fs.writeFileSync(p, s);
console.log('Patched receipt V9: readable Font B + full order detail');
