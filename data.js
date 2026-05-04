const defaultJourneys = [
    {
        id: 1,
        province: "欧洲",
        city: "法瑞意",
        country: "法国·瑞士·意大利",
        date: "2026-04-20",
        endDate: "2026-05-02",
        title: "婚假法瑞意13日游",
        emoji: "💍",
        description: "2026年婚假欧洲之旅，遍历浪漫巴黎、阿尔卑斯雪山、文艺复兴意大利。",
        highlights: ["埃菲尔铁塔", "少女峰", "威尼斯水城", "罗马斗兽场", "卢浮宫"],
        story: "这是人生中最重要的一次旅行，13天的法瑞意深度游。从巴黎的浪漫街头开始，途经瑞士的雪山湖泊，最终抵达意大利的千年古都。每一个城市都留下了属于两个人的足迹。"
    },
    {
        id: 2,
        province: "福建",
        city: "厦门",
        country: "中国",
        date: "2026-01-15",
        endDate: "2026-01-17",
        title: "冬日厦门海滨漫游",
        emoji: "🏝️",
        description: "三天两晚厦门之旅，漫步鼓浪屿、环岛路、中山路步行街，感受南方暖冬。",
        highlights: ["鼓浪屿", "厦门大学", "南普陀寺", "黄厝沙滩", "曾厝垵"],
        story: "1月15日早班机抵达厦门，入住中山路步行街附近酒店。第一天逛了中山路、黄厝沙滩和曾厝垵。第二天提前预约了厦门大学，参观了南普陀寺、坐了钟鼓索道、逛了厦门植物园。第三天整天在鼓浪屿，从最美转角到日光岩，最后在八市吃了海鲜。傍晚飞回北京。"
    },
    {
        id: 3,
        province: "吉林",
        city: "长白山&延吉",
        country: "中国",
        date: "2025-12-19",
        endDate: "2025-12-21",
        title: "冰雪长白山&延吉",
        emoji: "🏔️",
        description: "三天东北冰雪之旅，从延吉网红墙到长白山天池，体验朝鲜族风情与雪域奇观。",
        highlights: ["延吉网红墙", "朝鲜民俗园", "长白山天池", "长白山瀑布", "绿渊潭"],
        story: "12月19日早班机飞抵延吉，打卡网红墙和延边大学，吃了大朴家烤肉。第二天上午逛水上市场和朝鲜民俗园，下午高铁前往长白山，吃了高丽锅。第三天全天长白山北坡游览，天池、瀑布、绿渊潭、谷底森林，晚上高铁回京。原预算6495，实际花费3879，怒省2616！"
    },
    {
        id: 4,
        province: "辽宁",
        city: "沈阳",
        country: "中国",
        date: "2025-07-05",
        endDate: "2025-07-06",
        title: "周末沈阳特种兵",
        emoji: "🛀",
        description: "两天一夜沈阳之旅，故宫、大帅府、西塔美食、东北洗浴文化一站式体验。",
        highlights: ["沈阳故宫", "西塔韩国风情街", "东北洗浴", "小河沿早市", "中街"],
        story: "7月5日高铁抵达沈阳，先去西塔吃韩国料理，然后逛沈阳故宫和大帅府。晚上体验东北洗浴文化，夜宵吃野人串吧。第二天早起去小河沿早市，吃雪绵豆沙、羊杂汤、肉蛋堡，然后返程回京。"
    },
    {
        id: 5,
        province: "土耳其",
        city: "伊斯坦布尔&卡帕多奇亚",
        country: "土耳其",
        date: "2025-04-26",
        endDate: "2025-05-05",
        title: "星月国奇幻之旅",
        emoji: "🎈",
        description: "十天土耳其深度游，热气球、棉花堡、蓝色清真寺，横跨欧亚大陆的浪漫。",
        highlights: ["卡帕多奇亚热气球", "蓝色清真寺", "棉花堡", "以弗所古城"],
        story: "十天的土耳其之旅，从伊斯坦布尔开始，探访蓝色清真寺和圣索菲亚大教堂。飞往卡帕多奇亚乘坐日出热气球，俯瞰精灵烟囱。在棉花堡赤脚走在白色钙华梯田上，最后抵达以弗所触摸古希腊文明的遗迹。"
    },
    {
        id: 6,
        province: "广东",
        city: "港澳珠",
        country: "中国",
        date: "2025-04-03",
        endDate: "2025-04-07",
        title: "港澳珠大湾区五日游",
        emoji: "🌃",
        description: "五天四晚粤港澳之旅，香港迪士尼、澳门大三巴、珠海长隆、港珠澳大桥。",
        highlights: ["香港迪士尼", "维多利亚港", "澳门大三巴", "珠海长隆", "港珠澳大桥"],
        story: "4月3日飞抵香港，逛旺角、尖沙咀、维多利亚港，晚上入住湾仔。4月4日全天香港迪士尼，从魔雪奇缘世界到灰熊山谷。4月5日上午逛中环铜锣湾，下午经港珠澳大桥坐大巴到珠海，逛圆明新园和日月贝。4月6日澳门一日游，新葡京、大三巴、官也街、威尼斯人。4月7日珠海长隆海洋王国，傍晚飞回北京。合计花费约11868元。"
    },
    {
        id: 7,
        province: "新疆",
        city: "北疆",
        country: "中国",
        date: "2024-09-30",
        endDate: "2024-10-06",
        title: "北疆秋色大环线",
        emoji: "🍂",
        description: "七天六晚北疆之旅，天山天池、禾木村、喀纳斯、魔鬼城、赛里木湖。",
        highlights: ["天山天池", "禾木村", "喀纳斯", "世界魔鬼城", "赛里木湖"],
        story: "国庆期间报团游览北疆大环线。从天池出发，经过布尔津前往禾木村，看晨雾中的图瓦人木屋。喀纳斯湖的碧水倒映着金黄的白桦林。魔鬼城的雅丹地貌在夕阳下如同异域星球。最后一站赛里木湖，大西洋的最后一滴眼泪。"
    },
    {
        id: 8,
        province: "北京",
        city: "北京",
        country: "中国",
        date: "2024-08-24",
        endDate: "2024-08-28",
        title: "全家北京深度游",
        emoji: "🏯",
        description: "五天四晚带家人游北京，故宫、颐和园、天坛、长城，感受首都的历史与繁华。",
        highlights: ["故宫博物院", "颐和园", "天坛", "恭王府", "北海公园"],
        story: "8月24日家人从庆阳坐高铁抵达北京。五天行程满满：第一天吃烤鸭逛天安门王府井；第二天毛主席纪念堂、天安门城楼、故宫、恭王府；第三天清华北大、圆明园、自然博物馆、天坛；第四天电影抓娃娃、颐和园、鸟巢水立方；第五天返程。实际花费约10700元。"
    },
    {
        id: 9,
        province: "山东",
        city: "青岛",
        country: "中国",
        date: "2024-06-08",
        endDate: "2024-06-10",
        title: "青岛海滨三日游",
        emoji: "🍺",
        description: "端午假期青岛之旅，石老人日出、栈桥、八大关、小麦岛、青岛啤酒。",
        highlights: ["石老人海水浴场", "栈桥", "八大关", "小麦岛", "青岛啤酒"],
        story: "6月8日晚抵达青岛北站，入住石老人附近。第二天早起看石老人日出，逛栈桥、信号山公园、八大关风景区。晚上在五四广场看灯光秀。第三天去小麦岛，下午参观青岛海洋极地公园，晚上高铁返京。"
    },
    {
        id: 10,
        province: "日本",
        city: "东京&京都&大阪",
        country: "日本",
        date: "2024-04-27",
        endDate: "2024-05-03",
        title: "五一日本赏樱之旅",
        emoji: "🌸",
        description: "黄金周日本七日游，东京、京都、大阪，正值樱花季尾声。",
        highlights: ["清水寺", "伏见稻荷大社", "岚山竹林", "大阪城", "奈良公园"],
        story: "五一黄金周日本之旅。东京的繁华与京都的古朴形成鲜明对比。在清水寺看日落，在伏见稻荷大社穿越千本鸟居，在岚山竹林感受宁静。最后在大阪道顿堀大快朵颐，去奈良和小鹿互动。"
    },
    {
        id: 11,
        province: "山西",
        city: "大同",
        country: "中国",
        date: "2024-04-04",
        endDate: "2024-04-06",
        title: "清明大同古建巡礼",
        emoji: "🗿",
        description: "三天两晚山西大同之旅，云冈石窟、应县木塔、悬空寺、恒山、大同古城。",
        highlights: ["云冈石窟", "应县木塔", "悬空寺", "恒山", "大同古城"],
        story: "清明假期自驾/高铁前往大同。第一天游览云冈石窟，看千年佛像。第二天应县木塔、悬空寺、恒山一日游。第三天逛大同古城，吃凯鸽酒楼、抿八股、压豆面。"
    },
    {
        id: 12,
        province: "黑龙江",
        city: "哈尔滨",
        country: "中国",
        date: "2023-12-30",
        endDate: "2024-01-01",
        title: "跨年冰雪哈尔滨",
        emoji: "❄️",
        description: "元旦三天哈尔滨之旅，冰雪大世界、中央大街、索菲亚大教堂、东北铁锅炖。",
        highlights: ["冰雪大世界", "中央大街", "索菲亚大教堂", "松花江", "东北洗浴"],
        story: "12月30日高铁抵达哈尔滨，晚上吃山河屯铁锅炖，逛中央大街吃糖葫芦，走到防洪纪念塔看松花江。12月31日全天冰雪大世界，晚上跨年。1月1日上午参观索菲亚大教堂，中午吃牛蛙锅，然后返程。必备暖宝宝、墨镜、棉裤、棉鞋！"
    },
    {
        id: 13,
        province: "安徽&上海",
        city: "黄山&上海",
        country: "中国",
        date: "2023-09-29",
        endDate: "2023-10-05",
        title: "国庆黄山上海七日游",
        emoji: "⛰️",
        description: "国庆假期婺源篁岭、宏村、黄山、上海七日游，从徽派古村到魔都繁华。",
        highlights: ["婺源篁岭", "宏村", "黄山", "外滩", "武康路"],
        story: "9月29日高铁到婺源，游篁岭看晒秋。30日前往宏村，水墨徽派建筑。10月1日爬黄山，奇松怪石云海。10月2日下山高铁到上海。10月3日武康路、新天地、豫园、外滩、陆家嘴。10月4日人民广场、外白渡桥、1933老场坊。10月5日返程。预算5600元。"
    },
    {
        id: 14,
        province: "辽宁",
        city: "大连",
        country: "中国",
        date: "2023-06-22",
        endDate: "2023-06-24",
        title: "端午大连看海",
        emoji: "🌊",
        description: "三天大连海滨之旅，棒棰岛、星海广场、东方威尼斯水城、海鲜大餐。",
        highlights: ["棒棰岛", "星海广场", "东方威尼斯水城", "东港音乐喷泉", "菱角湾"],
        story: "端午节大连三日游。第一天东港音乐喷泉广场和威尼斯水城夜景。第二天棒棰岛看日出，渔人码头、菱角湾、黑石礁、星海公园、星海广场。第三天银沙滩。吃了日月昇海鲜码头、钱库里海鲜自助，实现海鲜自由。"
    },
    {
        id: 15,
        province: "山东",
        city: "泰山&济南",
        country: "中国",
        date: "2023-05-20",
        endDate: "2023-05-21",
        title: "520泰山夜爬之旅",
        emoji: "🌄",
        description: "周末泰山济南两日游，夜爬泰山看日出，济南趵突泉大明湖逛老城。",
        highlights: ["泰山日出", "趵突泉", "大明湖", "超然楼", "芙蓉街"],
        story: "5月20日周六，北京站坐夜车硬卧到泰山站。天外村坐大巴到中天门，再徒步3小时到南天门、玉皇顶。下山坐桃花源索道。下午高铁到济南。晚上吃烧烤。第二天逛趵突泉、黑虎泉、大明湖、超然楼、曲水亭街、宽厚里，吃把子肉，晚高铁返京。"
    },
    {
        id: 16,
        province: "湖南",
        city: "长沙&张家界",
        country: "中国",
        date: "2022-10-01",
        endDate: "2022-10-06",
        title: "国庆长沙张家界极限跑毒",
        emoji: "😷",
        description: "国庆六日游长沙张家界，经历黄码申诉、武陵源封控、极限买机票返京的难忘旅程。",
        highlights: ["橘子洲头", "岳麓书院", "张家界国家森林公园", "黄龙洞", "茶颜悦色"],
        story: "10月1日到长沙，橘子洲头、五一广场、太平街，喝茶颜悦色。10月2日岳麓山、岳麓书院、文和友。10月3日高铁到张家界，黄龙洞。10月4日张家界国家森林公园。10月5日一觉醒来武陵源黄码，申诉后转绿，发现北京健康宝弹窗。10月6日武陵源封控，极限刷到下午4点45的机票，坐摩托赶到机场，登机前收到红头文件发现阳性。一环扣一环，极限跑毒保住绿码！"
    },
    {
        id: 17,
        province: "四川&重庆",
        city: "成都&重庆",
        country: "中国",
        date: "2023-09-29",
        endDate: "2023-10-04",
        title: "川渝六日美食之旅",
        emoji: "🐼",
        description: "国庆成都重庆六日游，大熊猫、火锅、洪崖洞、李子坝，吃遍川渝美食。",
        highlights: ["大熊猫基地", "宽窄巷子", "洪崖洞", "李子坝", "长江索道"],
        story: "9月29日高铁到成都，春熙路太古里。30日人民公园、成都博物馆、宽窄巷子、文殊院。10月1日大熊猫基地、杜甫草堂、武侯祠、锦里。10月2日高铁到重庆，解放碑、洪崖洞、千厮门大桥。10月3日李子坝、重庆动物园。10月4日返程。吃了火锅、兔头、烤苕皮、钵钵鸡、重庆小面。"
    },
    {
        id: 18,
        province: "江苏",
        city: "苏州&南京",
        country: "中国",
        date: "2021-09-30",
        endDate: "2021-10-04",
        title: "江南五日游",
        emoji: "🎋",
        description: "国庆苏州南京五日游，拙政园、平江路、秦淮河、夫子庙，体验江南水乡。",
        highlights: ["拙政园", "平江路", "山塘街", "秦淮河", "鸡鸣寺"],
        story: "9月30日北京到苏州，逛观前街。10月1日苏州博物馆、拙政园、平江路、山塘街。10月2日同里古镇。10月3日寒山寺、淮海街，下午高铁到南京，晚上秦淮河夫子庙。10月4日鸡鸣寺、玄武湖、明城墙、老门东，晚上返京。吃了苏州太太苏帮菜、桃花源记醉蟹、南京大牌档。"
    },
    {
        id: 19,
        province: "陕西",
        city: "西安",
        country: "中国",
        date: "2019-04-05",
        endDate: "2019-04-07",
        title: "古都西安文化之旅",
        emoji: "🏛️",
        description: "多次探访西安，大明宫、回民街、永兴坊、大唐不夜城、兵马俑。",
        highlights: ["大唐不夜城", "回民街", "永兴坊", "牛羊肉泡馍"],
        story: "从2016到2019多次前往西安。第一次是大明宫和牛羊肉泡馍。后来陆续去了西安博物馆、永兴坊、大唐不夜城。每次去回民街都会吃串、魏家凉皮，看完电影吃海底捞。西安是一座每次去都有新发现的城市。"
    },
    {
        id: 20,
        province: "北京",
        city: "北京",
        country: "中国",
        date: "2019-02-01",
        endDate: "2025-12-13",
        title: "北京游记（2019-2025）",
        emoji: "🦆",
        description: "常年居住北京，周末和假期探索首都的每一个角落，从故宫到奥森，从演唱会到公园。",
        highlights: ["故宫", "颐和园", "环球影城", "鸟巢演唱会", "奥森公园"],
        story: "在北京生活多年，利用周末和假期探索了几乎所有知名景点。2019年天安门、中山公园、动物园。2021年故宫、颐和园、玉渊潭。2022年圆明园、北海公园、香山、黄花城水长城。2023年环球影城、居庸关长城、野生动物园、鸟巢薛之谦演唱会。2024年全家游、邓紫棋/张杰/许嵩演唱会、八达岭长城。2025年地坛公园、雍和宫、朝阳公园、欢乐谷、密云水库、野鸭湖、景山公园。"
    },
    {
        id: 21,
        province: "河北",
        city: "秦皇岛",
        country: "中国",
        date: "2020-10-02",
        endDate: "2020-10-05",
        title: "国庆秦皇岛看海",
        emoji: "🦀",
        description: "四天三晚秦皇岛之旅，鸽子窝日出、野生动物园、碧螺岛、海鲜大餐。",
        highlights: ["鸽子窝公园", "秦皇岛野生动物园", "碧螺岛", "秦皇小巷", "蒸海鲜"],
        story: "2020年国庆去秦皇岛，住在庆山饭店。早起去鸽子窝公园看日出，白天逛野生动物园，晚上在碧螺岛海上酒吧。吃了秦皇小巷和燕大夜市，还有大锅蒸海鲜。"
    },
    {
        id: 22,
        province: "天津",
        city: "天津",
        country: "中国",
        date: "2019-02-01",
        endDate: "2025-06-22",
        title: "天津多次游览",
        emoji: "🎡",
        description: "多次前往天津，意大利风情区、天津之眼、海河游船、极地海洋公园、玛雅水上乐园。",
        highlights: ["天津之眼", "意大利风情区", "海河游船", "极地海洋公园", "玛雅海滩水公园"],
        story: "2019年2月第一次去天津，逛津门故里、意大利风情区、天津之眼、海河。2019年9月去天津海昌极地海洋公园。2021年6月意大利风情区、天津之眼、游船、玛雅海滩水公园。2025年6月再次去玛雅水上乐园。"
    },
    {
        id: 23,
        province: "辽宁&山东",
        city: "大连&威海",
        country: "中国",
        date: "2023-06-22",
        endDate: "2023-06-25",
        title: "大连威海四日游",
        emoji: "🚢",
        description: "大连威海四日游，菱角湾、棒棰岛、跨海轮渡海上日出、威海海岸线。",
        highlights: ["棒棰岛", "菱角湾", "海上轮渡日出", "火炬八街", "猫头山"],
        story: "第一天黑石礁、星海公园、星海广场、银沙滩。第二天菱角湾、虎滩公园、渔人码头、棒棰岛、威尼斯水城、东港喷泉，晚上大连港坐轮渡到威海（卧铺，海上日出）。第三天威海港、悦海公园灯塔、大相框、幸福门、半月湾、猫头山、火炬八街。"
    },
    {
        id: 24,
        province: "甘肃",
        city: "兰州",
        country: "中国",
        date: "2018-01-01",
        endDate: "2018-01-01",
        title: "兰州美食之旅",
        emoji: "🍜",
        description: "兰州多次游览，中山桥、白塔山、黄河、甘肃省博物馆、牛肉面。",
        highlights: ["中山桥", "白塔山", "甘肃省博物馆", "黄河", "兰州牛肉面"],
        story: "多次去兰州，逛中山桥、白塔山、五泉山，在黄河边喝茶。参观甘肃省博物馆看马踏飞燕。吃正宗兰州牛肉面、羊杂碎。还去了兰山公园看夜景。"
    },
    {
        id: 25,
        province: "河南",
        city: "南阳",
        country: "中国",
        date: "2018-10-01",
        endDate: "2018-10-03",
        title: "南阳理工学院",
        emoji: "🎓",
        description: "2018年国庆南阳之行，南阳理工学院、人民公园、白河、小吃街。",
        highlights: ["南阳理工学院", "白河", "人民公园", "烤鱼", "小吃街"],
        story: "2018年国庆去南阳，逛了南阳理工学院校园，去人民公园和白河划船，吃烤鱼和当地小吃。还在动物园看了动物，买了桂花和枇杷。"
    }
];

const wishlist = [
    {
        city: "内蒙古",
        title: "乌兰察布&包头火山草原3日游",
        emoji: "🌋",
        duration: "3天",
        season: "8月周末",
        description: "乌兰哈达火山公园露营、辉腾锡勒草原黄花沟、包头响沙湾沙漠",
        highlights: ["乌兰哈达火山", "黄花沟草原", "响沙湾沙漠", "联营烧麦"]
    },
    {
        city: "新加坡",
        title: "新加坡4日游",
        emoji: "🦁",
        duration: "4天",
        season: "10月",
        description: "鱼尾狮公园、滨海湾花园、圣淘沙环球影城、SEA海洋馆",
        highlights: ["鱼尾狮公园", "滨海湾花园", "圣淘沙", "乌节路"]
    },
    {
        city: "武汉",
        title: "武汉3日游",
        emoji: "🌸",
        duration: "3天",
        season: "端午",
        description: "黄鹤楼、长江大桥、东湖、武汉大学、湖北省博物馆、过早文化",
        highlights: ["黄鹤楼", "东湖", "武汉大学", "热干面"]
    },
    {
        city: "川藏线",
        title: "川藏线自驾",
        emoji: "🏔️",
        duration: "10-15天",
        season: "国庆",
        description: "成都出发经稻城亚丁到拉萨，布达拉宫、纳木错、珠峰大本营",
        highlights: ["稻城亚丁", "布达拉宫", "纳木错", "珠峰大本营"]
    },
    {
        city: "广西",
        title: "北海&桂林&柳州",
        emoji: "🛶",
        duration: "5-7天",
        season: "国庆",
        description: "涠洲岛、桂林山水、柳州螺蛳粉",
        highlights: ["涠洲岛", "漓江", "阳朔", "柳州螺蛳粉"]
    },
    {
        city: "杭州",
        title: "杭州2日游",
        emoji: "🌿",
        duration: "2天",
        season: "随时",
        description: "西湖、灵隐寺、法喜寺、河坊街",
        highlights: ["西湖", "灵隐寺", "法喜寺"]
    },
    {
        city: "深圳&顺德",
        title: "深圳顺德美食之旅",
        emoji: "🥟",
        duration: "3-4天",
        season: "清明/端午/中秋",
        description: "深圳城市风光、顺德寻味广东早茶和双皮奶",
        highlights: ["顺德美食", "广东早茶", "双皮奶"]
    },
    {
        city: "福建",
        title: "福州&泉州&平潭",
        emoji: "🏖️",
        duration: "5天",
        season: "国庆",
        description: "平潭岛蓝眼泪、泉州古城、福州三坊七巷",
        highlights: ["平潭蓝眼泪", "泉州古城", "三坊七巷"]
    },
    {
        city: "云南",
        title: "云南大环线",
        emoji: "☁️",
        duration: "10天",
        season: "任意",
        description: "丽江玉龙雪山、大理洱海、西双版纳、香格里拉梅里雪山",
        highlights: ["玉龙雪山", "洱海", "西双版纳", "梅里雪山"]
    },
    {
        city: "贵州",
        title: "贵州深度游",
        emoji: "🌉",
        duration: "5-7天",
        season: "任意",
        description: "黄果树瀑布、千户苗寨、梵净山、小七孔",
        highlights: ["黄果树瀑布", "千户苗寨", "梵净山"]
    },
    {
        city: "三亚",
        title: "海南三亚度假",
        emoji: "🏝️",
        duration: "5天",
        season: "冬季",
        description: "亚龙湾、蜈支洲岛、免税店、椰子鸡",
        highlights: ["亚龙湾", "蜈支洲岛", "免税店"]
    },
    {
        city: "台湾",
        title: "台湾环岛游",
        emoji: "🧋",
        duration: "7-10天",
        season: "任意",
        description: "台北101、九份、日月潭、垦丁、夜市美食",
        highlights: ["台北101", "九份", "日月潭", "垦丁"]
    },
    {
        city: "青海甘肃",
        title: "青甘大环线",
        emoji: "🏜️",
        duration: "5-7天",
        season: "夏季",
        description: "敦煌莫高窟、鸣沙山、张掖七彩丹霞、青海湖、茶卡盐湖",
        highlights: ["莫高窟", "鸣沙山", "七彩丹霞", "青海湖"]
    },
    {
        city: "张家口",
        title: "太舞滑雪小镇",
        emoji: "🎿",
        duration: "2-3天",
        season: "夏季/冬季",
        description: "缆车、山地速降、高尔夫、射箭、温泉",
        highlights: ["太舞小镇", "缆车观光", "温泉"]
    },
    {
        city: "山西",
        title: "太原&五台山",
        emoji: "⛩️",
        duration: "3-4天",
        season: "任意",
        description: "五台山朝圣、平遥古城、壶口瀑布、乔家大院",
        highlights: ["五台山", "平遥古城", "壶口瀑布"]
    },
    {
        city: "江西",
        title: "齐云山&武功山&景德镇",
        emoji: "🏺",
        duration: "4-5天",
        season: "任意",
        description: "武功山云海日出、景德镇陶瓷、齐云山道教名山",
        highlights: ["武功山", "景德镇", "齐云山"]
    },
    {
        city: "凤凰古城",
        title: "湖南凤凰古城",
        emoji: "🌉",
        duration: "3天",
        season: "任意",
        description: "凤凰古城、红石林、天门山、大峡谷玻璃桥",
        highlights: ["凤凰古城", "天门山", "玻璃桥"]
    },
    {
        city: "华山",
        title: "西安华山",
        emoji: "⛰️",
        duration: "2天",
        season: "任意",
        description: "五岳之华山，长空栈道、鹞子翻身、日出",
        highlights: ["长空栈道", "鹞子翻身", "华山日出"]
    }
];

function getCityList() {
    const cityMap = {};
    journeys.forEach(j => {
        if (!cityMap[j.city]) {
            cityMap[j.city] = {
                city: j.city,
                country: j.country,
                emoji: j.emoji,
                count: 0,
                journeys: []
            };
        }
        cityMap[j.city].count++;
        cityMap[j.city].journeys.push(j);
    });
    return Object.values(cityMap);
}

function getJourneyById(id) {
    return journeys.find(j => j.id === parseInt(id));
}

function loadJourneys() {
    try {
        const saved = localStorage.getItem('hsn-journeys');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load journeys from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(defaultJourneys));
}

function saveJourneys(data) {
    try {
        localStorage.setItem('hsn-journeys', JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Failed to save journeys to localStorage:', e);
        return false;
    }
}

function addJourney(journey) {
    const newId = Math.max(...journeys.map(j => j.id), 0) + 1;
    journey.id = newId;
    journeys.push(journey);
    saveJourneys(journeys);
    return newId;
}

function updateJourney(id, updates) {
    const idx = journeys.findIndex(j => j.id === parseInt(id));
    if (idx === -1) return false;
    journeys[idx] = { ...journeys[idx], ...updates };
    saveJourneys(journeys);
    return true;
}

function deleteJourney(id) {
    const idx = journeys.findIndex(j => j.id === parseInt(id));
    if (idx === -1) return false;
    journeys.splice(idx, 1);
    saveJourneys(journeys);
    return true;
}

function resetJourneys() {
    journeys.length = 0;
    defaultJourneys.forEach(j => journeys.push(JSON.parse(JSON.stringify(j))));
    saveJourneys(journeys);
}

function generateLocations(journey) {
    if (journey.locations && journey.locations.length > 0) {
        return journey.locations;
    }

    // 国际旅程：按 country 拆分
    if (journey.country && journey.country.includes('·')) {
        return journey.country.split('·').map(c => ({
            name: c.trim(),
            type: 'country'
        }));
    }

    // 国内跨省：按 province 拆分
    if (journey.province && journey.province.includes('&')) {
        return journey.province.split('&').map(p => ({
            name: p.trim(),
            type: 'province',
            country: journey.country
        }));
    }

    // 国内跨市：按 city 拆分
    if (journey.city && journey.city.includes('&')) {
        return journey.city.split('&').map(c => ({
            name: c.trim(),
            type: 'city',
            country: journey.country,
            province: journey.province
        }));
    }

    // 单地点
    return [{
        name: journey.city,
        type: 'city',
        country: journey.country,
        province: journey.province
    }];
}

function getLocationList() {
    const locationMap = {};

    journeys.forEach(j => {
        const locations = generateLocations(j);
        locations.forEach(loc => {
            const key = loc.name;
            if (!locationMap[key]) {
                locationMap[key] = {
                    name: loc.name,
                    type: loc.type,
                    country: loc.country || j.country,
                    province: loc.province || j.province,
                    emoji: j.emoji,
                    count: 0,
                    journeys: []
                };
            }
            locationMap[key].count++;
            locationMap[key].journeys.push(j);
        });
    });

    return Object.values(locationMap).sort((a, b) => b.count - a.count);
}

let journeys = loadJourneys();

// 强制重置为原始数据（仅执行一次）
if (!localStorage.getItem('hsn-journeys-reset-v20260504')) {
    resetJourneys();
    localStorage.setItem('hsn-journeys-reset-v20260504', '1');
}
