-- ============================================================
-- Seed Data — generated from legacy sources
-- ============================================================

BEGIN TRANSACTION;

INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('巴黎', '法国', 48.8566, 2.3522, 'international');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('苏黎世', '瑞士', 47.3769, 8.5417, 'international');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('罗马', '意大利', 41.9028, 12.4964, 'international');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('厦门', '中国', 24.4798, 118.0894, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('延吉', '中国', 42.9048, 129.5089, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('长白山', '中国', 42.0413, 128.0579, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('沈阳', '中国', 41.8057, 123.4315, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('伊斯坦布尔', '土耳其', 41.0082, 28.9784, 'international');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('卡帕多奇亚', '土耳其', 38.6431, 34.8303, 'international');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('香港', '中国', 22.3193, 114.1694, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('澳门', '中国', 22.1987, 113.5439, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('珠海', '中国', 22.271, 113.567, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('乌鲁木齐', '中国', 43.8256, 87.6168, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('喀纳斯', '中国', 48.8158, 87.0381, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('禾木', '中国', 48.5712, 87.4319, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('北京', '中国', 39.9042, 116.4074, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('青岛', '中国', 36.0671, 120.3826, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('东京', '日本', 35.6762, 139.6503, 'international');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('京都', '日本', 35.0116, 135.7681, 'international');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('大阪', '日本', 34.6937, 135.5023, 'international');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('大同', '中国', 40.0764, 113.3001, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('哈尔滨', '中国', 45.8038, 126.535, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('黄山', '中国', 29.7147, 118.3375, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('上海', '中国', 31.2304, 121.4737, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('大连', '中国', 38.914, 121.6147, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('威海', '中国', 37.5091, 122.1206, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('济南', '中国', 36.6512, 117.1201, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('泰安', '中国', 36.2002, 117.0876, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('长沙', '中国', 28.228, 112.9388, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('张家界', '中国', 29.1171, 110.4792, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('成都', '中国', 30.5728, 104.0668, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('重庆', '中国', 29.5628, 106.5528, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('苏州', '中国', 31.2989, 120.5853, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('南京', '中国', 32.0603, 118.7969, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('西安', '中国', 34.3416, 108.9398, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('秦皇岛', '中国', 39.9354, 119.5965, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('天津', '中国', 39.0842, 117.2009, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('兰州', '中国', 36.0611, 103.8343, 'domestic');
INSERT OR IGNORE INTO city_coordinates (name, country, lat, lng, type) VALUES ('南阳', '中国', 32.9908, 112.5283, 'domestic');

INSERT INTO packing_categories (id, name, sort_order) VALUES (1, '证件', 0);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (1, '身份证、护照、签证、港澳通行证、入境卡（新加坡）', '护照确保6个月有效期', 0);
INSERT INTO packing_categories (id, name, sort_order) VALUES (2, '交通', 1);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (2, '机票', '美团、携程、飞猪', 0);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (2, '酒店', 'booking、agoda、爱彼迎', 1);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (2, '门票及行程预定', '', 2);
INSERT INTO packing_categories (id, name, sort_order) VALUES (3, '财务', 2);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (3, '目的地取现金', '', 0);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (3, '电子支付', 'visa信用卡、万事达卡、银联储蓄卡、支付宝/微信', 1);
INSERT INTO packing_categories (id, name, sort_order) VALUES (4, '出行工具', 3);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (4, '交通路线查询、交通卡', '谷歌地图、高德地图、苹果钱包直接申请', 0);
INSERT INTO packing_categories (id, name, sort_order) VALUES (5, '通讯', 4);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (5, '手机、流量卡、换卡卡针', '淘宝购买流量卡', 0);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (5, '翻译软件', '谷歌翻译、拍照翻译', 1);
INSERT INTO packing_categories (id, name, sort_order) VALUES (6, '电子设备', 5);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (6, '充电宝、充电线、转换插头', '手机、ipad、充电宝、耳机（各配充电线）', 0);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (6, '相机、pocket3', '电池（不可托运）、充电线', 1);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (6, '电脑、鼠标、充电线', '非必带', 2);
INSERT INTO packing_categories (id, name, sort_order) VALUES (7, '衣物', 6);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (7, '衣物', '内衣裤、袜子、外套、裙子、裤子、鞋、墨镜、帽子、手套（按需2天1套）、睡衣', 0);
INSERT INTO packing_categories (id, name, sort_order) VALUES (8, '杂物', 7);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (8, '杂物', '耳塞、雨伞、卫生纸、卫生巾、湿纸巾、口罩、垃圾袋、驱蚊、洗衣液、晾衣架、一次性手套马桶套', 0);
INSERT INTO packing_categories (id, name, sort_order) VALUES (9, '护肤化妆', 8);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (9, '基础护理', '洗面奶、水乳面霜、牙刷牙膏、洗发水护发素沐浴露、毛巾浴巾、面膜、刮胡刀、洗脸巾、洗手液、梳子、皮筋发夹、护手霜', 0);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (9, '防晒霜', '', 1);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (9, '飞行便携护理', '卸妆、洗面奶、面霜、漱口水、唇膏、一次性拖鞋、颈枕、眼罩', 2);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (9, '化妆品', '美瞳、化妆刷、气垫、粉底、遮瑕、定妆粉、眉笔、眼影、眼线、睫毛夹、睫毛膏、腮红、高光阴影、口红、唇膏、素颜霜、项链、耳钉、卸妆', 3);
INSERT INTO packing_categories (id, name, sort_order) VALUES (10, '保险', 9);
INSERT INTO packing_items (category_id, item, note, sort_order) VALUES (10, '旅游保险', '支付宝', 0);

INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (1, '乌兰察布&包头火山草原3日游', '内蒙古', '🌋', '3天', '8月周末', '乌兰哈达火山公园露营、辉腾锡勒草原黄花沟、包头响沙湾沙漠', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (1, '乌兰哈达火山', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (1, '黄花沟草原', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (1, '响沙湾沙漠', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (1, '联营烧麦', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (2, '新加坡4日游', '新加坡', '🦁', '4天', '10月', '鱼尾狮公园、滨海湾花园、圣淘沙环球影城、SEA海洋馆', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (2, '鱼尾狮公园', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (2, '滨海湾花园', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (2, '圣淘沙', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (2, '乌节路', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (3, '武汉3日游', '武汉', '🌸', '3天', '端午', '黄鹤楼、长江大桥、东湖、武汉大学、湖北省博物馆、过早文化', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (3, '黄鹤楼', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (3, '东湖', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (3, '武汉大学', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (3, '热干面', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (4, '川藏线自驾', '川藏线', '🏔️', '10-15天', '国庆', '成都出发经稻城亚丁到拉萨，布达拉宫、纳木错、珠峰大本营', 3);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (4, '稻城亚丁', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (4, '布达拉宫', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (4, '纳木错', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (4, '珠峰大本营', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (5, '北海&桂林&柳州', '广西', '🛶', '5-7天', '国庆', '涠洲岛、桂林山水、柳州螺蛳粉', 4);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (5, '涠洲岛', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (5, '漓江', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (5, '阳朔', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (5, '柳州螺蛳粉', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (6, '杭州2日游', '杭州', '🌿', '2天', '周末', '西湖、灵隐寺、龙井村、西溪湿地', 5);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (6, '西湖', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (6, '灵隐寺', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (6, '龙井村', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (6, '西溪湿地', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (7, '大理&丽江&香格里拉', '云南', '🏯', '7-10天', '国庆', '大理古城、洱海、丽江古城、玉龙雪山、虎跳峡、香格里拉', 6);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (7, '洱海', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (7, '丽江古城', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (7, '玉龙雪山', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (7, '香格里拉', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (8, '三亚度假', '三亚', '🏖️', '5-7天', '冬季', '亚龙湾、蜈支洲岛、天涯海角、南山寺', 7);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (8, '亚龙湾', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (8, '蜈支洲岛', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (8, '海棠湾', 2);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (9, '西藏深度游', '西藏', '🏔️', '10-14天', '8月', '拉萨、林芝、羊卓雍措、日喀则、珠峰大本营', 8);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (9, '布达拉宫', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (9, '羊卓雍措', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (9, '珠峰大本营', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (9, '纳木错', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (10, '北疆大环线', '新疆', '🏜️', '10-15天', '9月', '赛里木湖、独库公路、巴音布鲁克、那拉提、魔鬼城', 9);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (10, '赛里木湖', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (10, '独库公路', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (10, '那拉提草原', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (10, '禾木', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (11, '广州&顺德美食之旅', '广州', '🍜', '3天', '周末', '广州塔、沙面、长隆、顺德美食', 10);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (11, '广州塔', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (11, '沙面', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (11, '顺德美食', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (11, '长隆', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (12, '首尔5日游', '首尔', '🇰🇷', '5天', '国庆', '景福宫、明洞、首尔塔、江南、弘大', 11);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (12, '景福宫', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (12, '明洞', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (12, '首尔塔', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (12, '弘大', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (13, '曼谷&清迈', '泰国', '🛕', '7-10天', '冬季', '大皇宫、清迈古城、拜县、普吉岛', 12);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (13, '大皇宫', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (13, '清迈古城', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (13, '普吉岛', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (13, '拜县', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (14, '马尔代夫蜜月', '马尔代夫', '🏝️', '5天', '12月', '水屋、浮潜、海豚巡游、SPA', 13);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (14, '水屋', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (14, '浮潜', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (14, '海豚巡游', 2);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (15, '冰岛极光之旅', '冰岛', '🌌', '10天', '冬季', '蓝湖温泉、黄金圈、冰河湖、极光', 14);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (15, '蓝湖', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (15, '极光', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (15, '冰河湖', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (15, '黄金圈', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (16, '济州岛3日游', '济州岛', '🍊', '3天', '任意', '汉拿山、城山日出峰、牛岛、涯月邑', 15);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (16, '汉拿山', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (16, '城山日出峰', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (16, '牛岛', 2);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (16, '涯月邑', 3);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (17, '洛阳2日游', '洛阳', '🏯', '2天', '4月', '龙门石窟、白马寺、老君山、洛阳博物馆', 16);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (17, '龙门石窟', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (17, '白马寺', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (17, '老君山', 2);
INSERT INTO wishlist_items (id, title, city, emoji, duration, season, description, sort_order) VALUES (18, '贵州避暑游', '贵州', '🌿', '5-7天', '夏季', '黄果树瀑布、荔波小七孔、西江千户苗寨、镇远古镇', 17);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (18, '黄果树瀑布', 0);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (18, '小七孔', 1);
INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (18, '千户苗寨', 2);

-- Journey 1: 法国
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (1, '欧洲', '法国', '国外', '2026-04-20', '2026-04-23', '法国', '💍', '2026年婚假欧洲之旅，遍历浪漫巴黎、阿尔卑斯雪山、文艺复兴意大利。', '这是人生中最重要的一次旅行，13天的法瑞意深度游。从巴黎的浪漫街头开始，途经瑞士的雪山湖泊，最终抵达意大利的千年古都。每一个城市都留下了属于两个人的足迹。', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (1, '巴黎圣母院、埃菲尔铁塔', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (1, '塞纳河船餐 、凡尔赛宫', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (1, '凯旋门、香榭丽舍、蒙马特高地、圣心大教堂', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (1, '卢浮宫', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (1, '老佛爷购物', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (1, 32149, 0, 0, 0, 2098.32, 0);
INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, sort_order) VALUES ('sub-1-1', 1, '法国', '欧洲', '法国', '国外', '2026-04-20', '2026-04-23', '💍', '', 0);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1-1', '巴黎圣母院、埃菲尔铁塔', 0);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1-1', '塞纳河船餐 、凡尔赛宫', 1);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1-1', '凯旋门、香榭丽舍、蒙马特高地、圣心大教堂', 2);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1-1', '卢浮宫', 3);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1-1', '老佛爷购物', 4);
INSERT INTO sub_card_costs (sub_card_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES ('sub-1-1', 32149, 0, 0, 0, 2098.32, 0);
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 0, '日期', 0, '2026-04-20');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 0, '日期', 1, '2026-04-21');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 0, '日期', 2, '2026-04-22');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 0, '日期', 3, '2026-04-23');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 1, '上午', 1, '巴黎圣母院、埃菲尔铁塔');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 1, '上午', 2, '凯旋门、香榭丽舍、蒙马特高地、圣心大教堂');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 1, '上午', 3, '老佛爷购物');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 2, '下午', 1, '塞纳河船餐 、凡尔赛宫');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 2, '下午', 2, '卢浮宫');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 3, '备注', 0, '13:30-18:15北京首都-巴黎戴高乐');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1-1', 3, '备注', 3, '下午大巴前往瑞士');
INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, sort_order) VALUES ('sub-1779520866926', 1, '瑞士', '欧洲', '瑞士', '国外', '2026-4-23', '2026-4-26', '📍', '', 1);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779520866926', '布里恩茨湖游船、何维克街', 0);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779520866926', '哈德昆登山小火车', 1);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779520866926', '少女峰、施陶河瀑布', 2);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779520866926', '黄金快车、龙疆湖', 3);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779520866926', '垂死狮子像、卡佩尔廊桥', 4);
INSERT INTO sub_card_costs (sub_card_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES ('sub-1779520866926', 0, 0, 0, 0, 3140.96, 0);
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 0, '日期', 0, '2026-4-23');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 0, '日期', 1, '2026-4-24');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 0, '日期', 2, '2026-4-25');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 0, '日期', 3, '2026-4-26');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 1, '上午', 1, '布里恩茨湖游船、何维克街');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 1, '上午', 2, '少女峰、施陶河瀑布');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 1, '上午', 3, '垂死狮子像、卡佩尔廊桥');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 2, '下午', 1, '哈德昆登山小火车');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 2, '下午', 2, '黄金快车、龙疆湖');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 3, '备注', 0, '住在法国小镇');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779520866926', 3, '备注', 3, '下午大巴前往意大利');
INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, sort_order) VALUES ('sub-1779521304207', 1, '意大利', '欧洲', '意大利', '国外', '2026-4-26', '2026-5-2', '📍', '', 2);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '米兰大教堂、斯卡拉歌剧院', 0);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '圣马可广场、贡多拉游船、叹息桥', 1);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '奥特莱斯', 2);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '五渔村', 3);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '比萨斜塔', 4);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '领主广场、圣母百花大教堂', 5);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '乌菲兹美术馆', 6);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '锡耶纳田野广场', 7);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '皮恩扎奥尔恰山谷', 8);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '西班牙阶梯、特雷维喷泉、万神殿', 9);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779521304207', '斗兽场', 10);
INSERT INTO sub_card_costs (sub_card_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES ('sub-1779521304207', 0, 0, 0, 0, 2104, 0);
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 0, '日期', 0, '2026-4-26');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 0, '日期', 1, '2026-4-27');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 0, '日期', 2, '2026-4-28');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 0, '日期', 3, '2026-4-29');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 0, '日期', 4, '2026-4-30');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 0, '日期', 5, '2026-5-1');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 0, '日期', 6, '2026-5-2');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 1, '上午', 1, '圣马可广场、贡多拉游船、叹息桥');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 1, '上午', 2, '五渔村');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 1, '上午', 3, '领主广场、圣母百花大教堂');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 1, '上午', 4, '锡耶纳田野广场');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 1, '上午', 5, '西班牙阶梯、特雷维喷泉、万神殿');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 2, '下午', 0, '米兰大教堂、斯卡拉歌剧院');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 2, '下午', 1, '奥特莱斯');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 2, '下午', 2, '比萨斜塔');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 2, '下午', 3, '乌菲兹美术馆');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 2, '下午', 4, '皮恩扎奥尔恰山谷');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 2, '下午', 5, '斗兽场');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 3, '备注', 0, '下午大巴至意大利');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 3, '备注', 5, '20:30-12:45 罗马菲乌米奇诺-北京首都');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779521304207', 3, '备注', 6, '中午抵达北京');

-- Journey 2: 冬日厦门海滨漫游
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (2, '福建', '厦门', '中国', '2026-01-15', '2026-01-17', '冬日厦门海滨漫游', '🏝️', '三天两晚厦门之旅，漫步鼓浪屿、环岛路、中山路步行街，感受南方暖冬。', '1月15日早班机抵达厦门，入住中山路步行街附近酒店。第一天逛了中山路、黄厝沙滩和曾厝垵。第二天提前预约了厦门大学，参观了南普陀寺、坐了钟鼓索道、逛了厦门植物园。第三天整天在鼓浪屿，从最美转角到日光岩，最后在八市吃了海鲜。傍晚飞回北京。', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (2, '鼓浪屿', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (2, '厦门大学', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (2, '南普陀寺', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (2, '黄厝沙滩', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (2, '曾厝垵', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (2, 0, 0, 0, 0, 0, 0);

-- Journey 3: 冰雪长白山&延吉
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (3, '吉林', '长白山&延吉', '中国', '2025-12-19', '2025-12-21', '冰雪长白山&延吉', '🏔️', '三天东北冰雪之旅，从延吉网红墙到长白山天池，体验朝鲜族风情与雪域奇观。', '12月19日早班机飞抵延吉，打卡网红墙和延边大学，吃了大朴家烤肉。第二天上午逛水上市场和朝鲜民俗园，下午高铁前往长白山，吃了高丽锅。第三天全天长白山北坡游览，天池、瀑布、绿渊潭、谷底森林，晚上高铁回京。原预算6495，实际花费3879，怒省2616！', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (3, '延吉网红墙', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (3, '朝鲜民俗园', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (3, '长白山天池', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (3, '长白山瀑布', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (3, '绿渊潭', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (3, 0, 0, 0, 0, 0, 0);

-- Journey 4: 周末沈阳特种兵
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (4, '辽宁', '沈阳', '中国', '2025-07-05', '2025-07-06', '周末沈阳特种兵', '🛀', '两天一夜沈阳之旅，故宫、大帅府、西塔美食、东北洗浴文化一站式体验。', '7月5日高铁抵达沈阳，先去西塔吃韩国料理，然后逛沈阳故宫和大帅府。晚上体验东北洗浴文化，夜宵吃野人串吧。第二天早起去小河沿早市，吃雪绵豆沙、羊杂汤、肉蛋堡，然后返程回京。', 4);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (4, '沈阳故宫', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (4, '西塔韩国风情街', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (4, '东北洗浴', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (4, '小河沿早市', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (4, '中街', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (4, 0, 0, 0, 0, 0, 0);

-- Journey 5: 星月国奇幻之旅
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (5, '土耳其', '伊斯坦布尔&卡帕多奇亚', '土耳其', '2025-04-26', '2025-05-05', '星月国奇幻之旅', '🎈', '十天土耳其深度游，热气球、棉花堡、蓝色清真寺，横跨欧亚大陆的浪漫。', '十天的土耳其之旅，从伊斯坦布尔开始，探访蓝色清真寺和圣索菲亚大教堂。飞往卡帕多奇亚乘坐日出热气球，俯瞰精灵烟囱。在棉花堡赤脚走在白色钙华梯田上，最后抵达以弗所触摸古希腊文明的遗迹。', 5);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (5, '卡帕多奇亚热气球', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (5, '蓝色清真寺', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (5, '棉花堡', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (5, '以弗所古城', 3);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (5, 0, 0, 0, 0, 0, 0);

-- Journey 6: 港澳珠大湾区五日游
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (6, '广东', '港澳珠', '中国', '2025-04-03', '2025-04-07', '港澳珠大湾区五日游', '🌃', '五天四晚粤港澳之旅，香港迪士尼、澳门大三巴、珠海长隆、港珠澳大桥。', '4月3日飞抵香港，逛旺角、尖沙咀、维多利亚港，晚上入住湾仔。4月4日全天香港迪士尼，从魔雪奇缘世界到灰熊山谷。4月5日上午逛中环铜锣湾，下午经港珠澳大桥坐大巴到珠海，逛圆明新园和日月贝。4月6日澳门一日游，新葡京、大三巴、官也街、威尼斯人。4月7日珠海长隆海洋王国，傍晚飞回北京。合计花费约11868元。', 6);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (6, '香港迪士尼', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (6, '维多利亚港', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (6, '澳门大三巴', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (6, '珠海长隆', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (6, '港珠澳大桥', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (6, 0, 0, 0, 0, 0, 0);

-- Journey 7: 北疆秋色大环线
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (7, '新疆', '北疆', '中国', '2024-09-30', '2024-10-06', '北疆秋色大环线', '🍂', '七天六晚北疆之旅，天山天池、禾木村、喀纳斯、魔鬼城、赛里木湖。', '国庆期间报团游览北疆大环线。从天池出发，经过布尔津前往禾木村，看晨雾中的图瓦人木屋。喀纳斯湖的碧水倒映着金黄的白桦林。魔鬼城的雅丹地貌在夕阳下如同异域星球。最后一站赛里木湖，大西洋的最后一滴眼泪。', 7);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (7, '天山天池', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (7, '禾木村', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (7, '喀纳斯', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (7, '世界魔鬼城', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (7, '赛里木湖', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (7, 0, 0, 0, 0, 0, 0);

-- Journey 8: 全家北京深度游
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (8, '北京', '北京', '中国', '2024-08-24', '2024-08-28', '全家北京深度游', '🏯', '五天四晚带家人游北京，故宫、颐和园、天坛、长城，感受首都的历史与繁华。', '8月24日家人从庆阳坐高铁抵达北京。五天行程满满：第一天吃烤鸭逛天安门王府井；第二天毛主席纪念堂、天安门城楼、故宫、恭王府；第三天清华北大、圆明园、自然博物馆、天坛；第四天电影抓娃娃、颐和园、鸟巢水立方；第五天返程。实际花费约10700元。', 8);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (8, '故宫博物院', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (8, '颐和园', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (8, '天坛', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (8, '恭王府', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (8, '北海公园', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (8, 0, 0, 0, 0, 0, 0);

-- Journey 9: 青岛海滨三日游
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (9, '山东', '青岛', '中国', '2024-06-08', '2024-06-10', '青岛海滨三日游', '🍺', '端午假期青岛之旅，石老人日出、栈桥、八大关、小麦岛、青岛啤酒。', '6月8日晚抵达青岛北站，入住石老人附近。第二天早起看石老人日出，逛栈桥、信号山公园、八大关风景区。晚上在五四广场看灯光秀。第三天去小麦岛，下午参观青岛海洋极地公园，晚上高铁返京。', 9);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (9, '石老人海水浴场', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (9, '栈桥', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (9, '八大关', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (9, '小麦岛', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (9, '青岛啤酒', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (9, 0, 0, 0, 0, 0, 0);

-- Journey 10: 五一日本赏樱之旅
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (10, '日本', '东京&京都&大阪', '日本', '2024-04-27', '2024-05-03', '五一日本赏樱之旅', '🌸', '黄金周日本七日游，东京、京都、大阪，正值樱花季尾声。', '五一黄金周日本之旅。东京的繁华与京都的古朴形成鲜明对比。在清水寺看日落，在伏见稻荷大社穿越千本鸟居，在岚山竹林感受宁静。最后在大阪道顿堀大快朵颐，去奈良和小鹿互动。', 10);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (10, '清水寺', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (10, '伏见稻荷大社', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (10, '岚山竹林', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (10, '大阪城', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (10, '奈良公园', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (10, 0, 0, 0, 0, 0, 0);

-- Journey 11: 清明大同古建巡礼
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (11, '山西', '大同', '中国', '2024-04-04', '2024-04-06', '清明大同古建巡礼', '🗿', '三天两晚山西大同之旅，云冈石窟、应县木塔、悬空寺、恒山、大同古城。', '清明假期自驾/高铁前往大同。第一天游览云冈石窟，看千年佛像。第二天应县木塔、悬空寺、恒山一日游。第三天逛大同古城，吃凯鸽酒楼、抿八股、压豆面。', 11);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (11, '云冈石窟', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (11, '应县木塔', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (11, '悬空寺', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (11, '恒山', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (11, '大同古城', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (11, 0, 0, 0, 0, 0, 0);

-- Journey 12: 跨年冰雪哈尔滨
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (12, '黑龙江', '哈尔滨', '中国', '2023-12-30', '2024-01-01', '跨年冰雪哈尔滨', '❄️', '元旦三天哈尔滨之旅，冰雪大世界、中央大街、索菲亚大教堂、东北铁锅炖。', '12月30日高铁抵达哈尔滨，晚上吃山河屯铁锅炖，逛中央大街吃糖葫芦，走到防洪纪念塔看松花江。12月31日全天冰雪大世界，晚上跨年。1月1日上午参观索菲亚大教堂，中午吃牛蛙锅，然后返程。必备暖宝宝、墨镜、棉裤、棉鞋！', 12);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (12, '冰雪大世界', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (12, '中央大街', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (12, '索菲亚大教堂', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (12, '松花江', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (12, '东北洗浴', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (12, 0, 0, 0, 0, 0, 0);

-- Journey 13: 国庆黄山上海七日游
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (13, '安徽&上海', '黄山&上海', '中国', '2023-09-29', '2023-10-05', '国庆黄山上海七日游', '⛰️', '国庆假期婺源篁岭、宏村、黄山、上海七日游，从徽派古村到魔都繁华。', '9月29日高铁到婺源，游篁岭看晒秋。30日前往宏村，水墨徽派建筑。10月1日爬黄山，奇松怪石云海。10月2日下山高铁到上海。10月3日武康路、新天地、豫园、外滩、陆家嘴。10月4日人民广场、外白渡桥、1933老场坊。10月5日返程。预算5600元。', 13);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (13, '婺源篁岭', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (13, '宏村', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (13, '黄山', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (13, '外滩', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (13, '武康路', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (13, 0, 0, 0, 0, 0, 0);

-- Journey 14: 端午大连看海
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (14, '辽宁', '大连', '中国', '2023-06-22', '2023-06-24', '端午大连看海', '🌊', '三天大连海滨之旅，棒棰岛、星海广场、东方威尼斯水城、海鲜大餐。', '端午节大连三日游。第一天东港音乐喷泉广场和威尼斯水城夜景。第二天棒棰岛看日出，渔人码头、菱角湾、黑石礁、星海公园、星海广场。第三天银沙滩。吃了日月昇海鲜码头、钱库里海鲜自助，实现海鲜自由。', 14);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (14, '棒棰岛', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (14, '星海广场', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (14, '东方威尼斯水城', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (14, '东港音乐喷泉', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (14, '菱角湾', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (14, 0, 0, 0, 0, 0, 0);

-- Journey 15: 520泰山夜爬之旅
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (15, '山东', '泰山&济南', '中国', '2023-05-20', '2023-05-21', '520泰山夜爬之旅', '🌄', '周末泰山济南两日游，夜爬泰山看日出，济南趵突泉大明湖逛老城。', '5月20日周六，北京站坐夜车硬卧到泰山站。天外村坐大巴到中天门，再徒步3小时到南天门、玉皇顶。下山坐桃花源索道。下午高铁到济南。晚上吃烧烤。第二天逛趵突泉、黑虎泉、大明湖、超然楼、曲水亭街、宽厚里，吃把子肉，晚高铁返京。', 15);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (15, '泰山日出', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (15, '趵突泉', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (15, '大明湖', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (15, '超然楼', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (15, '芙蓉街', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (15, 0, 0, 0, 0, 0, 0);

-- Journey 16: 国庆长沙张家界极限跑毒
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (16, '湖南', '长沙&张家界', '中国', '2022-10-01', '2022-10-06', '国庆长沙张家界极限跑毒', '😷', '国庆六日游长沙张家界，经历黄码申诉、武陵源封控、极限买机票返京的难忘旅程。', '10月1日到长沙，橘子洲头、五一广场、太平街，喝茶颜悦色。10月2日岳麓山、岳麓书院、文和友。10月3日高铁到张家界，黄龙洞。10月4日张家界国家森林公园。10月5日一觉醒来武陵源黄码，申诉后转绿，发现北京健康宝弹窗。10月6日武陵源封控，极限刷到下午4点45的机票，坐摩托赶到机场，登机前收到红头文件发现阳性。一环扣一环，极限跑毒保住绿码！', 16);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (16, '橘子洲头', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (16, '岳麓书院', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (16, '张家界国家森林公园', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (16, '黄龙洞', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (16, '茶颜悦色', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (16, 0, 0, 0, 0, 0, 0);

-- Journey 17: 川渝六日美食之旅
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (17, '四川&重庆', '成都&重庆', '中国', '2023-09-29', '2023-10-04', '川渝六日美食之旅', '🐼', '国庆成都重庆六日游，大熊猫、火锅、洪崖洞、李子坝，吃遍川渝美食。', '9月29日高铁到成都，春熙路太古里。30日人民公园、成都博物馆、宽窄巷子、文殊院。10月1日大熊猫基地、杜甫草堂、武侯祠、锦里。10月2日高铁到重庆，解放碑、洪崖洞、千厮门大桥。10月3日李子坝、重庆动物园。10月4日返程。吃了火锅、兔头、烤苕皮、钵钵鸡、重庆小面。', 17);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (17, '大熊猫基地', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (17, '宽窄巷子', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (17, '洪崖洞', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (17, '李子坝', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (17, '长江索道', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (17, 0, 0, 0, 0, 0, 0);

-- Journey 18: 江南五日游
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (18, '江苏', '苏州&南京', '中国', '2021-09-30', '2021-10-04', '江南五日游', '🎋', '国庆苏州南京五日游，拙政园、平江路、秦淮河、夫子庙，体验江南水乡。', '9月30日北京到苏州，逛观前街。10月1日苏州博物馆、拙政园、平江路、山塘街。10月2日同里古镇。10月3日寒山寺、淮海街，下午高铁到南京，晚上秦淮河夫子庙。10月4日鸡鸣寺、玄武湖、明城墙、老门东，晚上返京。吃了苏州太太苏帮菜、桃花源记醉蟹、南京大牌档。', 18);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (18, '拙政园', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (18, '平江路', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (18, '山塘街', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (18, '秦淮河', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (18, '鸡鸣寺', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (18, 0, 0, 0, 0, 0, 0);

-- Journey 19: 古都西安文化之旅
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (19, '陕西', '西安', '中国', '2019-04-05', '2019-04-07', '古都西安文化之旅', '🏛️', '多次探访西安，大明宫、回民街、永兴坊、大唐不夜城、兵马俑。', '从2016到2019多次前往西安。第一次是大明宫和牛羊肉泡馍。后来陆续去了西安博物馆、永兴坊、大唐不夜城。每次去回民街都会吃串、魏家凉皮，看完电影吃海底捞。西安是一座每次去都有新发现的城市。', 19);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (19, '大唐不夜城', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (19, '回民街', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (19, '永兴坊', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (19, '牛羊肉泡馍', 3);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (19, 0, 0, 0, 0, 0, 0);

-- Journey 20: 北京游记（2019-2025）
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (20, '北京', '北京', '中国', '2019-02-01', '2025-12-13', '北京游记（2019-2025）', '🦆', '常年居住北京，周末和假期探索首都的每一个角落，从故宫到奥森，从演唱会到公园。', '在北京生活多年，利用周末和假期探索了几乎所有知名景点。2019年天安门、中山公园、动物园。2021年故宫、颐和园、玉渊潭。2022年圆明园、北海公园、香山、黄花城水长城。2023年环球影城、居庸关长城、野生动物园、鸟巢薛之谦演唱会。2024年全家游、邓紫棋/张杰/许嵩演唱会、八达岭长城。2025年地坛公园、雍和宫、朝阳公园、欢乐谷、密云水库、野鸭湖、景山公园。', 20);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (20, '故宫', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (20, '颐和园', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (20, '环球影城', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (20, '鸟巢演唱会', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (20, '奥森公园', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (20, 0, 0, 0, 0, 0, 0);

-- Journey 21: 国庆秦皇岛看海
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (21, '河北', '秦皇岛', '中国', '2020-10-02', '2020-10-05', '国庆秦皇岛看海', '🦀', '四天三晚秦皇岛之旅，鸽子窝日出、野生动物园、碧螺岛、海鲜大餐。', '2020年国庆去秦皇岛，住在庆山饭店。早起去鸽子窝公园看日出，白天逛野生动物园，晚上在碧螺岛海上酒吧。吃了秦皇小巷和燕大夜市，还有大锅蒸海鲜。', 21);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (21, '鸽子窝公园', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (21, '秦皇岛野生动物园', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (21, '碧螺岛', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (21, '秦皇小巷', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (21, '蒸海鲜', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (21, 0, 0, 0, 0, 0, 0);

-- Journey 22: 天津多次游览
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (22, '天津', '天津', '中国', '2019-02-01', '2025-06-22', '天津多次游览', '🎡', '多次前往天津，意大利风情区、天津之眼、海河游船、极地海洋公园、玛雅水上乐园。', '2019年2月第一次去天津，逛津门故里、意大利风情区、天津之眼、海河。2019年9月去天津海昌极地海洋公园。2021年6月意大利风情区、天津之眼、游船、玛雅海滩水公园。2025年6月再次去玛雅水上乐园。', 22);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (22, '天津之眼', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (22, '意大利风情区', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (22, '海河游船', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (22, '极地海洋公园', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (22, '玛雅海滩水公园', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (22, 0, 0, 0, 0, 0, 0);

-- Journey 23: 大连威海四日游
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (23, '辽宁&山东', '大连&威海', '中国', '2023-06-22', '2023-06-25', '大连威海四日游', '🚢', '大连威海四日游，菱角湾、棒棰岛、跨海轮渡海上日出、威海海岸线。', '第一天黑石礁、星海公园、星海广场、银沙滩。第二天菱角湾、虎滩公园、渔人码头、棒棰岛、威尼斯水城、东港喷泉，晚上大连港坐轮渡到威海（卧铺，海上日出）。第三天威海港、悦海公园灯塔、大相框、幸福门、半月湾、猫头山、火炬八街。', 23);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (23, '棒棰岛', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (23, '菱角湾', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (23, '海上轮渡日出', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (23, '火炬八街', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (23, '猫头山', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (23, 0, 0, 0, 0, 0, 0);

-- Journey 24: 兰州美食之旅
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (24, '甘肃', '兰州', '中国', '2018-01-01', '2018-01-01', '兰州美食之旅', '🍜', '兰州多次游览，中山桥、白塔山、黄河、甘肃省博物馆、牛肉面。', '多次去兰州，逛中山桥、白塔山、五泉山，在黄河边喝茶。参观甘肃省博物馆看马踏飞燕。吃正宗兰州牛肉面、羊杂碎。还去了兰山公园看夜景。', 24);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (24, '中山桥', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (24, '白塔山', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (24, '甘肃省博物馆', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (24, '黄河', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (24, '兰州牛肉面', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (24, 0, 0, 0, 0, 0, 0);

-- Journey 25: 南阳理工学院
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (25, '河南', '南阳', '中国', '2018-10-01', '2018-10-03', '南阳理工学院', '🎓', '2018年国庆南阳之行，南阳理工学院、人民公园、白河、小吃街。', '2018年国庆去南阳，逛了南阳理工学院校园，去人民公园和白河划船，吃烤鱼和当地小吃。还在动物园看了动物，买了桂花和枇杷。', 25);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (25, '南阳理工学院', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (25, '白河', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (25, '人民公园', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (25, '烤鱼', 3);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (25, '小吃街', 4);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (25, 0, 0, 0, 0, 0, 0);

-- Journey 26: 厦门
INSERT INTO journeys (id, province, city, country, date, end_date, title, emoji, description, story, sort_order) VALUES (26, '福建', '厦门', '中国', '2026-01-15', '2026-01-17', '厦门', '📍', '', '', 26);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (26, '中山路步行街、黄厝沙滩、白城沙滩、曾厝垵', 0);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (26, '沙坡尾、厦门大学、南普陀寺', 1);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (26, '钟鼓索道、厦门植物园、十里长堤、集美学村', 2);
INSERT INTO highlights (journey_id, text, sort_order) VALUES (26, '鼓浪屿（三丘田码头-最美转角-管风琴博物馆八卦楼-日光岩-菽庄花园-大德记浴场-皓月园-三丘田码头）', 3);
INSERT INTO costs (journey_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES (26, 0, 1427, 300, 0, 0, 200);
INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, sort_order) VALUES ('sub-1779522583050', 26, '厦门', '福建', '厦门', '中国', '2026-01-15', '2026-01-17', '📍', '', 0);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779522583050', '中山路步行街、黄厝沙滩、白城沙滩、曾厝垵', 0);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779522583050', '沙坡尾、厦门大学、南普陀寺', 1);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779522583050', '钟鼓索道、厦门植物园、十里长堤、集美学村', 2);
INSERT INTO sub_card_highlights (sub_card_id, text, sort_order) VALUES ('sub-1779522583050', '鼓浪屿（三丘田码头-最美转角-管风琴博物馆八卦楼-日光岩-菽庄花园-大德记浴场-皓月园-三丘田码头）', 3);
INSERT INTO sub_card_costs (sub_card_id, package_fee, transport_fee, accommodation_fee, food_fee, shopping_fee, ticket_fee) VALUES ('sub-1779522583050', 0, 1427, 300, 0, 0, 200);
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779522583050', 0, '日期', 0, '2026-01-15');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779522583050', 0, '日期', 1, '2026-01-16');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779522583050', 0, '日期', 2, '2026-01-17');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779522583050', 1, '上午', 1, '沙坡尾、厦门大学、南普陀寺');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779522583050', 1, '上午', 2, '鼓浪屿（三丘田码头-最美转角-管风琴博物馆八卦楼-日光岩-菽庄花园-大德记浴场-皓月园-三丘田码头）');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779522583050', 2, '下午', 0, '中山路步行街、黄厝沙滩、白城沙滩、曾厝垵');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779522583050', 2, '下午', 1, '钟鼓索道、厦门植物园、十里长堤、集美学村');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779522583050', 3, '备注', 0, '7:00-9:50 北京首都-厦门高崎');
INSERT INTO sub_card_itinerary (sub_card_id, header_index, header_text, row_index, cell_value) VALUES ('sub-1779522583050', 3, '备注', 2, '18:35-21:40 厦门高崎-北京首都');

COMMIT;
