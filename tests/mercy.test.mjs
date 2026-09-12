import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exampleNeeds, works } from '../mercy/assets/needs.mjs';
import { resources, resourcesForNeed, topicsForNeed } from '../mercy/assets/resources.mjs';
import { escapeHTML, parseAmount, filterNeeds, readCorner, saveCorner, storageKey } from '../mercy/assets/core.mjs';

test('the full fourteen works are available with distinct identifiers',()=>{
  assert.equal(new Set(works.map(w=>w.id)).size,14);
  assert.equal(works.filter(w=>w.family==='corporal').length,7);
  assert.equal(works.filter(w=>w.family==='spiritual').length,7);
  assert.ok(exampleNeeds.every(n=>n.example && works.some(w=>w.id===n.workId)));
});
test('small gifts include the five-dollar meal and twenty-five-dollar transport example',()=>{
  assert.deepEqual(filterNeeds(exampleNeeds,{kind:'small'}).map(n=>n.id),['a-meal-today','gas-for-work']);
});
test('combined search, work, and gift-type filters do not lose meaning',()=>{
  assert.deepEqual(filterNeeds(exampleNeeds,{query:'MATTRESS',work:'shelter',kind:'money'}).map(n=>n.id),['a-bed-of-my-own']);
  assert.equal(filterNeeds(exampleNeeds,{query:'MATTRESS',kind:'prayer'}).length,0);
  assert.deepEqual(filterNeeds(exampleNeeds,{work:'pray'}).map(n=>n.id),['prayer-for-family']);
});
test('amount sorting leaves nonmonetary gifts available and never changes the source order',()=>{
  const before=exampleNeeds.map(n=>n.id);
  const sorted=filterNeeds(exampleNeeds,{sort:'high'});
  assert.equal(sorted[0].goalCents,1000000);
  assert.equal(sorted.at(-1).kind,'goods');
  assert.deepEqual(exampleNeeds.map(n=>n.id),before);
});
test('money is handled as cents with strict precision and reasonable bounds',()=>{
  for(const [input,cents] of [['5',500],['25.01',2501],['0.29',29],['0.01',1],['100000',10000000]]) assert.equal(parseAmount(input),cents);
  for(const input of ['',0,-5,'1.001','1e2','Infinity','NaN','1,000','100000.01']) assert.equal(parseAmount(input),null);
});
test('housing examples get specific referrals rather than generic housing matches',()=>{
  for(const [id,resource] of [['a-bed-of-my-own','furniture'],['keep-our-home','housing'],['a-small-start','sba']]) {
    assert.equal(resourcesForNeed(exampleNeeds.find(n=>n.id===id))[0].id,resource);
  }
  assert.ok(resourcesForNeed(exampleNeeds.find(n=>n.id==='gas-for-work')).some(r=>r.id==='mn211'));
  assert.ok(!resourcesForNeed(exampleNeeds.find(n=>n.id==='gas-for-work')).some(r=>r.id==='housing'));
});
test('new private draft matching recognizes a mattress or transportation need',()=>{
  assert.deepEqual(topicsForNeed({title:'A mattress and frame',story:'',workId:'shelter'}),['furniture']);
  assert.deepEqual(topicsForNeed({title:'A bus ride',story:'',workId:'shelter'}),['transport']);
});
test('the curated catalog has distinct first-party HTTPS links and scope information',()=>{
  assert.equal(resources.length,14);
  assert.equal(new Set(resources.map(r=>r.id)).size,14);
  for(const r of resources){assert.equal(new URL(r.url).protocol,'https:');assert.ok(r.area && r.cost && r.organization);}
});
test('user-provided markup is escaped before it can become HTML',()=>{
  assert.equal(escapeHTML('<img src=x onerror="attack()">&\''),'&lt;img src=x onerror=&quot;attack()&quot;&gt;&amp;&#39;');
});
test('missing, corrupt, or blocked storage does not stop public browsing',()=>{
  const empty={version:1,drafts:[],plans:[]};
  for(const content of [null,'broken','{}','{"version":2,"drafts":[],"plans":[]}','{"version":1,"drafts":[{}],"plans":[{}]}']) assert.deepEqual(readCorner({getItem:()=>content}),empty);
  assert.deepEqual(readCorner(null),empty);
  assert.deepEqual(readCorner({getItem(){throw new Error('blocked')}}),empty);
  assert.equal(saveCorner({setItem(){throw new Error('full')}},empty),false);
});
test('anonymous giving preferences round-trip locally without inventing a transaction',()=>{
  let stored;
  const storage={getItem:key=>key===storageKey?stored:null,setItem:(key,value)=>{assert.equal(key,storageKey);stored=value;}};
  const p={id:'test-plan',needId:'a-meal-today',title:'A warm meal today',kind:'money',amountCents:500,delivery:'service',visibility:'anonymous',donor:'',message:'A private idea'};
  assert.equal(saveCorner(storage,{version:1,drafts:[],plans:[p]}),true);
  assert.deepEqual(readCorner(storage).plans,[p]);
  assert.equal(exampleNeeds[0].illustratedCents,0);
});
test('generated pages resolve links and assets under a project subpath',()=>{
  const root=fileURLToPath(new URL('../',import.meta.url));
  for(const name of ['index','resources','works','project','my-corner']) {
    const path=resolve(root,'mercy',name+'.html');
    const html=readFileSync(path,'utf8');
    assert.doesNotMatch(html,/<\/[a-z][a-z0-9]*\s+[^>\s][^>]*>/i,`${name}: malformed closing tag`);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,`${name}: duplicate element ID`);
    for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
      const href=m[1];if(/^(?:https?:|tel:|#)/.test(href))continue;
      assert.ok(!href.startsWith('/'),`${name}: root-absolute URL breaks a project site`);
      const target=href.split(/[?#]/)[0];
      assert.ok(existsSync(resolve(dirname(path),target)),`${name}: missing ${href}`);
    }
    assert.ok(html.includes("connect-src 'none'"),`${name}: local drafts must not be transmitted`);
    assert.ok(!/<script[^>]+src="https?:/i.test(html));
  }
});
test('the original lamp experience remains available from the existing homepage',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(html.includes('id="lab"') && html.includes('id="testCircuit"') && html.includes('id="mapIdea"'));
  assert.ok(html.includes('href="mercy/"'));
});
