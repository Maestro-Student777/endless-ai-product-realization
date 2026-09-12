export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
export const money = cents => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:cents % 100 ? 2 : 0 }).format(cents / 100);
export function parseAmount(value) {
  const input = String(value).trim();
  if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(input)) return null;
  const cents = Math.round(Number(input) * 100);
  return cents > 0 && cents <= 10000000 ? cents : null;
}
export function filterNeeds(needs, { query='', work='all', kind='all', sort='featured' }={}) {
  const q = query.trim().toLowerCase();
  const found = needs.filter(n => (work === 'all' || n.workId === work) &&
    (kind === 'all' || (kind === 'small' ? n.kind === 'money' && n.goalCents <= 2500 : kind === n.kind)) &&
    (!q || [n.title,n.name,n.city,n.story].join(' ').toLowerCase().includes(q)));
  if (sort === 'low' || sort === 'high') found.sort((a,b) => {
    if (a.kind !== 'money' || b.kind !== 'money') return Number(b.kind === 'money') - Number(a.kind === 'money');
    return sort === 'low' ? a.goalCents-b.goalCents : b.goalCents-a.goalCents;
  });
  return found;
}
export const storageKey = 'endless-ai-mercy-v1';
export function readCorner(storage) {
  const empty = () => ({ version:1, drafts:[], plans:[] });
  try {
    const d = JSON.parse(storage.getItem(storageKey));
    if (!d || d.version !== 1 || !Array.isArray(d.drafts) || !Array.isArray(d.plans)) return empty();
    const str = (v,n) => typeof v === 'string' && v.length <= n;
    const kinds = ['money','time','goods','prayer'];
    const drafts = d.drafts.filter(n => str(n.id,100) && str(n.title,100) && str(n.name,60) && str(n.city,80) && str(n.story,1400) && str(n.canOffer,300) && str(n.workId,30) && kinds.includes(n.kind) && Number.isInteger(n.goalCents) && n.goalCents >= 0 && n.goalCents <= 10000000).slice(0,50);
    const plans = d.plans.filter(p => str(p.id,100) && str(p.needId,100) && str(p.title,100) && str(p.message,500) && str(p.donor,60) && kinds.includes(p.kind) && ['named','anonymous'].includes(p.visibility) && ['direct','service'].includes(p.delivery) && Number.isInteger(p.amountCents) && p.amountCents >= 0 && p.amountCents <= 10000000).slice(0,100);
    return {version:1,drafts,plans};
  } catch { return empty(); }
}
export function saveCorner(storage, value) {
  try { storage.setItem(storageKey, JSON.stringify(value)); return true; } catch { return false; }
}
