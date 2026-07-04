-- Seed catalog. Run AFTER schema.sql. Safe to re-run: skips if already seeded.
-- Prices are curated estimates (ZAR) — update any time via the /admin page.

do $seed$
declare
  cat jsonb; itm jsonb; ret jsonb;
  v_cat_id uuid; v_item_id uuid;
  v_cat_sort int := 0; v_item_sort int;
  catalog jsonb := $catalog$
[
 {"name":"Sleep","icon":"🌙","items":[
  {"slug":"crib-sheets","name":"Fitted crib sheets (3–4)","retailers":[
   {"store":"Takealot","price":450,"url":"https://www.takealot.com/all?qsearch=fitted%20crib%20sheet"},
   {"store":"Baby City","price":499,"url":"https://www.babycity.co.za/catalogsearch/result/?q=fitted+cot+sheet"}]},
  {"slug":"sleep-sacks","name":"Sleep sacks / swaddles","retailers":[
   {"store":"Takealot","price":399,"url":"https://www.takealot.com/all?qsearch=baby%20sleep%20sack"},
   {"store":"Woolworths","price":450,"url":"https://www.woolworths.co.za/cat?Ntt=baby+swaddle"}]},
  {"slug":"sound-machine","name":"White noise / sound machine","retailers":[
   {"store":"Takealot","price":699,"url":"https://www.takealot.com/all?qsearch=white%20noise%20machine%20baby"},
   {"store":"Baby City","price":799,"url":"https://www.babycity.co.za/catalogsearch/result/?q=sound+machine"}]},
  {"slug":"night-light","name":"Night light","retailers":[
   {"store":"Takealot","price":299,"url":"https://www.takealot.com/all?qsearch=nursery%20night%20light"},
   {"store":"Checkers","price":249,"url":"https://www.checkers.co.za/search/all?q=night%20light"}]}]},
 {"name":"Feeding","icon":"🍼","items":[
  {"slug":"baby-bottles","name":"Baby bottles","retailers":[
   {"store":"Takealot","price":399,"url":"https://www.takealot.com/all?qsearch=baby%20bottles"},
   {"store":"Baby City","price":450,"url":"https://www.babycity.co.za/catalogsearch/result/?q=baby+bottles"}]},
  {"slug":"bottle-brush","name":"Bottle brush","retailers":[
   {"store":"Checkers","price":89,"url":"https://www.checkers.co.za/search/all?q=bottle%20brush"},
   {"store":"Takealot","price":119,"url":"https://www.takealot.com/all?qsearch=bottle%20brush"}]},
  {"slug":"burp-cloths","name":"Burp cloths","retailers":[
   {"store":"Takealot","price":179,"url":"https://www.takealot.com/all?qsearch=burp%20cloths"},
   {"store":"Woolworths","price":199,"url":"https://www.woolworths.co.za/cat?Ntt=burp+cloth"}]},
  {"slug":"nursing-pillow","name":"Nursing pillow","retailers":[
   {"store":"Takealot","price":549,"url":"https://www.takealot.com/all?qsearch=nursing%20pillow"},
   {"store":"Baby City","price":699,"url":"https://www.babycity.co.za/catalogsearch/result/?q=nursing+pillow"}]},
  {"slug":"breast-pump","name":"Breast pump","retailers":[
   {"store":"Takealot","price":1499,"url":"https://www.takealot.com/all?qsearch=breast%20pump"},
   {"store":"Baby City","price":1799,"url":"https://www.babycity.co.za/catalogsearch/result/?q=breast+pump"}]},
  {"slug":"milk-storage-bags","name":"Milk storage bags","retailers":[
   {"store":"Takealot","price":159,"url":"https://www.takealot.com/all?qsearch=breast%20milk%20storage%20bags"},
   {"store":"Baby City","price":189,"url":"https://www.babycity.co.za/catalogsearch/result/?q=milk+storage+bags"}]},
  {"slug":"bibs","name":"Bibs","retailers":[
   {"store":"Pick n Pay Baby","price":99,"url":"https://www.pnp.co.za/search/baby%20bibs"},
   {"store":"Woolworths","price":129,"url":"https://www.woolworths.co.za/cat?Ntt=baby+bibs"}]},
  {"slug":"bottle-warmer","name":"Bottle warmer","retailers":[
   {"store":"Takealot","price":549,"url":"https://www.takealot.com/all?qsearch=bottle%20warmer"},
   {"store":"Baby City","price":649,"url":"https://www.babycity.co.za/catalogsearch/result/?q=bottle+warmer"}]},
  {"slug":"bottle-sterilizer","name":"Bottle sterilizer","retailers":[
   {"store":"Takealot","price":899,"url":"https://www.takealot.com/all?qsearch=bottle%20sterilizer"},
   {"store":"Baby City","price":999,"url":"https://www.babycity.co.za/catalogsearch/result/?q=steriliser"}]},
  {"slug":"sippy-cups","name":"Sippy cups","retailers":[
   {"store":"Checkers","price":129,"url":"https://www.checkers.co.za/search/all?q=sippy%20cup"},
   {"store":"Takealot","price":149,"url":"https://www.takealot.com/all?qsearch=sippy%20cup"}]}]},
 {"name":"Diapering","icon":"🧷","items":[
  {"slug":"newborn-diapers","name":"Newborn diapers","retailers":[
   {"store":"Pick n Pay Baby","price":189,"url":"https://www.pnp.co.za/search/newborn%20nappies"},
   {"store":"Checkers","price":199,"url":"https://www.checkers.co.za/search/all?q=newborn%20nappies"},
   {"store":"Takealot","price":209,"url":"https://www.takealot.com/all?qsearch=newborn%20nappies"}]},
  {"slug":"baby-wipes","name":"Baby wipes","retailers":[
   {"store":"Pick n Pay Baby","price":89,"url":"https://www.pnp.co.za/search/baby%20wipes"},
   {"store":"Checkers","price":99,"url":"https://www.checkers.co.za/search/all?q=baby%20wipes"}]},
  {"slug":"rash-cream","name":"Diaper rash cream","retailers":[
   {"store":"Checkers","price":79,"url":"https://www.checkers.co.za/search/all?q=bum%20cream"},
   {"store":"Pick n Pay Baby","price":89,"url":"https://www.pnp.co.za/search/nappy%20rash%20cream"}]},
  {"slug":"changing-pad","name":"Changing pad","retailers":[
   {"store":"Takealot","price":349,"url":"https://www.takealot.com/all?qsearch=baby%20changing%20pad"},
   {"store":"Baby City","price":399,"url":"https://www.babycity.co.za/catalogsearch/result/?q=changing+mat"}]},
  {"slug":"diaper-caddy","name":"Diaper caddy organizer","retailers":[
   {"store":"Takealot","price":329,"url":"https://www.takealot.com/all?qsearch=nappy%20caddy"},
   {"store":"Baby City","price":399,"url":"https://www.babycity.co.za/catalogsearch/result/?q=nappy+caddy"}]},
  {"slug":"wet-bags","name":"Wet bags","retailers":[
   {"store":"Takealot","price":199,"url":"https://www.takealot.com/all?qsearch=wet%20bag%20baby"},
   {"store":"Baby City","price":249,"url":"https://www.babycity.co.za/catalogsearch/result/?q=wet+bag"}]},
  {"slug":"diaper-pail","name":"Diaper pail","retailers":[
   {"store":"Takealot","price":799,"url":"https://www.takealot.com/all?qsearch=nappy%20bin"},
   {"store":"Baby City","price":899,"url":"https://www.babycity.co.za/catalogsearch/result/?q=nappy+bin"}]},
  {"slug":"diaper-bag","name":"Diaper bag","retailers":[
   {"store":"Takealot","price":899,"url":"https://www.takealot.com/all?qsearch=nappy%20bag"},
   {"store":"Baby City","price":1099,"url":"https://www.babycity.co.za/catalogsearch/result/?q=nappy+bag"}]}]},
 {"name":"On the Go","icon":"🚼","items":[
  {"slug":"car-seat","name":"Infant car seat","retailers":[
   {"store":"Takealot","price":2499,"url":"https://www.takealot.com/all?qsearch=infant%20car%20seat"},
   {"store":"Baby City","price":2999,"url":"https://www.babycity.co.za/catalogsearch/result/?q=infant+car+seat"}]},
  {"slug":"stroller","name":"Stroller","retailers":[
   {"store":"Takealot","price":3499,"url":"https://www.takealot.com/all?qsearch=baby%20stroller"},
   {"store":"Baby City","price":3999,"url":"https://www.babycity.co.za/catalogsearch/result/?q=stroller"}]},
  {"slug":"baby-carrier","name":"Baby carrier / wrap","retailers":[
   {"store":"Takealot","price":899,"url":"https://www.takealot.com/all?qsearch=baby%20carrier"},
   {"store":"Baby City","price":1199,"url":"https://www.babycity.co.za/catalogsearch/result/?q=baby+carrier"}]},
  {"slug":"rain-cover","name":"Car seat rain cover","retailers":[
   {"store":"Takealot","price":299,"url":"https://www.takealot.com/all?qsearch=car%20seat%20rain%20cover"},
   {"store":"Baby City","price":349,"url":"https://www.babycity.co.za/catalogsearch/result/?q=rain+cover"}]},
  {"slug":"backseat-mirror","name":"Backseat mirror","retailers":[
   {"store":"Takealot","price":249,"url":"https://www.takealot.com/all?qsearch=baby%20car%20mirror"},
   {"store":"Baby City","price":299,"url":"https://www.babycity.co.za/catalogsearch/result/?q=car+mirror"}]}]},
 {"name":"Bath & Care","icon":"🛁","items":[
  {"slug":"hooded-towels","name":"Hooded towels","retailers":[
   {"store":"Takealot","price":199,"url":"https://www.takealot.com/all?qsearch=baby%20hooded%20towel"},
   {"store":"Woolworths","price":249,"url":"https://www.woolworths.co.za/cat?Ntt=hooded+towel"}]},
  {"slug":"washcloths","name":"Washcloths","retailers":[
   {"store":"Pick n Pay Baby","price":79,"url":"https://www.pnp.co.za/search/baby%20washcloths"},
   {"store":"Woolworths","price":99,"url":"https://www.woolworths.co.za/cat?Ntt=baby+face+cloths"}]},
  {"slug":"baby-wash","name":"Fragrance-free baby wash","retailers":[
   {"store":"Checkers","price":69,"url":"https://www.checkers.co.za/search/all?q=baby%20wash"},
   {"store":"Pick n Pay Baby","price":79,"url":"https://www.pnp.co.za/search/baby%20wash"},
   {"store":"Woolworths","price":89,"url":"https://www.woolworths.co.za/cat?Ntt=baby+wash"}]},
  {"slug":"nail-care","name":"Baby nail file / clippers","retailers":[
   {"store":"Takealot","price":149,"url":"https://www.takealot.com/all?qsearch=baby%20nail%20clippers"},
   {"store":"Baby City","price":179,"url":"https://www.babycity.co.za/catalogsearch/result/?q=nail+clippers"}]},
  {"slug":"nasal-aspirator","name":"Nasal aspirator","retailers":[
   {"store":"Takealot","price":199,"url":"https://www.takealot.com/all?qsearch=nasal%20aspirator"},
   {"store":"Baby City","price":249,"url":"https://www.babycity.co.za/catalogsearch/result/?q=nasal+aspirator"}]},
  {"slug":"hairbrush","name":"Soft hairbrush","retailers":[
   {"store":"Takealot","price":129,"url":"https://www.takealot.com/all?qsearch=baby%20hairbrush"},
   {"store":"Woolworths","price":149,"url":"https://www.woolworths.co.za/cat?Ntt=baby+brush"}]}]},
 {"name":"Play & Development","icon":"🧸","items":[
  {"slug":"contrast-cards","name":"High-contrast cards","retailers":[
   {"store":"Takealot","price":199,"url":"https://www.takealot.com/all?qsearch=high%20contrast%20baby%20cards"},
   {"store":"Baby City","price":249,"url":"https://www.babycity.co.za/catalogsearch/result/?q=flash+cards"}]},
  {"slug":"cloth-books","name":"Soft cloth books","retailers":[
   {"store":"Takealot","price":179,"url":"https://www.takealot.com/all?qsearch=baby%20cloth%20book"},
   {"store":"Woolworths","price":229,"url":"https://www.woolworths.co.za/cat?Ntt=cloth+book"}]},
  {"slug":"wooden-teethers","name":"Wooden teethers","retailers":[
   {"store":"Takealot","price":149,"url":"https://www.takealot.com/all?qsearch=wooden%20teether"},
   {"store":"Baby City","price":199,"url":"https://www.babycity.co.za/catalogsearch/result/?q=teether"}]},
  {"slug":"rattles","name":"Rattles & toys","retailers":[
   {"store":"Takealot","price":199,"url":"https://www.takealot.com/all?qsearch=baby%20rattle"},
   {"store":"Woolworths","price":249,"url":"https://www.woolworths.co.za/cat?Ntt=baby+rattle"}]}]},
 {"name":"Starting Solids","icon":"🥣","items":[
  {"slug":"high-chair","name":"High chair with footrest","retailers":[
   {"store":"Takealot","price":1499,"url":"https://www.takealot.com/all?qsearch=high%20chair"},
   {"store":"Baby City","price":1799,"url":"https://www.babycity.co.za/catalogsearch/result/?q=high+chair"}]},
  {"slug":"silicone-bibs","name":"Silicone bibs","retailers":[
   {"store":"Takealot","price":129,"url":"https://www.takealot.com/all?qsearch=silicone%20bib"},
   {"store":"Checkers","price":159,"url":"https://www.checkers.co.za/search/all?q=silicone%20bib"}]},
  {"slug":"suction-plates","name":"Suction plates & bowls","retailers":[
   {"store":"Takealot","price":249,"url":"https://www.takealot.com/all?qsearch=suction%20plate%20baby"},
   {"store":"Baby City","price":299,"url":"https://www.babycity.co.za/catalogsearch/result/?q=suction+plate"}]},
  {"slug":"open-cup","name":"Open cup","retailers":[
   {"store":"Takealot","price":99,"url":"https://www.takealot.com/all?qsearch=baby%20open%20cup"},
   {"store":"Baby City","price":129,"url":"https://www.babycity.co.za/catalogsearch/result/?q=training+cup"}]},
  {"slug":"straw-cup","name":"Straw training cup","retailers":[
   {"store":"Takealot","price":149,"url":"https://www.takealot.com/all?qsearch=straw%20training%20cup"},
   {"store":"Baby City","price":179,"url":"https://www.babycity.co.za/catalogsearch/result/?q=straw+cup"}]},
  {"slug":"food-maker","name":"Baby food maker","retailers":[
   {"store":"Takealot","price":1299,"url":"https://www.takealot.com/all?qsearch=baby%20food%20maker"},
   {"store":"Baby City","price":1499,"url":"https://www.babycity.co.za/catalogsearch/result/?q=food+maker"}]}]},
 {"name":"Clothing","icon":"👶","items":[
  {"slug":"sleepers","name":"Sleepers / pajamas (0–3m)","retailers":[
   {"store":"Pick n Pay Baby","price":249,"url":"https://www.pnp.co.za/search/baby%20sleepsuit"},
   {"store":"Woolworths","price":299,"url":"https://www.woolworths.co.za/cat?Ntt=baby+sleepsuit"}]},
  {"slug":"bodysuits","name":"Bodysuits / onesies (0–3m)","retailers":[
   {"store":"Pick n Pay Baby","price":199,"url":"https://www.pnp.co.za/search/baby%20bodyvest"},
   {"store":"Woolworths","price":249,"url":"https://www.woolworths.co.za/cat?Ntt=baby+bodysuit"}]},
  {"slug":"socks-mittens","name":"Socks & mittens","retailers":[
   {"store":"Pick n Pay Baby","price":79,"url":"https://www.pnp.co.za/search/baby%20socks"},
   {"store":"Woolworths","price":99,"url":"https://www.woolworths.co.za/cat?Ntt=baby+socks+mittens"}]},
  {"slug":"hats","name":"Hats","retailers":[
   {"store":"Pick n Pay Baby","price":69,"url":"https://www.pnp.co.za/search/baby%20beanie"},
   {"store":"Woolworths","price":89,"url":"https://www.woolworths.co.za/cat?Ntt=baby+hat"}]},
  {"slug":"cardigan","name":"Cardigan or sweater","retailers":[
   {"store":"Takealot","price":199,"url":"https://www.takealot.com/all?qsearch=baby%20cardigan"},
   {"store":"Woolworths","price":229,"url":"https://www.woolworths.co.za/cat?Ntt=baby+cardigan"}]},
  {"slug":"going-home-outfit","name":"Going-home outfit","retailers":[
   {"store":"Baby City","price":299,"url":"https://www.babycity.co.za/catalogsearch/result/?q=newborn+outfit"},
   {"store":"Woolworths","price":349,"url":"https://www.woolworths.co.za/cat?Ntt=newborn+outfit"}]}]},
 {"name":"Health & Safety","icon":"🩺","items":[
  {"slug":"first-aid-kit","name":"First aid kit","retailers":[
   {"store":"Takealot","price":349,"url":"https://www.takealot.com/all?qsearch=baby%20first%20aid%20kit"},
   {"store":"Baby City","price":399,"url":"https://www.babycity.co.za/catalogsearch/result/?q=first+aid"}]},
  {"slug":"baby-monitor","name":"Baby monitor","retailers":[
   {"store":"Takealot","price":1299,"url":"https://www.takealot.com/all?qsearch=baby%20monitor"},
   {"store":"Baby City","price":1599,"url":"https://www.babycity.co.za/catalogsearch/result/?q=baby+monitor"}]},
  {"slug":"humidifier","name":"Humidifier","retailers":[
   {"store":"Takealot","price":699,"url":"https://www.takealot.com/all?qsearch=humidifier%20nursery"},
   {"store":"Baby City","price":799,"url":"https://www.babycity.co.za/catalogsearch/result/?q=humidifier"}]},
  {"slug":"grooming-kit","name":"Grooming kit","retailers":[
   {"store":"Takealot","price":249,"url":"https://www.takealot.com/all?qsearch=baby%20grooming%20kit"},
   {"store":"Baby City","price":299,"url":"https://www.babycity.co.za/catalogsearch/result/?q=grooming+kit"}]},
  {"slug":"medicine-dispenser","name":"Baby-safe medicine dispenser","retailers":[
   {"store":"Takealot","price":79,"url":"https://www.takealot.com/all?qsearch=baby%20medicine%20dispenser"},
   {"store":"Baby City","price":99,"url":"https://www.babycity.co.za/catalogsearch/result/?q=medicine+dispenser"}]}]},
 {"name":"Nursery & Extras","icon":"🪑","items":[
  {"slug":"laundry-hamper","name":"Laundry hamper","retailers":[
   {"store":"Takealot","price":299,"url":"https://www.takealot.com/all?qsearch=nursery%20laundry%20hamper"},
   {"store":"Woolworths","price":349,"url":"https://www.woolworths.co.za/cat?Ntt=laundry+hamper"}]},
  {"slug":"drawer-organizers","name":"Drawer organizers","retailers":[
   {"store":"Takealot","price":249,"url":"https://www.takealot.com/all?qsearch=drawer%20organizer%20baby"},
   {"store":"Woolworths","price":299,"url":"https://www.woolworths.co.za/cat?Ntt=drawer+organiser"}]},
  {"slug":"bouncer","name":"Bouncer or baby swing","retailers":[
   {"store":"Takealot","price":1199,"url":"https://www.takealot.com/all?qsearch=baby%20bouncer"},
   {"store":"Baby City","price":1399,"url":"https://www.babycity.co.za/catalogsearch/result/?q=bouncer"}]},
  {"slug":"milestone-cards","name":"Milestone cards","retailers":[
   {"store":"Takealot","price":199,"url":"https://www.takealot.com/all?qsearch=baby%20milestone%20cards"},
   {"store":"Baby City","price":249,"url":"https://www.babycity.co.za/catalogsearch/result/?q=milestone+cards"}]},
  {"slug":"diaper-fund","name":"Diaper fund (gift card)","retailers":[
   {"store":"Takealot","price":500,"url":"https://www.takealot.com/gift-vouchers"},
   {"store":"Checkers","price":500,"url":"https://www.checkers.co.za/gift-cards"}]},
  {"slug":"meal-delivery","name":"Meal delivery gift card","retailers":[
   {"store":"Woolworths","price":500,"url":"https://www.woolworths.co.za/dept/Gifting/_/N-1z13rvv"},
   {"store":"Checkers","price":500,"url":"https://www.checkers.co.za/gift-cards"}]}]}
]
  $catalog$::jsonb;
begin
  if (select count(*) from categories) > 0 then
    raise notice 'Catalog already seeded — skipping.';
    return;
  end if;

  for cat in select * from jsonb_array_elements(catalog) loop
    v_cat_sort := v_cat_sort + 1;
    insert into categories (name, icon, sort_order)
    values (cat->>'name', cat->>'icon', v_cat_sort)
    returning id into v_cat_id;

    v_item_sort := 0;
    for itm in select * from jsonb_array_elements(cat->'items') loop
      v_item_sort := v_item_sort + 1;
      insert into items (category_id, name, icon_path, sort_order)
      values (v_cat_id, itm->>'name', 'icons/' || (itm->>'slug') || '.svg', v_item_sort)
      returning id into v_item_id;

      for ret in select * from jsonb_array_elements(itm->'retailers') loop
        insert into retailers (item_id, store, price_zar, url)
        values (v_item_id, ret->>'store', (ret->>'price')::numeric, ret->>'url');
      end loop;
    end loop;
  end loop;

  raise notice 'Seeded % categories.', v_cat_sort;
end $seed$;
