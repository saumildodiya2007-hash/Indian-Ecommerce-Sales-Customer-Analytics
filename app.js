const D=window.DATA;
const INR=n=>'₹'+Number(n).toLocaleString('en-IN',{maximumFractionDigits:0});
const SH=n=>{n=Math.abs(n)>=1e7?(n/1e7).toFixed(2)+' Cr':Math.abs(n)>=1e5?(n/1e5).toFixed(2)+' L':n.toLocaleString('en-IN',{maximumFractionDigits:0});return '₹'+n.toString().replace(/^-/,'')};
const fmtC=n=>n>=1e7?'₹'+(n/1e7).toFixed(2)+' Cr':n>=1e5?'₹'+(n/1e5).toFixed(2)+' L':INR(n);
const N=n=>Number(n).toLocaleString('en-IN');
const PAL=['#1565c0','#0f9d9a','#5c6bc0','#26a69a','#42a5f5','#7e57c2','#ef6c00','#8d6e63','#78909c','#c0ca33'];
const F={from:0,to:D.months.length-1,state:'',city:'',cat:'',status:''};
const PAGES=['Executive Overview','Sales Performance','Customers','Products','Geography','Operations & Returns','Payments & Marketing','Executive Summary'];
let page=0,charts=[];
function $(h){const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild}
// ---- filtered aggregation (month, city, status, [category]) ----
function agg(){const useCat=F.cat!=='';const ci=D.cats.indexOf(F.cat),si=D.sts.indexOf(F.status);
 const ok=(m,c,s)=>m>=F.from&&m<=F.to&&(!F.state||D.c2s[D.cities[c]]===F.state)&&(!F.city||D.cities[c]===F.city)&&(F.status===''||s===si);
 const rows=useCat?D.CC.filter(r=>r[3]===ci&&ok(r[0],r[1],r[2])).map(r=>({m:r[0],c:r[1],s:r[2],n:r[4],v:r[5]})):D.OC.filter(r=>ok(r[0],r[1],r[2])).map(r=>({m:r[0],c:r[1],s:r[2],n:r[3],v:r[4]}));
 const catRows=D.CC.filter(r=>ok(r[0],r[1],r[2])&&(!useCat||r[3]===ci));return{rows,catRows,useCat}}
const sum=(a,f)=>a.reduce((x,y)=>x+f(y),0);
function group(rows,key,val){const o={};rows.forEach(r=>{const k=key(r);o[k]=(o[k]||0)+val(r)});return o}
function mk(id,cfg){const el=document.getElementById(id);if(!el)return;cfg.options=Object.assign({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:cfg.type==='doughnut'||(cfg.data.datasets.length>1),labels:{boxWidth:10,color:getComputedStyle(document.body).color}}}},cfg.options||{});
 if(cfg.type!=='doughnut'){cfg.options.scales=Object.assign({x:{ticks:{color:'#7a8aa6',maxRotation:60,autoSkip:true},grid:{display:false}},y:{ticks:{color:'#7a8aa6'},grid:{color:'#8883'}}},cfg.options.scales||{})}
 if(cfg.options.indexAxis==='y'){cfg.options.scales.y.ticks.autoSkip=false;cfg.options.scales.x.ticks.maxTicksLimit=6;cfg.options.scales.x.ticks.maxRotation=0;cfg.options.scales.x.grid={color:'#8883'};cfg.options.scales.y.grid={display:false}}
 const fmtT=v=>v>=1e7?'₹'+(v/1e7).toFixed(v>=1e8?0:1).replace(/\.0$/,'')+' Cr':v>=1e5?'₹'+(v/1e5).toFixed(0)+' L':'₹'+v;
 const mx=Math.max(...cfg.data.datasets.flatMap(d=>d.data.filter(v=>v!=null)));const money=mx>=1e6&&cfg.type!=='doughnut';
 if(money){const va=cfg.options.indexAxis==='y'?'x':'y';cfg.options.scales[va].ticks.callback=fmtT;cfg.options.scales[va].title={display:true,text:'₹ (L = lakh, Cr = crore)',color:'#7a8aa6'}}
 cfg.options.plugins=cfg.options.plugins||{};cfg.options.plugins.tooltip={callbacks:{label:c=>{const dn=c.dataset.label;const val=typeof c.parsed==='number'?c.parsed:(cfg.options.indexAxis==='y'?c.parsed.x:c.parsed.y);const t=money?INR(val):N(+Number(val).toFixed(2));return (dn?dn:c.label)+': '+t}}}
 charts.push(new Chart(el,cfg))}
const cv=(id,t)=>`<div class="card"><h3>${t}</h3><div class="cv"><canvas id="${id}"></canvas></div></div>`;
const kpi=(l,v)=>`<div class="card kpi"><div class="v">${v}</div><div class="l">${l}</div></div>`;
const bar=(id,labels,vals,o={})=>mk(id,{type:'bar',data:{labels,datasets:[{data:vals,backgroundColor:o.color||'#1565c0',borderRadius:3}]},options:Object.assign({indexAxis:o.h?'y':'x'},o.opt||{})});
const line=(id,labels,sets)=>mk(id,{type:'line',data:{labels,datasets:sets.map((s,i)=>({label:s.l,data:s.d,borderColor:PAL[i],backgroundColor:PAL[i]+'22',tension:.25,pointRadius:0,borderWidth:2,fill:sets.length===1}))}});
const donut=(id,labels,vals)=>mk(id,{type:'doughnut',data:{labels,datasets:[{data:vals,backgroundColor:PAL}]},options:{plugins:{legend:{position:'right'}}}});
const ins=(arr)=>`<div class="card ins"><h3>Insights (what, where, why it matters, action)</h3><ul>${arr.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
const fnote='<div class="note">Filters above change this page. Revenue = order final amount (item value + shipping + tax). With a category filter, revenue = item revenue for that category (shipping/tax cannot be split by category).</div>';
const staticNote='<div class="note">This page always shows the full period (Jan 2023 – Dec 2025); global filters do not apply here.</div>';
// ---- pages ----
const P=[];
P[0]=()=>{const a=agg();const rev=sum(a.rows,r=>r.v),ord=sum(a.rows,r=>r.n);const del=sum(a.rows.filter(r=>D.sts[r.s]==='Delivered'),r=>r.v);
 const mon=group(a.rows,r=>r.m,r=>r.v),mo=group(a.rows,r=>r.m,r=>r.n),ms=D.months.slice(F.from,F.to+1);
 const rc={};a.catRows.forEach(r=>rc[D.cats[r[3]]]=(rc[D.cats[r[3]]]||0)+r[5]);const rcs=Object.entries(rc).sort((x,y)=>y[1]-x[1]).slice(0,10);
 const st=group(a.rows,r=>D.sts[r.s],r=>r.n);const cty=Object.entries(group(a.rows,r=>D.cities[r.c],r=>r.v)).sort((x,y)=>y[1]-x[1]).slice(0,10);
 document.getElementById('main').innerHTML=`<div class="kpis">${kpi('Total revenue (selected)',fmtC(rev))}${kpi('Total orders',N(ord))}${kpi('Average order value',INR(ord?rev/ord:0))}${kpi('Delivered revenue',fmtC(del))}${kpi('Registered customers (all)',N(D.cust.total))}</div>${fnote}
 <div class="grid">${cv('c1','Revenue trend (monthly)')}${cv('c2','Orders trend (monthly)')}${cv('c3','Item revenue by category (top 10)')}${cv('c4','Revenue by city (top 10)')}${cv('c5','Order status distribution')}${cv('c6','Top 10 products by item revenue (all time)')}</div>
 <div class="card ins" style="margin-top:12px"><h3>Key reading (full dataset, not affected by filters)</h3><ul><li>Default revenue (₹257.3 Cr) counts every order, including Failed (₹7.18 Cr) and Cancelled (₹20.3 Cr). Use the Order status filter to see Delivered only (₹208.4 Cr).</li><li>Electronics alone is about half of item revenue, so overall results depend heavily on one category.</li></ul></div>`;
 line('c1',ms,[{l:'Revenue',d:ms.map(m=>mon[D.months.indexOf(m)]||0)}]);line('c2',ms,[{l:'Orders',d:ms.map(m=>mo[D.months.indexOf(m)]||0)}]);
 bar('c3',rcs.map(x=>x[0]),rcs.map(x=>x[1]),{h:1,color:'#0f9d9a'});bar('c4',cty.map(x=>x[0]),cty.map(x=>x[1]),{h:1});donut('c5',Object.keys(st),Object.values(st));
 bar('c6',D.top.map(x=>x[0].slice(0,28)),D.top.map(x=>x[2]),{h:1,color:'#5c6bc0'})};
P[1]=()=>{const a=agg();const ms=D.months;const mon=group(a.rows,r=>r.m,r=>r.v),mo=group(a.rows,r=>r.m,r=>r.n);
 const yr={};a.rows.forEach(r=>{const y=D.months[r.m].slice(0,4),mm=+D.months[r.m].slice(5)-1;(yr[y]=yr[y]||Array(12).fill(0))[mm]+=r.v});
 const q={};a.rows.forEach(r=>{const k=D.months[r.m].slice(0,4)+' Q'+Math.ceil(+D.months[r.m].slice(5)/3);q[k]=(q[k]||0)+r.v});
 const aov=D.months.map((m,i)=>mo[i]?mon[i]/mo[i]:null);const idx=D.months.map((m,i)=>i).filter(i=>i>=F.from&&i<=F.to);
 const rc={};a.catRows.forEach(r=>rc[D.cats[r[3]]]=(rc[D.cats[r[3]]]||0)+r[5]);const rcs=Object.entries(rc).sort((x,y)=>y[1]-x[1]);
 document.getElementById('main').innerHTML=fnote+`<div class="grid">${cv('s1','Monthly revenue')}${cv('s2','Year-over-year revenue by month')}${cv('s3','Quarterly revenue')}${cv('s4','Monthly order volume')}${cv('s5','Average order value trend')}${cv('s6','Item revenue by category (top 15)')}${cv('s7','Best 10 products (item revenue, all time)')}${cv('s8','Lowest 10 products (item revenue, all time)')}</div>`+
 ins(['<b>What:</b> 2025 revenue (₹119.4 Cr) is about 74% higher than 2024 (₹68.5 Cr), while 2023 and 2024 are almost flat (₹69.4 Cr and ₹68.5 Cr). Order count jumps from ~26.7K to 46.5K.','<b>Why it matters:</b> the 2025 jump is a feature of how this synthetic data was generated, so do not present it as real market growth. In an interview, say so clearly.','<b>Action idea:</b> in a real business, check whether growth came from more customers, more orders per customer, or higher order value before planning stock and marketing.']);
 line('s1',idx.map(i=>ms[i]),[{l:'Revenue',d:idx.map(i=>mon[i]||0)}]);
 mk('s2',{type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],datasets:Object.keys(yr).map((y,i)=>({label:y,data:yr[y],borderColor:PAL[i],tension:.25,pointRadius:2}))}});
 bar('s3',Object.keys(q),Object.values(q));bar('s4',idx.map(i=>ms[i]),idx.map(i=>mo[i]||0),{color:'#0f9d9a'});line('s5',idx.map(i=>ms[i]),[{l:'AOV',d:idx.map(i=>aov[i])}]);
 bar('s6',rcs.slice(0,15).map(x=>x[0]),rcs.slice(0,15).map(x=>x[1]),{h:1,color:'#0f9d9a'});bar('s7',D.top.map(x=>x[0].slice(0,26)),D.top.map(x=>x[2]),{h:1,color:'#5c6bc0'});bar('s8',D.bot.map(x=>x[0].slice(0,26)),D.bot.map(x=>x[2]),{h:1,color:'#ef6c00'})};
P[2]=()=>{const c=D.cust;const nr=c.nr;
 document.getElementById('main').innerHTML=staticNote+`<div class="kpis">${kpi('Registered customers',N(c.total))}${kpi('Purchasing customers',N(c.buyers))}${kpi('Repeat (2+ valid orders)',N(c.repeat))}${kpi('One-time',N(c.one))}${kpi('Never purchased',N(c.never))}${kpi('Top 10% of buyers share of revenue',c.top10+'%')}</div>
 <div class="warn"><b>Definitions.</b> A purchase is any order that is not <i>Failed</i>. Repeat = 2 or more such orders; one-time = exactly 1; never purchased = 0. 120 customers placed only Failed orders and are counted as never purchased. Revenue share uses order final amount of non-failed orders. No lifetime value is claimed.</div>
 <div class="grid">${cv('u1','Customer type')}${cv('u2','Purchase frequency (valid orders per buyer, 10 = 10+)')}${cv('u3','Customer segment (from dataset)')}${cv('u4','Customer status (from dataset)')}${cv('u5','New vs returning buyers by year (distinct customers)')}${cv('u6','Registered customers by state')}</div>`+
 ins(['<b>What:</b> 82% of buyers (18,695 of 22,700) ordered more than once, and the top 10% of buyers bring 38.6% of revenue.','<b>Status:</b> 13,365 customers (53%) are labelled Churned and only 7,234 Active. In a real business that would be the first thing to investigate.','<b>Caution:</b> "New" in 2023 equals everyone because the data starts in 2023, so only 2024 and 2025 are meaningful for new-versus-returning.','<b>Action idea:</b> win-back offers for At Risk (2,101) customers and loyalty perks for the high-value top 10%.']);
 donut('u1',['Repeat','One-time','Never purchased'],[c.repeat,c.one,c.never]);bar('u2',Object.keys(c.fq),Object.values(c.fq));donut('u3',Object.keys(c.seg),Object.values(c.seg));donut('u4',Object.keys(c.status),Object.values(c.status));
 mk('u5',{type:'bar',data:{labels:nr.map(x=>x[0]),datasets:[{label:'New customers (first valid order that year)',data:nr.map(x=>x[1]),backgroundColor:'#1565c0'},{label:'Returning customers',data:nr.map(x=>x[2]),backgroundColor:'#0f9d9a'}]}});bar('u6',Object.keys(c.states),Object.values(c.states),{h:1,color:'#0f9d9a'})};
P[3]=()=>{
 document.getElementById('main').innerHTML=staticNote+`<div class="grid">${cv('p1','Price band (number of products)')}${cv('p2','Average rating by category (product table)')}<div class="card"><h3>Top 10 products</h3>${tbl(D.top)}</div><div class="card"><h3>Lowest 10 products</h3>${tbl(D.bot)}</div></div>`+
 ins(['<b>What:</b> one product (Chaudhry, Advanced Smartwatche) earns ₹52.1 Cr, about 21% of all item revenue, and Electronics is ~₹122.4 Cr of ₹245.0 Cr (50%).','<b>Why it matters:</b> a single product this dominant is unusual and likely a generator artefact. Rankings are product-level sums from order items (no duplicate joins).','<b>Low performers:</b> the bottom 10 are mostly Grocery, Personal Care and Stationery items with under ₹20K each, so decide per product whether to promote, bundle or drop.','Ratings come from the product table (rating_average); review records link to orders and products but were not used to avoid mixing sources.']);
 bar('p1',Object.keys(D.pb),Object.values(D.pb));bar('p2',Object.keys(D.rt),Object.values(D.rt),{h:1,color:'#0f9d9a'})};
const tbl=a=>`<div style="overflow-x:auto"><table style="width:100%;font-size:12px;border-collapse:collapse"><tr style="text-align:left;color:var(--mu)"><th>Product</th><th>Category</th><th>Revenue</th><th>Qty</th></tr>${a.map(x=>`<tr style="border-top:1px solid var(--bd)"><td>${x[0]}</td><td>${x[1]}</td><td>${fmtC(x[2])}</td><td>${N(x[3])}</td></tr>`).join('')}</table></div>`;
P[4]=()=>{const a=agg();const sr=group(a.rows,r=>D.c2s[D.cities[r.c]],r=>r.v),so=group(a.rows,r=>D.c2s[D.cities[r.c]],r=>r.n),cr=group(a.rows,r=>D.cities[r.c],r=>r.v);
 const ss=Object.entries(sr).sort((x,y)=>y[1]-x[1]),cs=Object.entries(cr).sort((x,y)=>y[1]-x[1]).slice(0,15),tot=sum(ss,x=>x[1]);
 document.getElementById('main').innerHTML=fnote+`<div class="note">Geography uses the order delivery state/city. Customer counts by state use the customer's registered state (93.6% match delivery state).</div><div class="grid">${cv('g1','Revenue by state')}${cv('g2','Orders by state')}${cv('g3','Registered customers by state (all time)')}${cv('g4','Revenue by city (top 15)')}</div>`+
 ins([`<b>What:</b> Maharashtra leads with ₹36.0 Cr (14% of revenue), followed by Uttar Pradesh (₹28.0 Cr) and Gujarat (₹27.2 Cr). Bihar has the fewest customers (431).`,'<b>Why it matters:</b> revenue is spread across 15 states, so no single state creates a risk, but low-customer states (Bihar) show where acquisition could grow.','<b>Action idea:</b> focus delivery speed and local offers on the top three states; test acquisition campaigns in Bihar.',`<b>Current selection:</b> top state is ${ss[0]?ss[0][0]:'-'} at ${ss[0]?(ss[0][1]/tot*100).toFixed(1):0}% of selected revenue.`]);
 bar('g1',ss.map(x=>x[0]),ss.map(x=>x[1]),{h:1});bar('g2',ss.map(x=>x[0]),ss.map(x=>so[x[0]]),{h:1,color:'#0f9d9a'});bar('g3',Object.keys(D.cust.states),Object.values(D.cust.states),{h:1,color:'#5c6bc0'});bar('g4',cs.map(x=>x[0]),cs.map(x=>x[1]),{h:1,color:'#26a69a'})};
P[5]=()=>{const o=D.ops;
 document.getElementById('main').innerHTML=staticNote+`<div class="kpis">${kpi('Shipments',N(89681))}${kpi('Avg delivery days (delivered)',o.days)}${kpi('Delayed deliveries',o.delay+'%')}${kpi('Return records',N(o.nret))}${kpi('Return rate (orders)',o.rate+'%')}</div>
 <div class="warn"><b>Definitions.</b> Return rate = orders with at least one return record (${N(o.rord)}) ÷ delivered or returned orders (${N(o.elig)}). Delayed = actual delivery later than expected, among Delivered shipments. 910 delivery_days values do not equal actual minus dispatch date in the source, so I report the dataset values as given.</div>
 <div class="grid">${cv('o1','Shipment status')}${cv('o2','Return reasons')}${cv('o3','Returns by category (top 10)')}${cv('o4','Return records by month')}${cv('o5','Return request status')}</div>`+
 ins(['<b>What:</b> 42.8% of delivered shipments arrived after the expected date, with an average of 4.1 days from dispatch.','<b>Returns:</b> Fashion has 3,185 return records, far above other categories (Electronics 1,232), and monthly returns more than doubled to 740–874 in the last three months of 2025.','<b>Data issue:</b> 2,458 return records belong to orders whose status is Delivered, not Returned, and 6,681 orders have Returned status versus 9,510 orders with return records. The two sources are not fully consistent.','<b>Action idea:</b> review sizing information for Fashion (Size issue is the top reason) and check carrier performance for late deliveries.']);
 donut('o1',Object.keys(o.ship),Object.values(o.ship));bar('o2',Object.keys(o.reasons),Object.values(o.reasons),{h:1,color:'#ef6c00'});bar('o3',Object.keys(o.rcat),Object.values(o.rcat),{h:1});line('o4',D.months,[{l:'Returns',d:o.rm}]);donut('o5',Object.keys(o.rstatus),Object.values(o.rstatus))};
P[6]=()=>{const y=D.pay,m=D.mkt;const pm=Object.entries(y.m);const ch=Object.entries(m.ch);
 document.getElementById('main').innerHTML=staticNote+`<div class="kpis">${kpi('Campaigns',m.ncamp)}${kpi('Campaign-attributed orders',N(m.orders)+' ('+m.share+'%)')}${kpi('Attributed revenue',fmtC(m.rev))}${kpi('Campaign cost (dataset)',fmtC(m.cost))}</div>
 <div class="warn"><b>Careful.</b> Attributed revenue is the total of orders tagged with a campaign. It is <b>not</b> incremental revenue (we do not know what those customers would have bought anyway), so this is not true marketing ROI. The revenue ÷ cost ratio below is simple, not profit.</div>
 <div class="grid">${cv('y1','Payment method (number of payments)')}${cv('y2','Amount paid by method')}${cv('y3','Payment status')}${cv('y4','Attributed revenue by channel')}${cv('y5','Attributed revenue ÷ cost by channel')}${cv('y6','Coupon usage (orders)')}${cv('y7','Orders by discount band (%)')}</div>`+
 ins(['<b>What:</b> UPI is the most used method (31,971 payments, ₹78.1 Cr), then Cash on Delivery (17,274) and Credit Card (15,063).','<b>Payments:</b> 82,137 succeeded, 10,690 were refunded and 5,068 failed. Failed, Not Charged and Pending payments carry ₹0 captured amount.','<b>Marketing:</b> Organic Search earns the most attributed revenue (₹7.67 Cr, about 5.3x its cost); Facebook costs ₹3.79 Cr for ₹4.09 Cr attributed (ratio about 1.1).','<b>Action idea:</b> invest in channels with higher attributed revenue per rupee, but run a holdout test before calling anything profitable.']);
 bar('y1',pm.map(x=>x[0]),pm.map(x=>x[1][0]),{h:1});bar('y2',pm.map(x=>x[0]),pm.map(x=>x[1][1]),{h:1,color:'#0f9d9a'});donut('y3',Object.keys(y.s),Object.values(y.s));
 bar('y4',ch.map(x=>x[0]),ch.map(x=>x[1][2]),{h:1,color:'#5c6bc0'});bar('y5',ch.map(x=>x[0]),ch.map(x=>+(x[1][2]/x[1][1]).toFixed(2)),{h:1,color:'#26a69a'});bar('y6',Object.keys(m.coupon),Object.values(m.coupon),{color:'#ef6c00'});bar('y7',Object.keys(m.disc),Object.values(m.disc))};
P[7]=()=>{document.getElementById('main').innerHTML=`<div class="card ins"><h3>Executive summary (synthetic dataset)</h3><ol>
<li><b>Revenue definition matters.</b> Total order value is ₹257.26 Cr (matches your Power BI card). Delivered-only revenue is ₹208.43 Cr. Failed, Cancelled and Returned orders add the rest.</li>
<li><b>The 2,880-order gap is explained.</b> It equals the Failed orders exactly. The customer table (and your earlier EDA) leaves out Failed orders: 97,120 + 2,880 = 100,000.</li>
<li><b>Revenue gap explained.</b> Repeat ₹241.05 Cr + one-time ₹9.03 Cr = ₹250.08 Cr, which is total ₹257.26 Cr minus Failed ₹7.18 Cr.</li>
<li><b>2025 is much bigger</b> (₹119.4 Cr vs ₹68.5 Cr in 2024) mainly from higher order count: a generator feature, not real growth.</li>
<li><b>Electronics is half of item revenue</b> and one smartwatch product is about 21%. High concentration risk.</li>
<li><b>Customers:</b> 18,695 repeat, 4,005 one-time, 2,300 never purchased; top 10% of buyers bring 38.6% of revenue; 53% are labelled Churned.</li>
<li><b>Delivery:</b> 42.8% of delivered shipments were late.</li>
<li><b>Returns:</b> 10.9% of delivered or returned orders have a return record; Fashion leads and returns surged in late 2025.</li>
<li><b>Payments:</b> UPI leads; 5,068 payments failed.</li>
<li><b>Marketing:</b> 17.2% of orders carry a campaign tag (₹43.6 Cr attributed). This is attribution, not incremental ROI.</li></ol></div>`};
// ---- UI ----
function ui(){const t=document.getElementById('tabs');PAGES.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{page=i;render()};t.appendChild(b)});
 const f=document.getElementById('filters');const opt=(a,all)=>'<option value="">'+all+'</option>'+a.map(x=>`<option>${x}</option>`).join('');
 const mo=D.months.map((m,i)=>`<option value="${i}">${m}</option>`).join('');
 f.innerHTML=`<label>From month<select id="f0">${mo}</select></label><label>To month<select id="f1">${mo}</select></label><label>State<select id="f2">${opt([...new Set(Object.values(D.c2s))].sort(),'All states')}</select></label><label>City<select id="f3">${opt(D.cities,'All cities')}</select></label><label>Category<select id="f4">${opt(D.cats,'All categories')}</select></label><label>Order status<select id="f5">${opt(D.sts,'All statuses')}</select></label>`;
 document.getElementById('f1').value=D.months.length-1;
 f.onchange=()=>{F.from=+f0.value;F.to=+f1.value;if(F.from>F.to){F.to=F.from;f1.value=F.to}F.state=f2.value;F.city=f3.value;F.cat=f4.value;F.status=f5.value;if(F.city&&F.state&&D.c2s[F.city]!==F.state){F.city='';f3.value=''}render()}}
function render(){charts.forEach(c=>c.destroy());charts=[];[...document.getElementById('tabs').children].forEach((b,i)=>b.classList.toggle('on',i===page));document.getElementById('filters').style.display=[0,1,4].includes(page)?'flex':'none';P[page]()}
ui();render();
