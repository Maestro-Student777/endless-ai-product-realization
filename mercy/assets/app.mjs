import { exampleNeeds, works, workById } from './needs.mjs';
import { resources, topics, resourcesForNeed } from './resources.mjs';
import { escapeHTML as e, money, parseAmount, filterNeeds, readCorner, saveCorner } from './core.mjs';

const page = document.body.dataset.page;
const main = document.querySelector('#main');
const modal = document.querySelector('#modal');
const labels = { money:'Money', time:'Time', goods:'An item', prayer:'Prayer' };
let storage;
try { storage = window.localStorage; } catch { storage = null; }
let corner = readCorner(storage);
let noticeTimer;
const params = new URLSearchParams(location.search);
const state = { query:'', work:works.some(w => w.id === params.get('work')) ? params.get('work') : 'all', kind:'all', sort:'featured' };
const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const findNeed = id => exampleNeeds.find(n => n.id === id) || corner.drafts.find(n => n.id === id);
const initials = name => name.split(/\s+/).filter(Boolean).slice(0,2).map(n => n[0]).join('');
const publicNeedURL = id => new URL(`index.html?need=${encodeURIComponent(id)}`, location.href).href;
const external = (url, label, className='') => `<a href="${e(url)}" class="${className}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true"> ↗</span></a>`;

function notify(message) {
  clearTimeout(noticeTimer);
  document.querySelector('#notice').textContent = message;
  noticeTimer = setTimeout(() => { document.querySelector('#notice').textContent = ''; },7000);
}
function openDialog(title, contents) {
  if (modal.open) modal.close();
  modal.innerHTML = `<div class="modal-inner"><div class="modal-heading"><h2 id="modal-title">${e(title)}</h2><button class="close-button" data-action="close" aria-label="Close dialog">×</button></div>${contents}</div>`;
  modal.showModal();
}
function writeCorner(next) {
  if (!saveCorner(storage,next)) { notify('This browser could not save your changes. Your form is still open.'); return false; }
  corner = next;
  return true;
}
function options(items, value) { return items.map(([v,l]) => `<option value="${e(v)}"${v === value ? ' selected' : ''}>${e(l)}</option>`).join(''); }
const workOptions = value => options(works.map(w => [w.id,w.name]),value);
const kindOptions = value => options(Object.entries(labels),value);
function relatedResources(need) {
  return `<div class="related-list">${resourcesForNeed(need).map(r => external(r.url,`<strong>${e(r.name)}</strong><span>${e(r.organization)} · ${e(r.area)}</span>`,'related-link')).join('')}</div>`;
}
function card(need) {
  const url = `index.html?need=${encodeURIComponent(need.id)}`;
  return `<article class="need-card"><div class="card-top"><span class="category">${e(workById(need.workId).short)}</span><span class="example-tag">Example story</span></div><div class="card-content"><div class="person"><span class="avatar" aria-hidden="true">${e(initials(need.name))}</span><div><strong>${e(need.name)}</strong><small>${e(need.city)}</small></div></div><h3><a href="${url}">${e(need.title)}</a></h3><p class="card-story">${e(need.story)}</p><div class="card-bottom"><div class="amount">${need.kind === 'money' ? money(need.goalCents) : e(labels[need.kind])}<small>${need.kind === 'money' ? 'example goal' : 'can make a difference'}</small></div><a class="card-link" href="${url}">Meet this neighbor <span aria-hidden="true">→</span></a><p class="resource-count">${resourcesForNeed(need).length} helpful resources alongside this story</p></div></div></article>`;
}
function renderBoard() {
  const needs = filterNeeds(exampleNeeds,state);
  document.querySelector('#need-cards').innerHTML = needs.length ? needs.map(card).join('') : '<div class="empty"><h2>No stories match yet</h2><p>Try another search or explore all of the example needs.</p><button class="button" data-action="reset-filters">Show all needs</button></div>';
  document.querySelector('#need-count').textContent = `${needs.length} example ${needs.length === 1 ? 'story' : 'stories'} · People can give and receive in the same community`;
  document.querySelectorAll('[data-work]').forEach(b => { b.classList.toggle('active', b.dataset.work === state.work); b.setAttribute('aria-pressed',String(b.dataset.work === state.work)); });
  document.querySelector('#work-filter').value = state.work;
}
function startBoard() {
  if (params.has('need')) { renderDetail(params.get('need')); return; }
  document.querySelector('#desktop-works').innerHTML = ['corporal','spiritual'].map(f => `<h3>${f === 'corporal' ? 'Corporal works' : 'Spiritual works'}</h3>${works.filter(w => w.family === f).map(w => `<button class="work-filter" data-work="${w.id}" aria-pressed="false">${e(w.name)}</button>`).join('')}`).join('');
  document.querySelector('#work-filter').innerHTML = '<option value="all">All works of mercy</option>'+workOptions('all');
  for (const [id,key] of [['need-search','query'],['need-kind','kind'],['need-sort','sort'],['work-filter','work']]) {
    document.querySelector('#'+id).addEventListener(key === 'query' ? 'input' : 'change', event => { state[key] = event.target.value; renderBoard(); });
  }
  renderBoard();
}
const wordResources = { meal:'foodbank', groceries:'foodbank', food:'foodbank', gas:'mn211', fuel:'mn211', ride:'mn211', transportation:'211', mattress:'furniture', frame:'furniture', furniture:'furniture', mortgage:'housing', housing:'housing', business:'sba', equipment:'sba', mentoring:'sba', prayer:'spiritual', prayers:'spiritual', grieving:'eldercare', boots:'mn211' };
function storyWithLinks(story) {
  const seen = new Set();
  return story.split(/\b(meal|groceries|food|gas|fuel|ride|transportation|mattress|frame|furniture|mortgage|housing|business|equipment|mentoring|prayer|prayers|grieving|boots)\b/gi).map(part => {
    const id = wordResources[part.toLowerCase()];
    if (!id || seen.has(id)) return e(part);
    seen.add(id);
    const r = resources.find(r => r.id === id);
    return `<a class="inline-link" href="${e(r.url)}" target="_blank" rel="noopener noreferrer" title="${e(r.name)} — ${e(r.organization)}">${e(part)}</a>`;
  }).join('');
}
function renderDetail(id) {
  const need = findNeed(id);
  if (!need) { main.innerHTML = '<div class="intro"><h1>This story is not available.</h1><p>Saved drafts only open in the browser where they were created.</p><a class="button primary" href="index.html">Explore example needs</a></div>'; return; }
  document.title = `${need.title} | Endless AI Mercy Network`;
  main.innerHTML = `<div class="detail-top"><a class="back" href="${need.example ? 'index.html' : 'my-corner.html'}">← ${need.example ? 'Back to all needs' : 'Back to my corner'}</a>${need.example ? `<button class="button small" data-action="share-need" data-id="${e(need.id)}">Share this example ↗</button>` : '<span class="tag">Draft saved on this device</span>'}</div><div class="detail-layout"><article class="profile-sheet"><div class="profile-band"><span class="avatar" aria-hidden="true">${e(initials(need.name))}</span><div><strong>${e(need.name)}</strong><small>${e(need.city)}</small></div></div><div class="profile-body"><div class="eyebrow">${e(workById(need.workId).name)} · ${need.example ? 'Example story' : 'Unpublished draft'}</div><h1>${e(need.title)}</h1><label class="check-label"><input type="checkbox" id="story-links" checked>Show helpful links in this story</label><p id="need-story">${storyWithLinks(need.story)}</p><h2>What would help</h2><p class="purpose">${e(need.purpose || (need.kind === 'money' ? money(need.goalCents) : labels[need.kind]))}</p>${need.canOffer ? `<div class="offer"><h2>I have something to give, too</h2><p>${e(need.canOffer)}</p></div>` : ''}<h2>Places to start today</h2><p>These organizations may offer another way forward. Open a source to check its service area and next steps.</p>${relatedResources(need)}<p><a href="resources.html">Explore the full resource guide →</a></p></div></article><aside class="give-panel"><div class="eyebrow">${need.kind === 'money' ? 'A little help adds up' : 'Every gift matters'}</div><div class="amount">${need.kind === 'money' ? money(need.goalCents) : e(labels[need.kind])}</div><p>${need.kind === 'money' ? (need.example ? 'Illustrative goal for this example.' : 'Your draft goal.') : 'Presence and practical help have value.'}</p><button class="button primary" data-action="plan" data-id="${e(need.id)}">${need.example ? 'Plan a way to help' : 'Preview a giving plan'} <span aria-hidden="true">→</span></button><a class="button" href="resources.html">Find existing help</a><p class="fine">Plans stay on your device. No money is collected and no message is sent.</p></aside></div>`;
  document.querySelector('#story-links').addEventListener('change', event => { document.querySelector('#need-story').innerHTML = event.target.checked ? storyWithLinks(need.story) : e(need.story); });
}
function startResources() {
  const topicSelect = document.querySelector('#resource-topic');
  topicSelect.innerHTML = '<option value="all">Every kind of help</option>'+options(Object.entries(topics), params.get('topic'));
  const filter = () => {
    const q = document.querySelector('#resource-search').value.toLowerCase().trim();
    const topic = topicSelect.value;
    const area = document.querySelector('#resource-area').value;
    let shown = 0;
    document.querySelectorAll('[data-resource]').forEach(card => {
      const r = resources.find(r => r.id === card.dataset.resource);
      const matches = (topic === 'all' || r.topics.includes(topic)) && (area === 'all' || r.area === area || (area === 'United States' && r.area.startsWith('United States'))) && (!q || [r.name,r.organization,r.description,r.area,...r.topics.map(t => topics[t])].join(' ').toLowerCase().includes(q));
      card.hidden = !matches;
      if (matches) shown++;
    });
    document.querySelector('#resource-count').textContent = `${shown} ${shown === 1 ? 'resource' : 'resources'} · Links updated September 25, 2026`;
    document.querySelector('#resource-empty').hidden = shown > 0;
  };
  ['resource-topic','resource-area'].forEach(id => document.querySelector('#'+id).addEventListener('change',filter));
  document.querySelector('#resource-search').addEventListener('input',filter);
  filter();
}
function draftForm(id) {
  const n = corner.drafts.find(n => n.id === id);
  if (!n && corner.drafts.length >= 50) { notify('You have 50 saved drafts. Remove one in My corner to make room.'); return; }
  openDialog(n ? 'Edit your need' : 'Everyone can ask for help',`<p class="modal-intro">Write a draft in your own words. Saving keeps it only in this browser; it does not post it publicly.</p><form id="draft-form"><div class="form-grid"><label class="field">Name or alias<input name="name" maxlength="60" value="${e(n?.name || '')}" placeholder="A neighbor" autocomplete="off"></label><label class="field">City or general area<input name="city" maxlength="80" value="${e(n?.city || '')}" placeholder="Optional; no street address" autocomplete="off"></label><label class="field full">What would help?<input name="title" required maxlength="100" value="${e(n?.title || '')}" placeholder="A little gas to get to work"></label><label class="field">Kind of help<select name="kind" id="draft-kind">${kindOptions(n?.kind || 'money')}</select></label><label class="field" id="draft-amount-field">Goal in US dollars<input name="amount" id="draft-amount" type="number" min="0.01" max="100000" step="0.01" inputmode="decimal" required value="${n?.goalCents ? n.goalCents / 100 : ''}" placeholder="25"></label><label class="field full">Work of mercy<select name="workId">${workOptions(n?.workId || 'shelter')}</select></label><label class="field full">Your story<textarea name="story" required maxlength="1400" placeholder="Share what you feel comfortable sharing.">${e(n?.story || '')}</textarea><small>Please leave out account numbers, private documents, and exact addresses.</small></label><label class="field full">Something you can offer, if you like<textarea name="canOffer" maxlength="300" placeholder="A skill, a listening ear, or a prayer">${e(n?.canOffer || '')}</textarea></label></div><p class="error-text" id="form-error" role="alert"></p><div class="form-actions"><button class="button primary" type="submit">Save draft on this device</button><button class="button" type="button" data-action="close">Cancel</button></div></form>`);
  const form = document.querySelector('#draft-form');
  const toggle = () => { const isMoney = form.elements.kind.value === 'money'; document.querySelector('#draft-amount-field').hidden = !isMoney; form.elements.amount.disabled = !isMoney; };
  form.elements.kind.addEventListener('change',toggle); toggle();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const amount = values.kind === 'money' ? parseAmount(values.amount) : 0;
    const error = document.querySelector('#form-error');
    if (amount === null) { error.textContent = 'Enter an amount from $0.01 to $100,000 with up to two decimal places.'; return; }
    if (!String(values.title).trim() || !String(values.story).trim()) { error.textContent = 'Please add a title and a short story.'; return; }
    const draft = { id:n?.id || 'draft-'+uid(), name:String(values.name).trim() || 'A neighbor',city:String(values.city).trim() || 'Location kept private',title:String(values.title).trim(),story:String(values.story).trim(),workId:values.workId,kind:values.kind,goalCents:amount,illustratedCents:0,purpose:values.kind === 'money' ? `Draft goal · ${money(amount)}` : labels[values.kind],canOffer:String(values.canOffer).trim(),example:false,status:'open',createdAt:n?.createdAt || new Date().toISOString() };
    const next = { ...corner, drafts:n ? corner.drafts.map(d => d.id === n.id ? draft : d) : [...corner.drafts,draft] };
    if (!writeCorner(next)) return;
    modal.close();
    if (page === 'corner') renderCorner();
    notify('Draft saved on this device. Find it in My corner.');
  });
}
function planForm(id) {
  const need = findNeed(id); if (!need) return;
  if (corner.plans.length >= 100) { notify('You have 100 saved plans. Remove one in My corner to make room.'); return; }
  openDialog('Choose a way to help',`<p class="modal-intro">For <strong>${e(need.title)}</strong>. This is a personal plan for exploring the idea. It does not send a gift or contact anyone.</p><form id="plan-form"><div class="form-grid"><label class="field">I could offer<select name="kind">${kindOptions(need.kind)}</select></label><label class="field" id="plan-amount-field">Amount in US dollars<input name="amount" type="number" min="0.01" max="100000" step="0.01" inputmode="decimal" required value="${need.kind === 'money' ? Math.min(need.goalCents / 100,25) : ''}"></label><fieldset class="full"><legend>How I would like it to reach them</legend><label class="radio-label"><input type="radio" name="delivery" value="direct" checked>Directly to the person</label><label class="radio-label"><input type="radio" name="delivery" value="service">Through an organization coordinating the help</label></fieldset><fieldset class="full"><legend>What the recipient would see</legend><label class="radio-label"><input type="radio" name="visibility" value="named" checked>My name or chosen alias</label><label class="radio-label"><input type="radio" name="visibility" value="anonymous">An anonymous gift</label><p class="help" id="anonymous-help" hidden>Anonymous means hidden from the recipient. A future coordinator or payment provider may still know the donor.</p></fieldset><label class="field full" id="donor-field">Name or alias for this plan<input name="donor" maxlength="60" placeholder="A friend" autocomplete="off"></label><label class="field full">A note to yourself<textarea name="message" maxlength="500" placeholder="For example: I could offer a fuel card or a ride."></textarea></label></div><p class="error-text" id="form-error" role="alert"></p><div class="form-actions"><button class="button primary" type="submit">Save plan on this device</button><button class="button" type="button" data-action="close">Cancel</button></div><p class="help">No payment is collected. These delivery and privacy choices are a preview of the proposed service.</p></form>`);
  const form = document.querySelector('#plan-form');
  const toggle = () => {
    const isMoney = form.elements.kind.value === 'money';
    const anonymous = form.elements.visibility.value === 'anonymous';
    document.querySelector('#plan-amount-field').hidden = !isMoney;
    form.elements.amount.disabled = !isMoney;
    document.querySelector('#donor-field').hidden = anonymous;
    form.elements.donor.disabled = anonymous;
    document.querySelector('#anonymous-help').hidden = !anonymous;
  };
  form.addEventListener('change',toggle);toggle();
  form.addEventListener('submit',event => {
    event.preventDefault();
    const v = Object.fromEntries(new FormData(form));
    const amount = v.kind === 'money' ? parseAmount(v.amount) : 0;
    if (amount === null) { document.querySelector('#form-error').textContent = 'Enter an amount from $0.01 to $100,000 with up to two decimal places.'; return; }
    const plan = { id:uid(),needId:need.id,title:need.title,kind:v.kind,amountCents:amount,delivery:v.delivery,visibility:v.visibility,donor:v.visibility === 'anonymous' ? '' : String(v.donor || '').trim(),message:String(v.message || '').trim(),createdAt:new Date().toISOString() };
    if (!writeCorner({...corner,plans:[...corner.plans,plan]})) return;
    modal.close();if (page === 'corner') renderCorner();notify('Plan saved in My corner. No gift or message has been sent.');
  });
}
function renderCorner() {
  document.querySelector('#saved-drafts').innerHTML = corner.drafts.length ? corner.drafts.map(n => `<article class="saved-card"><span class="tag">Unpublished draft</span><h3>${e(n.title)}</h3><p>${e(n.name)} · ${e(n.city)}<br>${n.kind === 'money' ? money(n.goalCents) : e(labels[n.kind])}</p><div class="actions"><a class="button small" href="index.html?need=${encodeURIComponent(n.id)}">Preview</a><button class="button small" data-action="edit-draft" data-id="${e(n.id)}">Edit</button><button class="button small danger" data-action="delete-draft" data-id="${e(n.id)}">Remove</button></div></article>`).join('') : '<div class="empty"><h3>Your story can start here.</h3><p>Prepare a need in your own words. It stays on this device.</p><button class="button" data-action="draft">Draft a need</button></div>';
  document.querySelector('#saved-plans').innerHTML = corner.plans.length ? corner.plans.map(p => `<article class="saved-card"><span class="tag">Personal plan · Not sent</span><h3>${e(p.title)}</h3><p>${p.kind === 'money' ? money(p.amountCents) : e(labels[p.kind])} · ${p.visibility === 'anonymous' ? 'Anonymous to recipient' : e(p.donor || 'Named gift')}<br>${p.delivery === 'service' ? 'Through a coordinating organization' : 'Directly to the person'}</p>${p.message ? `<p>${e(p.message)}</p>` : ''}<div class="actions">${findNeed(p.needId) ? `<a class="button small" href="index.html?need=${encodeURIComponent(p.needId)}">View story</a>` : ''}<button class="button small danger" data-action="delete-plan" data-id="${e(p.id)}">Remove</button></div></article>`).join('') : '<div class="empty"><h3>What could you give?</h3><p>A small gift, an item, your time, or a prayer. Save an idea while you explore.</p><a class="button" href="index.html">Explore needs</a></div>';
  document.querySelector('#draft-total').textContent = corner.drafts.length;
  document.querySelector('#plan-total').textContent = corner.plans.length;
  document.querySelector('#clear-corner').disabled = !corner.drafts.length && !corner.plans.length;
}
function confirmRemoval(kind,id) {
  openDialog(kind === 'all' ? 'Clear My corner?' : 'Remove this saved item?',`<p class="modal-intro">This removes ${kind === 'all' ? 'all Mercy Network drafts and plans' : 'this item'} from this browser. It cannot be undone.</p><div class="actions"><button class="button danger" id="confirm-remove">Remove${kind === 'all' ? ' everything' : ''}</button><button class="button" data-action="close" autofocus>Keep it</button></div>`);
  document.querySelector('#confirm-remove').addEventListener('click',() => {
    const next = kind === 'all' ? {version:1,drafts:[],plans:[]} : kind === 'draft' ? {...corner,drafts:corner.drafts.filter(n => n.id !== id)} : {...corner,plans:corner.plans.filter(p => p.id !== id)};
    if (!writeCorner(next)) return;
    modal.close();renderCorner();notify('Removed from this device.');
  });
}
async function copyURL(url) {
  try { await navigator.clipboard.writeText(url); notify('Link copied. Anyone can open it in a regular browser.'); }
  catch { openDialog('Copy this link',`<p class="modal-intro">Anyone can open this page in a regular browser.</p><label class="field">Shareable link<input id="share-url" readonly value="${e(url)}"></label><p class="help">Select and copy the link, then paste it into your message.</p>`);const input=document.querySelector('#share-url');input.focus();input.select(); }
}
document.addEventListener('click',event => {
  const work = event.target.closest('[data-work]');
  if (work) { state.work=work.dataset.work;renderBoard();return; }
  const button = event.target.closest('[data-action]');if (!button) return;
  const id = button.dataset.id;
  switch (button.dataset.action) {
    case 'close':modal.close();break;
    case 'draft':draftForm();break;
    case 'edit-draft':draftForm(id);break;
    case 'plan':planForm(id);break;
    case 'delete-draft':confirmRemoval('draft',id);break;
    case 'delete-plan':confirmRemoval('plan',id);break;
    case 'clear-corner':confirmRemoval('all');break;
    case 'share-need':if (exampleNeeds.some(n=>n.id===id)) void copyURL(publicNeedURL(id));break;
    case 'share-project':void copyURL(new URL('project.html',location.href).href);break;
    case 'print':window.print();break;
    case 'reset-filters':Object.assign(state,{query:'',work:'all',kind:'all',sort:'featured'});document.querySelector('#need-search').value='';document.querySelector('#need-kind').value='all';document.querySelector('#need-sort').value='featured';renderBoard();break;
  }
});
if (page === 'board') startBoard();
if (page === 'resources') startResources();
if (page === 'corner') renderCorner();
