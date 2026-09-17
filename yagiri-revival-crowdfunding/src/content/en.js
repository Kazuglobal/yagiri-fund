// English copy. Must keep the same shape as ja.js (checked by tests/i18n.test.mjs).
// Facts that are easy to get wrong: 40cm is the water INSIDE the walk-in cooler,
// the insurance threshold is 45cm of indoor flooding, 70cm was the deepest point.

import { REWARDS } from './data.js';

const yenString = (n) => `¥${n.toLocaleString('en-US')}`;

export const en = {
  htmlLang: 'en',
  locale: 'en-US',
  documentTitle: 'Our brewery went under water. Help us brew again | Yagiri Brewery Recovery Crowdfunding',
  yen: (n) => ({ prefix: '¥', value: n.toLocaleString('en-US'), unit: '' }),
  priceLabel: yenString,
  asOf: (d) =>
    `As of ${d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,

  langSwitch: { groupLabel: 'Language / 言語' },

  nav: {
    story: 'Our Story',
    beers: 'Our Beer',
    returns: 'Rewards',
    recovery: 'Use of Funds',
    faq: 'Info',
    official: 'Official site ↗',
  },

  header: {
    brandName: 'Yagiri Brewery',
    cta: 'Support',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menu: 'Menu',
    close: 'Close',
    mobileCta: 'Support now',
  },

  hero: {
    titleLines: ['Our brewery went under water.', 'We want it running again.'],
    leadLines: [
      'One night of muddy floodwater swallowed seven years of work.',
      'We missed the insurance threshold by 5cm, so we received nothing.',
      'Even so, we want to send out beer from this place once more.',
    ],
    slideAlts: [
      'Exterior of YAGIRIYA, the Yagiri Brewery shop',
      'Beer kegs and brewing equipment knocked over and scattered by the flood',
      'Our brewing equipment under floodwater',
      'The brewery floor after the muddy water receded',
      'Flood line left on the exterior wall and window',
      'The prefab walk-in cooler, warped by water pressure',
      'Flood damage: about 40cm of water inside the walk-in cooler',
      "Ingredients and kegs lost: about 4,500 glasses' worth",
      'Inside the taproom, furnished in American vintage',
      'A lively taproom full of smiling customers',
    ],
    slideDot: (i) => `Show slide ${i}`,
    ctaMain: 'Support us now',
    ctaSub: 'Help Yagiri Brewery recover',
    goalLabel: 'First goal',
    totalLabel: 'Raised so far',
    supportersLabel: 'Supporters',
    supporters: (n) => ({ value: n.toLocaleString('en-US'), unit: '' }),
    badgeGoal: 'Goal',
    achieved: 'Goal reached!',
    badgeCurrent: (p) => `Now ${p}%`,
    statusRate: (p) => `${p}% funded`,
    starting: 'Just getting started!',
    progressLabel: 'Progress toward the first goal',
    toastLead: ["Let's raise a glass", 'here again.'],
    toastSub: ['Building a warmer town,', 'one craft beer at a time.'],
    scrollAria: 'Read our story',
  },

  story: {
    label: 'Our Story',
    heading: ["We brew Yagiri's beer", 'at a small brewery in Yabashira.'],
    paragraphs: [
      'Yagiri sits across the Edogawa River from Shibamata in Katsushika, the neighborhood made famous by the film character Tora-san. It is known as the setting of the enka song “Yagiri no Watashi” and of the novel “Nogiku no Haka” (The Wild Chrysanthemum), which was also made into a film.',
      "In 2019 we started brewing under this town's name. We welcome guests at YAGIRIYA, our taproom in Yagiri, and brew our beer at a small brewery in Yabashira, also in Matsudo City.",
      "Our taproom draws neighbors as well as people who come by train from farther away. Someone tries a glass, wonders where it's made, and makes the trip out to Yagiri. That warm cycle was finally taking shape, and we were preparing a second shop by the west exit of Matsudo Station.",
      'Then the muddy water of a torrential rain swallowed our Yabashira brewery.',
    ],
    before: { alt: 'Inside the brewery before the flood', caption: 'The brewery before the flood, where we brewed batch after batch.' },
    cleanup: { alt: 'Washing kegs that were submerged', caption: 'We are washing each flooded keg, one by one.' },
    waterline: { alt: 'Outdoor flood line left on the exterior wall and window', caption: 'The outdoor flood line left on the wall and window.' },
  },

  taproom: {
    label: 'Our taproom in Yagiri',
    heading: ['A place where people come for a drink', 'and leave knowing Yagiri.'],
    body: 'YAGIRIYA is a public house where craft beer and American vintage live side by side. We run it together with the vintage shop CANDY STORE ROCK, and guests line up at a counter where a 1950s jukebox plays. Someone has a glass here, gets curious about craft beer, and discovers Yagiri Brewery. This shop is that entry point.',
    photos: [
      { alt: 'Exterior and sign of the YAGIRIYA taproom', caption: 'YAGIRIYA, our taproom in Yagiri. This is the entry point.' },
      { alt: 'Counter and tables inside YAGIRIYA', caption: 'Orders at the counter, in a long, narrow room that runs straight to the back.' },
      { alt: 'American vintage goods on the back bar at YAGIRIYA', caption: "The shelves hold American vintage pieces we've collected." },
      { alt: 'Tables and the wall collection at YAGIRIYA', caption: 'Tables for a slow drink, surrounded by the collection on the walls.' },
      { alt: 'A 1950s jukebox in the shop', caption: "A 1950s jukebox. The shop's music plays from here." },
      { alt: "The street seen from YAGIRIYA's terrace seats", caption: 'Terrace seats outside. On a nice day, a glass out here.' },
    ],
  },

  damage: {
    label: 'The night of the flood',
    heading: ['That night, everything in our brewery'],
    headingEm: 'was lost to muddy water.',
    quote: ['“We learned the hard way that something this merciless,', 'something that resets everything, can really happen.”'],
    lead: "Water rushing onto the property left a high mark on the building's exterior walls. Inside, the flood scattered everything across the brewery floor. It shoved our 3-tsubo (about 10m²) prefab walk-in cooler out of place, badly warping it, and left 40cm of muddy water inside. The malt and hops stacked in the cooler soaked in their sacks; the ingredients we lost would have made roughly 4,500 glasses of beer. Beer we were about to brew was gone in a single night.",
    photo: {
      alt: 'The brewery interior after the muddy water receded',
      caption: "The brewery after the water receded. Mud has also worked its way inside the equipment, where photos can't show it.",
    },
    documentaryLabel: 'Photos documenting the flood damage',
    documentary: [
      { alt: 'Kegs knocked over by the flood', caption: 'Kegs swept away and toppled between the equipment.' },
      { alt: 'Outdoor flood line on the exterior wall and window', caption: 'The mark on the wall and window. The property was underwater up to this height.' },
      { alt: 'Prefab walk-in cooler warped by the flood', caption: 'The prefab walk-in cooler, its panels warped by the water.' },
    ],
    details: [
      {
        tag: '01 / Insurance',
        heading: ['Just 5cm short.', 'So we received no compensation.'],
        body: 'Insurance pays out at 45cm of indoor flooding. The water inside our walk-in cooler reached 40cm, just 5cm short. After losing our equipment and ingredients, what arrived was a single notice: “not covered.” Every cost of recovery is ours to bear.',
      },
      {
        tag: '02 / Brewing conditions',
        heading: ['42°C inside.', "We can't brew right now."],
        body: "Two of our three air conditioners have stopped. The last one's outdoor unit got soaked, and it could fail at any moment. The chiller that holds fermentation temperature has also lost much of its efficiency. In these conditions, we cannot make safe beer.",
      },
      {
        tag: '03 / Timing',
        heading: ['The ground gave way just as', 'we were preparing to grow.'],
        body: 'More people were drinking our beer, and we were adding equipment to increase brewing capacity. Investment meant to make more beer has turned into the cost of recovering from being unable to make any.',
      },
    ],
    appeal: {
      label: 'Even so, once more',
      heading: ['What keeps us going is knowing', 'people are waiting.'],
      paragraphs: [
        'There are people waiting for the beer brewed here.',
        "To be honest, it is hard for us to rebuild on our own. Still, people tell us, “We're waiting for you to reopen,” and “We can't wait to drink your beer again.” Those words are what keep us standing.",
      ],
      ask: ['To send out beer from this place once more,', 'we humbly ask for your help.'],
      cta: 'Support our fresh start',
    },
  },

  recovery: {
    label: 'Use of Funds',
    heading: ['Every yen goes toward', 'equipment to restart brewing.'],
    intro: 'Recovery will cost about ¥1.8 million in total. Nothing in it is extra: every item is essential equipment for brewing safe, delicious beer.',
    items: [
      { title: 'Replace 3 air conditioners', note: "We can't brew until the room comes down from 42°C. ¥800,000+" },
      { title: 'Replace the chiller', note: "If fermentation temperature drifts, we can't reproduce the flavor. ¥500,000" },
      { title: 'Ingredients, cleaning, supplies', note: 'Replacing lost malt and hops; washing out mud and sanitizing. ¥500,000' },
    ],
    totalLabel: 'Estimated recovery cost',
    totalValue: 'about ¥1.8M',
    reach: '167 supporters at ¥6,000 each would reach our first goal of ¥1,000,000.',
    waterlineAlt: 'Flood mark left inside the prefab walk-in cooler',
    waterlineLabel: 'Water inside the cooler',
  },

  join: {
    label: 'Ways to support',
    heading: ["We'll return your support", 'one glass at a time.'],
    intro: "Through beer, at the brewery, or at our shop: we've prepared four ways to support us.",
    featured: [
      { title: 'Support with beer', copy: 'Six bottles from our first batch after reopening, delivered to your home.', price: 'From ¥6,000' },
      { title: 'Experience the brewery', copy: 'A tour for two of the brewhouse, a place normally closed to visitors.', price: '¥20,000' },
      { title: 'Raise a glass at our shop', copy: 'Six bottles plus a ¥10,000 meal voucher. See you at the shop.', price: 'From ¥25,000' },
      { title: 'Give a special bottle', copy: 'With a one-of-a-kind label bearing a name or a special date.', price: 'From ¥15,000' },
    ],
    featuredAlt: (title, price) => `${title} (${price}) reward`,
    seeAll: 'See all rewards',
  },

  returns: {
    label: 'All Rewards',
    heading: ['From ¥3,000,', 'you can help us take a step toward reopening.'],
    intro: 'This campaign is All-in: orders stand even if the goal is not reached. Rewards are scheduled to ship from January 2027. Rewards that include alcohol are available only to those aged 20 and over. Orders are placed through our official online shop, which is in Japanese.',
    // The reward images carry Japanese text, so English adds a text caption.
    showCaption: true,
    items: [
      { kind: 'Supporter', title: 'Original sticker + 1 free drink ticket for the taproom' },
      { kind: 'Early bird', title: '6 bottles of beer' },
      { kind: 'Support with beer', title: '6 bottles of beer' },
      { kind: 'Support with beer', title: '12 bottles of beer' },
      { kind: 'Gift of support', title: '6 bottles with a personalized original label' },
      { kind: 'Experience the brewery', title: 'Brewery tour for one group of two' },
      { kind: 'Gift of support', title: '6 bottles with a fully original label' },
      { kind: 'Support at our shop', title: '6 bottles + ¥10,000 meal voucher' },
      { kind: 'Support at our shop', title: '12 bottles + ¥20,000 meal voucher' },
      { kind: 'Events', title: 'Mobile tap service with 2 × 15L kegs' },
      { kind: 'Brew with us', title: 'Right to brew an original beer + naming rights' },
      { kind: 'Batch owner', title: 'Keg delivery: 11 × 15L one-way kegs' },
      { kind: 'Batch owner', title: 'Bottle delivery: about 500 bottles' },
    ].map((item, i) => ({
      ...item,
      alt: `${yenString(REWARDS[i].price)} ${item.kind} reward: ${item.title}`,
    })),
    soldOut: 'Sold out (0 left)',
    left: (n) => `${n} left`,
    delivery: 'Estimated delivery: January 2027 or later',
    cta: 'View details',
  },

  labels: {
    label: 'Original Labels',
    heading: ['Six bottles, one of a kind,', "with the recipient's name on the label."],
    body: "For birthdays, weddings, or a shop opening. The ¥15,000 plan puts a name, date, and short message on one of three templates. For the ¥22,000 plan, we'll hear what you'd like and design a label from scratch. Your support becomes a gift for someone else.",
    types: [
      { key: 'A', name: 'Anniversary', note: 'Name / date' },
      { key: 'B', name: 'Name logo', note: 'Two kanji / Latin letters' },
      { key: 'C', name: 'Noshi gift style', note: 'Inscription / name' },
    ],
  },

  about: {
    label: 'About Us',
    heading: ['Creating an entry point to this town', 'with a glass of beer.'],
    paragraphs: [
      "What we wanted to create was an entry point for people who don't know Yagiri. Starting from history or geography feels a little distant. But with a glass of beer, Yagiri becomes a place that means something to you from the day you drink it.",
      "While the brewery is stopped, that entry point stays closed. From the town's side, it means one fewer chance to be known, day after day. That is why we're in a hurry.",
    ],
    officialLink: 'Yagiri Brewery official site',
    portrait: {
      alt: 'Watanabe, our representative, and Ishida, our brewer, standing at a Yagiri Brewery booth',
      caption: 'Watanabe, representative (right) / Ishida, brewer (left)',
    },
    fest: {
      alt: 'Staff and friends gathered at the Yagiri Beer Festival',
      caption: 'At the Yagiri Beer Festival. Local connections that grow out of beer.',
    },
    beliefs: [
      { heading: 'Connecting people.', body: 'Craft beer is more than a drink. A conversation starts with the stranger in the next seat. We want to keep a place in this town where that glass can be poured.' },
      { heading: 'Sharing the stories of our area.', body: 'Someone drinks and pictures the scenery of Yagiri. We believe making more glasses like that is the quickest way for this town to become known.' },
      { heading: 'Balancing innovation and flavor.', body: 'We keep trying new flavors, but for seven years we have never given ground on one rule: we only release what both of us think is delicious.' },
    ],
  },

  team: {
    label: 'The two who brew',
    heading: ['Two who rode the same races', 'decide the next glass together.'],
    paragraphs: [
      "Yagiri Brewery is run by Watanabe, our representative, and Ishida, who handles the brewing. They met on their university cycling team. Training together and riding the same races built a deep teamwork in which each understands the other's thinking without many words.",
      "Now they face brewing tanks instead of bicycles. Their roles differ, but when it comes to deciding a flavor, it's always the two of them. A beer only one of them is satisfied with never goes out. We release only what both agree is delicious. It's the one standard we haven't changed since we started.",
    ],
    roles: [
      { tag: 'REPRESENTATIVE', name: 'Watanabe / Representative', body: 'Connects the land and people of Yagiri, and nurtures places where beer sparks new encounters.' },
      { tag: 'BREWER', name: 'Ishida / Brewer', body: 'Pursues depth of aroma and flavor within easy drinkability: a glass with something to discover for newcomers and enthusiasts alike.' },
    ],
    quote: ['Delicious beer that anyone can enjoy.', 'A beer is finished when both of us call it delicious.'],
  },

  beers: {
    label: 'What we brew',
    heading: ['A glass that overturns', '“beer is too bitter for me.”'],
    intro: "For first-timers, the surprise of “beer can be this easy to drink.” For enthusiasts, the discovery of “I've never had this combination before.” Drinkability and character can coexist; that is the one thing we have never doubted. None of the four beers below can be brewed right now.",
    audiences: [
      { heading: 'For first-timers', body: "Friendly fruit-forward flavors and a light, easy finish. Our lineup includes beers you can enjoy even if bitterness isn't your thing." },
      { heading: 'For enthusiasts', body: 'From hop combinations and hopping methods to bottle conditioning, we pursue beers with depth that show a new side every time.' },
      { heading: "For those who don't know Yagiri yet", body: '“Where is this beer made?” We want a memorable flavor to be what first brings you to this town.' },
    ],
    lineup: [
      { style: 'HAZY IPA · ALC. 7.0%', name: 'CANVAS', body: 'Generous amounts of Nectaron, Citra, Cryo Citra, and Cascade. Our own triple dry-hopping method keeps bitterness low and draws out juicy citrus and tropical aromas. Our flagship Hazy IPA.', note: 'Tropical and rich. For IPA fans, too.' },
      { style: 'GOSE · ALC. 7.0%', name: 'SUNPARADE', body: 'Tart lime and grapefruit with the saltiness characteristic of a gose. Plenty of fruit purée goes into fermentation, balancing complexity with refreshment.', note: 'Light and easy to drink; a good first glass.' },
      { style: 'BELGIAN BROWN ALE · ALC. 8.0%', name: 'MERCKX 青', body: 'Built on a traditional Belgian brown ale, with rich aromas reminiscent of whisky barrel aging. Bottle conditioning lets the flavor evolve over time.', note: 'For whisky lovers.' },
      { style: 'SAISON', name: 'Saison de Bleu', body: 'Clean and light on the palate, with a pleasant bitterness. Easy to pair with food, and an easy pick for any occasion.', note: "The first glass when you can't decide." },
    ],
  },

  faq: {
    heading: 'Before you support',
    items: [
      { q: 'This campaign is All-in', a: "If we don't reach the goal, we will still use the funds raised to move recovery forward. Orders will not be canceled or refunded because the goal wasn't reached." },
      { q: 'Cancellations and returns', a: 'Once an order is confirmed, we cannot accept cancellations or returns for personal reasons. If an item is defective, we will replace it.' },
      { q: 'When payment is made', a: 'Payment is finalized when your order is confirmed. Charges do not wait for the goal to be reached.' },
      { q: 'Shipping', a: "Bottles ship in sets of six. Shipping is planned for January 2027 or later and may shift depending on recovery progress. We'll share the latest status in our progress updates." },
      { q: 'Meal vouchers and free drink tickets', a: 'Valid for one year from issue. They cannot be exchanged for cash.' },
      { q: 'Brewing an original beer', a: 'To ensure quality, the final recipe and any adjustments are left to the brewery. Adjunct ingredients can be discussed within the range we have experience with.' },
    ],
    legal: 'Drinking by anyone under 20 is prohibited by law in Japan. Those under 20 cannot purchase rewards that include alcohol. Providing the alcohol from your rewards to third parties for a fee requires the supporter to hold a liquor sales license.',
    legalShop: { before: "Orders and payment are handled through Yagiri Brewery's official online shop. For business details, payment methods, and return conditions, please see the ", link: 'Legal Notice under the Act on Specified Commercial Transactions', after: ' (in Japanese).' },
  },

  closing: {
    imageAlt: 'An image evoking the Yagiri area at dusk',
    heading: ['Shall we make the next toast', 'together?'],
    body: ['Your warm push could be what gets', 'our stopped brewery running again.'],
    cta: 'Support this project',
    tagline: 'From Yagiri, beer once more.',
  },

  footer: {
    company: 'Yagiri Brewery LLC / Higurashi Brewery',
    place: 'Matsudo, Chiba, Japan',
    official: 'Official site www.yagiribrewery.com',
  },

  supportBar: {
    label: 'First goal',
    note: ['Of the roughly ¥1.8M needed for recovery,', "we're aiming for ¥1M first."],
    cta: 'Support this project',
  },
};
