// Curated first-party links. These are referrals, not live eligibility or availability data.
export const reviewedOn = '2026-09-12';
export const topics = { food: 'Food', housing: 'Housing & bills', furniture: 'Furniture', transport: 'Transportation', clothing: 'Clothing', work: 'Work & business', care: 'Care & companionship', faith: 'Faith & prayer' };
export const resources = [
  { id: 'mn211', name: 'Minnesota 211', organization: 'Greater Twin Cities United Way', url: 'https://211unitedway.org/', area: 'Minnesota', topics: ['food','housing','furniture','transport','clothing','care'], description: 'Talk with a resource specialist about local food, housing, transportation, and other community help.', cost: 'Free, confidential referral service; ask each provider about its services.', kind: 'Local resource finder' },
  { id: '211', name: 'Find your local 211', organization: 'United Way 211', url: 'https://www.211.org/', area: 'United States', topics: ['food','housing','furniture','transport','clothing','care'], description: 'Find community services near you, including help with food, bills, housing, and caregiving.', cost: 'Free referral service; local programs set their own requirements.', kind: 'Resource finder' },
  { id: 'foodbank', name: 'Find a food bank', organization: 'Feeding America', url: 'https://www.feedingamerica.org/find-your-local-foodbank', area: 'United States', topics: ['food'], description: 'Locate a member food bank and follow its instructions for finding food locally.', cost: 'Free directory. Contact the local food bank about distribution and access.', kind: 'Food directory' },
  { id: 'mnbenefits', name: 'Apply with MNbenefits', organization: 'State of Minnesota', url: 'https://mnbenefits.mn.gov/', area: 'Minnesota', topics: ['food','housing'], description: 'Apply for food assistance, cash programs, emergency assistance, and other Minnesota benefits.', cost: 'Free application; your county or Tribal Nation determines eligibility.', kind: 'Official application' },
  { id: 'housing', name: 'Find a housing counselor', organization: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/find-a-housing-counselor/', area: 'United States', topics: ['housing'], description: 'Search for HUD-approved counseling agencies to discuss renting, mortgage difficulties, or keeping your home.', cost: 'Free directory; counseling is often low-cost or free. Confirm with the agency.', kind: 'Official directory' },
  { id: 'furniture', name: 'Furniture Bank Network', organization: 'Furniture Bank Network', url: 'https://furniturebanks.org/', area: 'United States & Canada', topics: ['furniture'], description: 'Look for a furniture bank that may help make a home livable or accept useful donated furniture.', cost: 'Free directory; service areas, referrals, stock, and delivery fees vary.', kind: 'Furniture directory' },
  { id: 'sba', name: 'Small business mentors', organization: 'U.S. Small Business Administration', url: 'https://www.sba.gov/counseling/local-assistance/resource-partners/', area: 'United States', topics: ['work'], description: 'Find SCORE mentors and Small Business Development Centers for help planning or improving a small business.', cost: 'Free directory. SCORE mentoring is free; ask about any training fees.', kind: 'Mentoring & planning' },
  { id: 'careers', name: 'Explore your next career', organization: 'My Next Move / O*NET', url: 'https://www.mynextmove.org/', area: 'United States', topics: ['work'], description: 'Explore occupations, skills, and interests to consider a path toward work that suits you.', cost: 'Free career exploration website.', kind: 'Career guide' },
  { id: 'jobs', name: 'Find federal jobs', organization: 'USAJOBS', url: 'https://www.usajobs.gov/', area: 'United States', topics: ['work'], description: 'Search official federal job announcements and read each opening’s qualifications and application steps.', cost: 'Free search; an account on USAJOBS is needed to apply.', kind: 'Official job listings' },
  { id: 'health', name: 'Find a health center', organization: 'Health Resources & Services Administration', url: 'https://findahealthcenter.hrsa.gov/', area: 'United States', topics: ['care'], description: 'Locate a health center and contact it about appointments, services, and payment options.', cost: 'Free locator; ask the center about care costs and assistance.', kind: 'Official health directory' },
  { id: 'eldercare', name: 'Eldercare Locator', organization: 'Administration for Community Living', url: 'https://eldercare.acl.gov/home', area: 'United States', topics: ['care','transport'], description: 'Find services for older adults and caregivers in your community.', cost: 'Free locator; the local service can explain eligibility and costs.', kind: 'Older adult support' },
  { id: 'benefits', name: 'Explore government benefits', organization: 'USAGov', url: 'https://www.usa.gov/benefit-finder', area: 'United States', topics: ['food','housing','care','work'], description: 'Find possible benefits for your circumstances and the official steps for applying.', cost: 'Free guide; each program determines eligibility.', kind: 'Official benefits guide' },
  { id: 'spiritual', name: 'Practice the spiritual works', organization: 'United States Conference of Catholic Bishops', url: 'https://www.usccb.org/beliefs-and-teachings/how-we-teach/new-evangelization/jubilee-of-mercy/the-spiritual-works-of-mercy', area: 'Online', topics: ['faith','care'], description: 'Read Catholic reflections on listening, teaching, comfort, forgiveness, patience, and prayer.', cost: 'Free reading on the official source website.', kind: 'Faith resource' },
  { id: 'catechism', name: 'The fourteen works of mercy', organization: 'The Holy See', url: 'https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html', area: 'Online', topics: ['faith'], description: 'Find the seven corporal and seven spiritual works in Appendix B of the Compendium of the Catechism.', cost: 'Free reading on the official source website.', kind: 'Catholic teaching' },
];

const exampleTopics = { 'a-meal-today':['food'], 'gas-for-work':['transport'], 'a-bed-of-my-own':['furniture'], 'a-reliable-ride':['transport'], 'keep-our-home':['housing'], 'a-small-start':['work'], 'a-listening-ear':['care'], 'prayer-for-family':['faith'], 'winter-work-boots':['clothing'] };
const workTopics = { feed:['food'],drink:['housing'],clothe:['clothing'],shelter:['housing'],sick:['care'],prison:['faith'],bury:['care'],counsel:['faith'],instruct:['faith'],admonish:['faith'],comfort:['care'],forgive:['faith'],bear:['faith'],pray:['faith'] };
export function topicsForNeed(need) {
  if (exampleTopics[need.id]) return exampleTopics[need.id];
  const text = [need.title,need.story,need.purpose].join(' ').toLowerCase();
  const matches = [];
  if (/\b(mattress|furniture|bed|frame)\b/.test(text)) matches.push('furniture');
  if (/\b(gas|fuel|car|ride|bus|transportation)\b/.test(text)) matches.push('transport');
  if (/\b(business|startup|mentor|equipment|job|career)\b/.test(text)) matches.push('work');
  return matches.length ? matches : (workTopics[need.workId] || ['care']);
}
export function resourcesForNeed(need) {
  const tags = topicsForNeed(need);
  return resources.filter(r => r.topics.some(t => tags.includes(t))).sort((a,b) => {
    const score = r => (r.topics.length === 1 ? 10 : 0) + (r.area === 'Minnesota' && /minnesota|\bmn\b|mankato|peter/i.test(need.city) ? 4 : 0);
    return score(b) - score(a);
  }).slice(0,3);
}
