# Rebuilds dashboard/data/data.js from the 9 source CSVs.
# Run from the repo root:  python dashboard/src/build_data.py raw_data
import pandas as pd, json
import os,sys
D=(sys.argv[1] if len(sys.argv)>1 else 'raw_data').rstrip('/')+'/'
r=lambda f:pd.read_csv(D+f+'.csv')
c,o,oi,p,pay,sh,ret,rv,mk=[r(x) for x in ['customers','orders','order_items','products','payments','shipments','returns','customer_reviews','marketing_campaigns']]
o['m']=o.order_date.str[:7]
months=sorted(o.m.unique()); mi={m:i for i,m in enumerate(months)}
cities=sorted(o.delivery_city.unique()); c2s=o.drop_duplicates('delivery_city').set_index('delivery_city').delivery_state.to_dict()
sts=sorted(o.order_status.unique())
cats=sorted(p.category.unique())
oc=o.groupby(['m','delivery_city','order_status']).final_amount.agg(['count','sum']).reset_index()
OC=[[mi[a.m],cities.index(a.delivery_city),sts.index(a.order_status),int(a['count']),round(a['sum'])] for _,a in oc.iterrows()]
x=oi.merge(p[['product_id','category']],on='product_id').merge(o[['order_id','m','delivery_city','order_status']],on='order_id')
g=x.groupby(['m','delivery_city','order_status','category']).agg(n=('order_id','nunique'),rev=('item_revenue','sum'),q=('quantity','sum')).reset_index()
CC=[[mi[a.m],cities.index(a.delivery_city),sts.index(a.order_status),cats.index(a.category),int(a.n),round(a.rev),int(a.q)] for _,a in g.iterrows()]
# products
pr=oi.groupby('product_id').agg(rev=('item_revenue','sum'),q=('quantity','sum')).join(p.set_index('product_id')[['product_name','category','price','rating_average']]).reset_index()
pr=pr.sort_values('rev',ascending=False)
P=lambda d:[[a.product_name,a.category,round(a.rev),int(a.q)] for _,a in d.iterrows()]
bins=[0,500,1000,2500,5000,10000,25000,50000,1e9]; bl=['<500','500-1K','1-2.5K','2.5-5K','5-10K','10-25K','25-50K','>50K']
pb=pd.cut(p.price,bins,labels=bl,right=False).value_counts().reindex(bl)
rt=p.groupby('category').rating_average.mean().round(2)
# customers
nf=o[o.order_status!='Failed']; cust=nf.groupby('customer_id').final_amount.agg(['count','sum']).sort_values('sum',ascending=False)
top10=cust['sum'].head(int(len(cust)*.1)).sum()/cust['sum'].sum()
fq=cust['count'].clip(upper=10).value_counts().sort_index()
first=nf.groupby('customer_id').order_date.min().str[:4]
nr=[]
for y in ['2023','2024','2025']:
    d=nf[nf.order_date.str[:4]==y].drop_duplicates('customer_id'); f=first.reindex(d.customer_id).values==y
    nr.append([y,int(f.sum()),int((~f).sum())])
cs=c.groupby('state').size().sort_values(ascending=False)
# ops
shv=sh.delivery_status.value_counts(); dl=sh[sh.delivery_status=='Delivered']
rr=ret.merge(o[['order_id','m']],on='order_id'); rrc=ret.merge(p[['product_id','category']],on='product_id')
rm=rr.groupby('m').size().reindex(months,fill_value=0)
elig=o.order_status.isin(['Delivered','Returned']).sum(); rord=ret.order_id.nunique()
# payments
pm=pay.groupby('payment_method').agg(n=('payment_id','count'),amt=('amount_paid','sum')).sort_values('n',ascending=False)
ps=pay.payment_status.value_counts()
# marketing
a=o[o.campaign_id.notna()].merge(mk[['campaign_id','channel','campaign_cost']],on='campaign_id')
ch=mk.groupby('channel').agg(camps=('campaign_id','count'),cost=('campaign_cost','sum'),rev=('revenue_generated','sum'),conv=('conversions','sum')).sort_values('rev',ascending=False)
cp=o.coupon_code.value_counts()
db=pd.cut(o.discount_percentage,[-1,0,5,10,15,20,100],labels=['0','1-5','6-10','11-15','16-20','>20']).value_counts().sort_index()
R=lambda s:{str(k):(round(float(v),2) if v==v else 0) for k,v in s.items()}
data=dict(months=months,cities=cities,c2s=c2s,sts=sts,cats=cats,OC=OC,CC=CC,
 top=P(pr.head(10)),bot=P(pr.tail(10).iloc[::-1]),pb=R(pb),rt=R(rt.sort_values()),
 cust=dict(total=len(c),buyers=len(cust),repeat=int((cust['count']>1).sum()),one=int((cust['count']==1).sum()),never=len(c)-len(cust),
   seg=R(c.customer_segment.value_counts()),status=R(c.customer_status.value_counts()),fq=R(fq),top10=round(top10*100,1),nr=nr,states=R(cs),
   failedonly=int(o[o.order_status=='Failed'].customer_id.nunique()-len(set(o[o.order_status=='Failed'].customer_id)&set(nf.customer_id)))),
 ops=dict(ship=R(shv),delay=round(dl.delayed_flag.mean()*100,1),days=round(dl.delivery_days.mean(),2),ndel=len(dl),
  reasons=R(ret.return_reason.value_counts()),rcat=R(rrc.category.value_counts().head(10)),rm=[int(v) for v in rm],rstatus=R(ret.return_status.value_counts()),
  nret=len(ret),rord=int(rord),elig=int(elig),rate=round(rord/elig*100,1),
  stat_ret_orders=int((o.order_status=='Returned').sum()),ret_on_delivered=int(ret.merge(o[['order_id','order_status']]).order_status.eq('Delivered').sum())),
 pay=dict(m={k:[int(v.n),round(v.amt)] for k,v in pm.iterrows()},s=R(ps),fail_amt_zero=True),
 mkt=dict(ncamp=len(mk),orders=len(a),rev=round(a.final_amount.sum()),cost=round(mk.campaign_cost.sum()),share=round(len(a)/len(o)*100,1),
   ch={k:[int(v.camps),round(v.cost),round(v.rev),int(v.conv)] for k,v in ch.iterrows()},coupon=R(cp),disc=R(db)),
 tot=dict(gross=round(o.final_amount.sum()),orders=len(o),cust=len(c),sub=round(o.subtotal.sum())))
json.dump(data,open(os.devnull,'w'),separators=(',',':'))
open('dashboard/data/data.js','w').write('window.DATA='+json.dumps(data,separators=(',',':'))+';')
print('Wrote dashboard/data/data.js')
