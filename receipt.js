(()=>{
  const ORDERS_KEY='beyt_orders_v2';
  const SIRET='97961448400025';
  const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const eur=n=>(Number(n)||0).toFixed(2)+' EUR';
  const cleanPayment=s=>String(s||'').replace(/[^\wÀ-ÿ\s]/g,'').trim();
  const text=(value,attrs='')=>`<text ${attrs}>${esc(value)}</text>`;
  const big=(value,attrs='')=>text(value,`${attrs} width="2" height="2"`);
  const feed=(n=1)=>`<feed line="${n}"/>`;
  const line=()=>text('----------------------------','font="font_b" width="2" height="2"')+feed(1);

  function latestOrder(){
    try{
      const orders=JSON.parse(localStorage.getItem(ORDERS_KEY)||'[]');
      return Array.isArray(orders)&&orders.length?orders[orders.length-1]:null;
    }catch{return null;}
  }

  function makeReceipt(order){
    const total=Number(order.total)||0;
    const discount=Number(order.discount)||0;
    const tva=total-total/1.10;
    let x='<?xml version="1.0" encoding="utf-8"?>';
    x+='<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">';

    x+=big('BEY-T','align="center" em="true"')+feed(1);
    x+=big('Traiteur Libanais','align="center" font="font_b" em="true"')+feed(1);
    x+=big('62 Av. Pierre Grenier','align="center" font="font_b"')+feed(1);
    x+=big('92100 Boulogne-Billancourt','align="center" font="font_b"')+feed(1);
    x+=big(`SIRET : ${SIRET}`,'align="center" font="font_b"')+feed(1);
    x+=line();

    x+=big(`COMMANDE #${order.num}`,'align="center" font="font_b" em="true"')+feed(1);
    x+=big(`${order.date||''}  ${order.time||''}`,'align="center" font="font_b"')+feed(1);
    x+=line();

    x+=big('DETAIL DE LA COMMANDE','align="left" font="font_b" em="true"')+feed(1);
    (order.items||[]).forEach(it=>{
      const qty=Number(it.qty)||0, price=Number(it.price)||0;
      x+=big(it.name,'align="left" font="font_b" em="true"')+feed(1);
      x+=big(`${qty} x ${eur(price)} = ${eur(qty*price)}`,'align="left" font="font_b"')+feed(1);
      if(it.note) x+=big(`> ${it.note}`,'align="left" font="font_b"')+feed(1);
    });

    if(discount>0){
      x+=line();
      x+=big(`Remise : -${eur(discount)}`,'align="right" font="font_b"')+feed(1);
    }

    x+=line();
    x+=big(`TOTAL TTC ${eur(total)}`,'align="center" em="true"')+feed(1);
    x+=big(`dont TVA 10% : ${eur(tva)}`,'align="center" font="font_b"')+feed(1);
    x+=big(`Paiement : ${cleanPayment(order.paymentLabel)}`,'align="center" font="font_b" em="true"')+feed(1);

    if(order.paymentMode==='cash' && order.cashGiven!=null){
      const given=Number(order.cashGiven)||0;
      x+=big(`Montant remis : ${eur(given)}`,'align="center" font="font_b"')+feed(1);
      x+=big(`Monnaie rendue : ${eur(Math.max(0,given-total))}`,'align="center" font="font_b"')+feed(1);
    }

    x+=line();
    x+=big('Merci pour votre visite !','align="center" font="font_b" em="true"')+feed(1);
    x+=big('A bientot chez Bey-T','align="center" font="font_b"')+feed(2);
    x+='<cut type="feed"/>';
    x+='</epos-print>';
    return x;
  }

  function sendToEpson(xml){
    location.href='tmprintassistant://tmprintassistant.epson.com/print?ver=1&data-type=eposprintxml&data='+encodeURIComponent(xml);
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest('button');
    if(!b) return;
    const label=(b.textContent||'').trim();
    if(!/Imprimer$/.test(label) || /rapport/i.test(label)) return;
    const order=latestOrder();
    if(!order) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    sendToEpson(makeReceipt(order));
  },true);
})();
