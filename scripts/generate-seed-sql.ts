// ============================================================
// Generate complete seed SQL from legacy data files
// Usage: npx tsx scripts/generate-seed-sql.ts > migrations/0002_seed_data.sql
// Then: wrangler d1 execute hsn-journeys-db --remote --file=migrations/0002_seed_data.sql
// ============================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function esc(s: unknown): string {
  if (s == null || s === undefined) return '';
  return String(s).replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function sqlDate(s: unknown): string {
  if (!s) return '';
  return String(s);
}

// Read legacy data
const journeysPath = join(import.meta.dirname, '..', 'legacy', 'data', 'journeys.json');
const journeysData = JSON.parse(readFileSync(journeysPath, 'utf-8'));

const lines: string[] = [];
lines.push('-- ============================================================');
lines.push('-- Seed Data — generated from legacy sources');
lines.push('-- ============================================================');
lines.push('');
lines.push('BEGIN TRANSACTION;');
lines.push('');

// ============================================================
// COORDINATES (from legacy/map.js)
// ============================================================
const coordinates = [
  { name: '巴黎', country: '法国', lat: 48.8566, lng: 2.3522, type: 'international' },
  { name: '苏黎世', country: '瑞士', lat: 47.3769, lng: 8.5417, type: 'international' },
  { name: '罗马', country: '意大利', lat: 41.9028, lng: 12.4964, type: 'international' },
  { name: '厦门', country: '中国', lat: 24.4798, lng: 118.0894, type: 'domestic' },
  { name: '延吉', country: '中国', lat: 42.9048, lng: 129.5089, type: 'domestic' },
  { name: '长白山', country: '中国', lat: 42.0413, lng: 128.0579, type: 'domestic' },
  { name: '沈阳', country: '中国', lat: 41.8057, lng: 123.4315, type: 'domestic' },
  { name: '伊斯坦布尔', country: '土耳其', lat: 41.0082, lng: 28.9784, type: 'international' },
  { name: '卡帕多奇亚', country: '土耳其', lat: 38.6431, lng: 34.8303, type: 'international' },
  { name: '香港', country: '中国', lat: 22.3193, lng: 114.1694, type: 'domestic' },
  { name: '澳门', country: '中国', lat: 22.1987, lng: 113.5439, type: 'domestic' },
  { name: '珠海', country: '中国', lat: 22.271, lng: 113.567, type: 'domestic' },
  { name: '乌鲁木齐', country: '中国', lat: 43.8256, lng: 87.6168, type: 'domestic' },
  { name: '喀纳斯', country: '中国', lat: 48.8158, lng: 87.0381, type: 'domestic' },
  { name: '禾木', country: '中国', lat: 48.5712, lng: 87.4319, type: 'domestic' },
  { name: '北京', country: '中国', lat: 39.9042, lng: 116.4074, type: 'domestic' },
  { name: '青岛', country: '中国', lat: 36.0671, lng: 120.3826, type: 'domestic' },
  { name: '东京', country: '日本', lat: 35.6762, lng: 139.6503, type: 'international' },
  { name: '京都', country: '日本', lat: 35.0116, lng: 135.7681, type: 'international' },
  { name: '大阪', country: '日本', lat: 34.6937, lng: 135.5023, type: 'international' },
  { name: '大同', country: '中国', lat: 40.0764, lng: 113.3001, type: 'domestic' },
  { name: '哈尔滨', country: '中国', lat: 45.8038, lng: 126.535, type: 'domestic' },
  { name: '黄山', country: '中国', lat: 29.7147, lng: 118.3375, type: 'domestic' },
  { name: '上海', country: '中国', lat: 31.2304, lng: 121.4737, type: 'domestic' },
  { name: '大连', country: '中国', lat: 38.914, lng: 121.6147, type: 'domestic' },
  { name: '威海', country: '中国', lat: 37.5091, lng: 122.1206, type: 'domestic' },
  { name: '济南', country: '中国', lat: 36.6512, lng: 117.1201, type: 'domestic' },
  { name: '泰安', country: '中国', lat: 36.2002, lng: 117.0876, type: 'domestic' },
  { name: '长沙', country: '中国', lat: 28.228, lng: 112.9388, type: 'domestic' },
  { name: '张家界', country: '中国', lat: 29.1171, lng: 110.4792, type: 'domestic' },
  { name: '成都', country: '中国', lat: 30.5728, lng: 104.0668, type: 'domestic' },
  { name: '重庆', country: '中国', lat: 29.5628, lng: 106.5528, type: 'domestic' },
  { name: '苏州', country: '中国', lat: 31.2989, lng: 120.5853, type: 'domestic' },
  { name: '南京', country: '中国', lat: 32.0603, lng: 118.7969, type: 'domestic' },
  { name: '西安', country: '中国', lat: 34.3416, lng: 108.9398, type: 'domestic' },
  { name: '秦皇岛', country: '中国', lat: 39.9354, lng: 119.5965, type: 'domestic' },
  { name: '天津', country: '中国', lat: 39.0842, lng: 117.2009, type: 'domestic' },
  { name: '兰州', country: '中国', lat: 36.0611, lng: 103.8343, type: 'domestic' },
  { name: '南阳', country: '中国', lat: 32.9908, lng: 112.5283, type: 'domestic' },
];

for (const coord of coordinates) {
  lines.push(`INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('${esc(coord.name)}', '${esc(coord.country)}', ${coord.lat}, ${coord.lng}, '${coord.type}');`);
}
lines.push('');

// ============================================================
// PACKING LIST (from legacy/index.html)
// ============================================================
const packingData: [string, [string, string][]][] = [
  ['证件', [
    ['身份证、护照、签证、港澳通行证、入境卡（新加坡）', '护照确保6个月有效期'],
  ]],
  ['交通', [
    ['机票', '美团、携程、飞猪'],
    ['酒店', 'booking、agoda、爱彼迎'],
    ['门票及行程预定', ''],
  ]],
  ['财务', [
    ['目的地取现金', ''],
    ['电子支付', 'visa信用卡、万事达卡、银联储蓄卡、支付宝/微信'],
  ]],
  ['出行工具', [
    ['交通路线查询、交通卡', '谷歌地图、高德地图、苹果钱包直接申请'],
  ]],
  ['通讯', [
    ['手机、流量卡、换卡卡针', '淘宝购买流量卡'],
    ['翻译软件', '谷歌翻译、拍照翻译'],
  ]],
  ['电子设备', [
    ['充电宝、充电线、转换插头', '手机、ipad、充电宝、耳机（各配充电线）'],
    ['相机、pocket3', '电池（不可托运）、充电线'],
    ['电脑、鼠标、充电线', '非必带'],
  ]],
  ['衣物', [
    ['衣物', '内衣裤、袜子、外套、裙子、裤子、鞋、墨镜、帽子、手套（按需2天1套）、睡衣'],
  ]],
  ['杂物', [
    ['杂物', '耳塞、雨伞、卫生纸、卫生巾、湿纸巾、口罩、垃圾袋、驱蚊、洗衣液、晾衣架、一次性手套马桶套'],
  ]],
  ['护肤化妆', [
    ['基础护理', '洗面奶、水乳面霜、牙刷牙膏、洗发水护发素沐浴露、毛巾浴巾、面膜、刮胡刀、洗脸巾、洗手液、梳子、皮筋发夹、护手霜'],
    ['防晒霜', ''],
    ['飞行便携护理', '卸妆、洗面奶、面霜、漱口水、唇膏、一次性拖鞋、颈枕、眼罩'],
    ['化妆品', '美瞳、化妆刷、气垫、粉底、遮瑕、定妆粉、眉笔、眼影、眼线、睫毛夹、睫毛膏、腮红、高光阴影、口红、唇膏、素颜霜、项链、耳钉、卸妆'],
  ]],
  ['保险', [
    ['旅游保险', '支付宝'],
  ]],
];

for (let ci = 0; ci < packingData.length; ci++) {
  const [catName, items] = packingData[ci];
  lines.push(`INSERT INTO packing_categories (id, name, sort_order) VALUES (${ci + 1}, '${esc(catName)}', ${ci});`);
  for (let ii = 0; ii < items.length; ii++) {
    const [item, note] = items[ii];
    lines.push(`INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (${ci + 1}, '${esc(item)}', '${esc(note)}', ${ii});`);
  }
}
lines.push('');

// ============================================================
// WISHLIST (from legacy/data.js defaultWishlist)
// ============================================================
const wishlistData = [
  { city: '内蒙古', title: '乌兰察布&包头火山草原3日游', emoji: '🌋', duration: '3天', season: '8月周末', description: '乌兰哈达火山公园露营、辉腾锡勒草原黄花沟、包头响沙湾沙漠', highlights: ['乌兰哈达火山', '黄花沟草原', '响沙湾沙漠', '联营烧麦'] },
  { city: '新加坡', title: '新加坡4日游', emoji: '🦁', duration: '4天', season: '10月', description: '鱼尾狮公园、滨海湾花园、圣淘沙环球影城、SEA海洋馆', highlights: ['鱼尾狮公园', '滨海湾花园', '圣淘沙', '乌节路'] },
  { city: '武汉', title: '武汉3日游', emoji: '🌸', duration: '3天', season: '端午', description: '黄鹤楼、长江大桥、东湖、武汉大学、湖北省博物馆、过早文化', highlights: ['黄鹤楼', '东湖', '武汉大学', '热干面'] },
  { city: '川藏线', title: '川藏线自驾', emoji: '🏔️', duration: '10-15天', season: '国庆', description: '成都出发经稻城亚丁到拉萨，布达拉宫、纳木错、珠峰大本营', highlights: ['稻城亚丁', '布达拉宫', '纳木错', '珠峰大本营'] },
  { city: '广西', title: '北海&桂林&柳州', emoji: '🛶', duration: '5-7天', season: '国庆', description: '涠洲岛、桂林山水、柳州螺蛳粉', highlights: ['涠洲岛', '漓江', '阳朔', '柳州螺蛳粉'] },
  { city: '杭州', title: '杭州2日游', emoji: '🌿', duration: '2天', season: '周末', description: '西湖、灵隐寺、龙井村、西溪湿地', highlights: ['西湖', '灵隐寺', '龙井村', '西溪湿地'] },
  { city: '云南', title: '大理&丽江&香格里拉', emoji: '🏯', duration: '7-10天', season: '国庆', description: '大理古城、洱海、丽江古城、玉龙雪山、虎跳峡、香格里拉', highlights: ['洱海', '丽江古城', '玉龙雪山', '香格里拉'] },
  { city: '三亚', title: '三亚度假', emoji: '🏖️', duration: '5-7天', season: '冬季', description: '亚龙湾、蜈支洲岛、天涯海角、南山寺', highlights: ['亚龙湾', '蜈支洲岛', '海棠湾'] },
  { city: '西藏', title: '西藏深度游', emoji: '🏔️', duration: '10-14天', season: '8月', description: '拉萨、林芝、羊卓雍措、日喀则、珠峰大本营', highlights: ['布达拉宫', '羊卓雍措', '珠峰大本营', '纳木错'] },
  { city: '新疆', title: '北疆大环线', emoji: '🏜️', duration: '10-15天', season: '9月', description: '赛里木湖、独库公路、巴音布鲁克、那拉提、魔鬼城', highlights: ['赛里木湖', '独库公路', '那拉提草原', '禾木'] },
  { city: '广州', title: '广州&顺德美食之旅', emoji: '🍜', duration: '3天', season: '周末', description: '广州塔、沙面、长隆、顺德美食', highlights: ['广州塔', '沙面', '顺德美食', '长隆'] },
  { city: '首尔', title: '首尔5日游', emoji: '🇰🇷', duration: '5天', season: '国庆', description: '景福宫、明洞、首尔塔、江南、弘大', highlights: ['景福宫', '明洞', '首尔塔', '弘大'] },
  { city: '泰国', title: '曼谷&清迈', emoji: '🛕', duration: '7-10天', season: '冬季', description: '大皇宫、清迈古城、拜县、普吉岛', highlights: ['大皇宫', '清迈古城', '普吉岛', '拜县'] },
  { city: '马尔代夫', title: '马尔代夫蜜月', emoji: '🏝️', duration: '5天', season: '12月', description: '水屋、浮潜、海豚巡游、SPA', highlights: ['水屋', '浮潜', '海豚巡游'] },
  { city: '冰岛', title: '冰岛极光之旅', emoji: '🌌', duration: '10天', season: '冬季', description: '蓝湖温泉、黄金圈、冰河湖、极光', highlights: ['蓝湖', '极光', '冰河湖', '黄金圈'] },
  { city: '济州岛', title: '济州岛3日游', emoji: '🍊', duration: '3天', season: '任意', description: '汉拿山、城山日出峰、牛岛、涯月邑', highlights: ['汉拿山', '城山日出峰', '牛岛', '涯月邑'] },
  { city: '洛阳', title: '洛阳2日游', emoji: '🏯', duration: '2天', season: '4月', description: '龙门石窟、白马寺、老君山、洛阳博物馆', highlights: ['龙门石窟', '白马寺', '老君山'] },
  { city: '贵州', title: '贵州避暑游', emoji: '🌿', duration: '5-7天', season: '夏季', description: '黄果树瀑布、荔波小七孔、西江千户苗寨、镇远古镇', highlights: ['黄果树瀑布', '小七孔', '千户苗寨'] },
];

for (let wi = 0; wi < wishlistData.length; wi++) {
  const w = wishlistData[wi];
  lines.push(`INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (${wi + 1}, '${esc(w.title)}', '${esc(w.city)}', '${esc(w.emoji)}', '${esc(w.duration)}', '${esc(w.season)}', '${esc(w.description)}', ${wi});`);
  for (let hi = 0; hi < w.highlights.length; hi++) {
    lines.push(`INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (${wi + 1}, '${esc(w.highlights[hi])}', ${hi});`);
  }
}
lines.push('');

// ============================================================
// JOURNEYS (from legacy/data/journeys.json)
// ============================================================
let journeyOrder = 0;

for (const j of journeysData) {
  journeyOrder++;
  const id: number = j.id;

  lines.push(`-- Journey ${id}: ${esc(j.title)}`);
  lines.push(`INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (${id}, '${esc(j.province)}', '${esc(j.city)}', '${esc(j.country)}', '${sqlDate(j.date)}', '${sqlDate(j.endDate)}', '${esc(j.title)}', '${esc(j.emoji)}', '${esc(j.description)}', '${esc(j.story)}', ${journeyOrder});`);

  // Highlights
  if (Array.isArray(j.highlights)) {
    for (let hi = 0; hi < j.highlights.length; hi++) {
      lines.push(`INSERT INTO highlights (journey_id, text, sort_order) VALUES (${id}, '${esc(j.highlights[hi])}', ${hi});`);
    }
  }

  // Costs
  const c = j.cost || {};
  lines.push(`INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (${id}, ${c.package || 0}, ${c.transport || 0}, ${c.accommodation || 0}, ${c.food || 0}, ${c.shopping || 0}, ${c.ticket || 0});`);

  // Itinerary (old format)
  if (Array.isArray(j.itinerary)) {
    for (let ii = 0; ii < j.itinerary.length; ii++) {
      const item = j.itinerary[ii] || {};
      lines.push(`INSERT INTO itinerary_items (journey_id, date, morning, afternoon, evening, note, sort_order) VALUES (${id}, '${sqlDate(item.date)}', '${esc(item.morning)}', '${esc(item.afternoon)}', '${esc(item.evening)}', '${esc(item.note)}', ${ii});`);
    }
  }

  // SubCards
  if (Array.isArray(j.subCards)) {
    for (let si = 0; si < j.subCards.length; si++) {
      const sub = j.subCards[si] || {};
      const sId = sub.id || `sub-${id}-${si}`;
      lines.push(`INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, sort_order) VALUES ('${esc(sId)}', ${id}, '${esc(sub.name)}', '${esc(sub.province)}', '${esc(sub.city)}', '${esc(sub.country)}', '${sqlDate(sub.date)}', '${sqlDate(sub.endDate)}', '${esc(sub.emoji)}', '${esc(sub.story)}', ${si});`);

      // Subcard highlights
      if (Array.isArray(sub.highlights)) {
        for (let hi = 0; hi < sub.highlights.length; hi++) {
          lines.push(`INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('${esc(sId)}', '${esc(sub.highlights[hi])}', ${hi});`);
        }
      }

      // Subcard costs
      const sc = sub.cost || {};
      lines.push(`INSERT INTO sub_card_costs (sub_card_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES ('${esc(sId)}', ${sc.package || 0}, ${sc.transport || 0}, ${sc.accommodation || 0}, ${sc.food || 0}, ${sc.shopping || 0}, ${sc.ticket || 0});`);

      // Subcard itinerary table
      const it = sub.itineraryTable;
      if (it && Array.isArray(it.headers) && Array.isArray(it.rows)) {
        for (let hi = 0; hi < it.headers.length; hi++) {
          for (let ri = 0; ri < it.rows.length; ri++) {
            const cell = (it.rows[ri] || [])[hi] || '';
            if (cell) {
              lines.push(`INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('${esc(sId)}', ${hi}, '${esc(it.headers[hi])}', ${ri}, '${esc(cell)}');`);
            }
          }
        }
      }
    }
  }
  lines.push('');
}

lines.push('COMMIT;');
lines.push('');

// Write output file
const outputPath = join(import.meta.dirname, '..', 'migrations', '0002_seed_data.sql');
const sql = lines.join('\n');
writeFileSync(outputPath, sql, 'utf-8');

console.log(`Seed SQL written to migrations/0002_seed_data.sql`);
console.log(`  ${journeysData.length} journeys`);
console.log(`  ${coordinates.length} coordinates`);
console.log(`  ${wishlistData.length} wishlist items`);
console.log(`  ${packingData.length} packing categories`);
console.log(`\nRun: wrangler d1 execute hsn-journeys-db --remote --file=migrations/0002_seed_data.sql`);
