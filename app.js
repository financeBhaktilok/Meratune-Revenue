let allRows=[], charts={};

function money(n){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n||0)}
function num(n){return new Intl.NumberFormat('en-IN').format(n||0)}
function parseDate(v){const d=new Date(v); return isNaN(d)?null:d}
function dateKey(d){return d.toISOString().slice(0,10)}

Papa.parse('data.csv',{
  download:true, header:true, skipEmptyLines:true,
  complete:(r)=>{
    allRows=r.data.map(x=>({...x, DateObj:parseDate(x.Date), AmountNum:Number(x.Amount)||0}));
    const valid=allRows.filter(x=>x.DateObj);
    if(valid.length){
      const dates=valid.map(x=>dateKey(x.DateObj)).sort();
      document.getElementById('fromDate').value=dates[0];
      document.getElementById('toDate').value=dates[dates.length-1];
    }
    render();
  }
});

['fromDate','toDate','mobileSearch'].forEach(id=>document.getElementById(id).addEventListener('input',render));
document.getElementById('resetBtn').onclick=()=>{
  const valid=allRows.filter(x=>x.DateObj);
  const dates=valid.map(x=>dateKey(x.DateObj)).sort();
  document.getElementById('fromDate').value=dates[0]||'';
  document.getElementById('toDate').value=dates[dates.length-1]||'';
  document.getElementById('mobileSearch').value='';
  render();
};

function filtered(){
  const from=document.getElementById('fromDate').value;
  const to=document.getElementById('toDate').value;
  const mobile=document.getElementById('mobileSearch').value.trim();
  return allRows.filter(x=>{
    if(!x.DateObj)return false;
    const k=dateKey(x.DateObj);
    return (!from||k>=from)&&(!to||k<=to)&&(!mobile||String(x['Mobile Number']).includes(mobile));
  });
}

function aggregate(rows,keyFn){
  const m={};
  rows.forEach(x=>{const k=keyFn(x);m[k]=(m[k]||0)+x.AmountNum});
  return m;
}

function draw(id,type,labels,datasets,options={}){
  if(charts[id])charts[id].destroy();
  charts[id]=new Chart(document.getElementById(id),{
    type,data:{labels,datasets},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:type!=='line'}},scales:{y:{beginAtZero:true}},...options}
  });
  document.getElementById(id).parentElement.style.height='270px';
}

function render(){
  const rows=filtered();
  const revenue=rows.reduce((s,x)=>s+x.AmountNum,0);
  const customers=new Set(rows.map(x=>x['Mobile Number']).filter(Boolean)).size;
  document.getElementById('totalRevenue').textContent=money(revenue);
  document.getElementById('transactions').textContent=num(rows.length);
  document.getElementById('customers').textContent=num(customers);
  document.getElementById('avgRevenue').textContent=money(rows.length?revenue/rows.length:0);

  const daily=aggregate(rows,x=>dateKey(x.DateObj));
  const dlabels=Object.keys(daily).sort();
  draw('dailyRevenue','line',dlabels,[{label:'Revenue',data:dlabels.map(k=>daily[k]),tension:.25,fill:false}]);

  const monthly=aggregate(rows,x=>dateKey(x.DateObj).slice(0,7));
  const mlabels=Object.keys(monthly).sort();
  draw('monthlyRevenue','bar',mlabels,[{label:'Revenue',data:mlabels.map(k=>monthly[k])}]);

  const tx=aggregate(rows,x=>dateKey(x.DateObj));
  draw('dailyTransactions','bar',dlabels,[{label:'Transactions',data:dlabels.map(k=>rows.filter(x=>dateKey(x.DateObj)===k).length)}]);

  const cm={};
  rows.forEach(x=>{const m=x['Mobile Number'];if(!m)return;if(!cm[m])cm[m]={rev:0,tx:0};cm[m].rev+=x.AmountNum;cm[m].tx++});
  const top=Object.entries(cm).sort((a,b)=>b[1].rev-a[1].rev).slice(0,20);
  document.getElementById('customerTable').innerHTML=top.map(([m,v])=>`<tr><td>${m}</td><td>${money(v.rev)}</td><td>${num(v.tx)}</td></tr>`).join('');
}
