(function (global) {
  "use strict";

  const CITY_SEED = [
    {
      id: "nanjing",
      name: "南京",
      latin: "NANJING",
      tagline: "梧桐树下，半部民国史",
      intro: "六朝烟水与民国梧桐叠在一起，南京适合用一条条街巷慢慢读。",
      heroImage: "assets/images/cities/nanjing.svg",
      center: [118.79, 32.06],
      bestSeason: "3–5月 / 9–11月"
    },
    {
      id: "beijing",
      name: "北京",
      latin: "BEIJING",
      tagline: "沿中轴线，走进古都",
      intro: "中轴线、胡同与城楼构成巨大的历史坐标系，也藏着最日常的烟火。",
      heroImage: "assets/images/cities/beijing.svg",
      center: [116.40, 39.91],
      bestSeason: "4–5月 / 9–10月"
    },
    {
      id: "chengdu",
      name: "成都",
      latin: "CHENGDU",
      tagline: "把脚步放慢，把日子过香",
      intro: "茶馆、老街、河边与夜宵，成都的节奏适合把行程排得松一点。",
      heroImage: "assets/images/cities/chengdu.svg",
      center: [104.07, 30.66],
      bestSeason: "3–5月 / 9–11月"
    },
    {
      id: "dali",
      name: "大理",
      latin: "DALI",
      tagline: "苍山洱海之间，风会带路",
      intro: "苍山与洱海之间，古城、村落和田野构成一条可以慢下来的路线。",
      heroImage: "assets/images/cities/dali.svg",
      center: [100.16, 25.70],
      bestSeason: "3–5月 / 9–11月"
    }
  ];

  const ROUTE_SEED = [
    {
      id: "nj-wutong",
      cityId: "nanjing",
      title: "梧桐民国线",
      theme: "历史",
      summary: "从颐和路出发，穿过书店、校园、古寺与玄武湖，读一遍南京的民国与梧桐。",
      coverImage: "assets/images/routes/nj-wutong.svg",
      durationMinutes: 240,
      distanceKm: 5.2,
      budget: 10,
      bestTime: "上午至午后",
      stops: [
        ["nj-wutong-01", "颐和路公馆区", "sight", 118.7690, 32.0660, 45, 0, "梧桐掩映的民国公馆群，适合慢慢步行看建筑立面与街巷尺度。"],
        ["nj-wutong-02", "先锋书店五台山店", "sight", 118.7690, 32.0520, 35, 0, "由地下车库改造的书店，斜坡、十字架与书墙是南京文艺地标。"],
        ["nj-wutong-03", "南京大学鼓楼校区", "sight", 118.7750, 32.0560, 40, 0, "老校区梧桐与民国建筑交织，北大楼草坪是最具代表性的画面。"],
        ["nj-wutong-04", "鸡鸣寺", "sight", 118.7970, 32.0600, 45, 10, "城墙脚下的古寺，春天樱花大道尤其出名，可俯瞰玄武湖。"],
        ["nj-wutong-05", "玄武湖", "sight", 118.8000, 32.0750, 50, 0, "南京城中的大湖，环湖步道适合作为路线收尾。"]
      ]
    },
    {
      id: "nj-qinhuai",
      cityId: "nanjing",
      title: "秦淮夜色线",
      theme: "夜景",
      summary: "把老门东、夫子庙和秦淮河串成一条夜色路线，适合傍晚开始。",
      coverImage: "assets/images/routes/nj-qinhuai.svg",
      durationMinutes: 180,
      distanceKm: 3.8,
      budget: 130,
      bestTime: "傍晚至夜间",
      stops: [
        ["nj-qinhuai-01", "老门东", "sight", 118.7900, 32.0120, 50, 0, "修复后的老城南街区，砖墙、巷弄和小店适合傍晚闲逛。"],
        ["nj-qinhuai-02", "夫子庙", "sight", 118.7880, 32.0230, 40, 0, "秦淮河畔的核心景区，夜景与灯会最具辨识度。"],
        ["nj-qinhuai-03", "乌衣巷", "sight", 118.7900, 32.0200, 20, 0, "短而安静的巷子，因刘禹锡诗句闻名。"],
        ["nj-qinhuai-04", "科举博物馆", "sight", 118.7890, 32.0230, 60, 50, "地下式博物馆，展示中国古代科举制度。"],
        ["nj-qinhuai-05", "秦淮河画舫", "other", 118.7880, 32.0220, 50, 80, "夜游秦淮河的经典方式，灯影与水岸构成南京夜色。"]
      ]
    },
    {
      id: "nj-zhongshan",
      cityId: "nanjing",
      title: "钟山风景线",
      theme: "自然",
      summary: "钟山南麓的经典半日线，建筑、森林与梧桐大道依次展开。",
      coverImage: "assets/images/routes/nj-zhongshan.svg",
      durationMinutes: 300,
      distanceKm: 7.5,
      budget: 110,
      bestTime: "上午",
      stops: [
        ["nj-zhongshan-01", "中山陵", "sight", 118.8500, 32.0600, 70, 0, "钟山南麓的近代建筑群，392级台阶通向祭堂。"],
        ["nj-zhongshan-02", "音乐台", "sight", 118.8480, 32.0570, 30, 10, "中山陵旁的露天舞台，白鸽与弧形柱廊很出片。"],
        ["nj-zhongshan-03", "美龄宫", "sight", 118.8420, 32.0500, 40, 30, "梧桐山路上的民国别墅，航拍视角像一条项链。"],
        ["nj-zhongshan-04", "明孝陵", "sight", 118.8330, 32.0580, 80, 70, "世界文化遗产，神道石象路在秋天尤其壮观。"],
        ["nj-zhongshan-05", "梧桐大道", "sight", 118.8400, 32.0500, 30, 0, "钟山风景区里的梧桐隧道，适合作为路线收尾。"]
      ]
    },
    {
      id: "bj-axis",
      cityId: "beijing",
      title: "中轴线古都线",
      theme: "历史",
      summary: "沿北京中轴线从永定门走到景山，一条线读懂古都空间秩序。",
      coverImage: "assets/images/routes/bj-axis.svg",
      durationMinutes: 360,
      distanceKm: 9.0,
      budget: 36,
      bestTime: "全天",
      stops: [
        ["bj-axis-01", "永定门", "sight", 116.3990, 39.8720, 30, 0, "北京中轴线南起点，城楼与广场拉开古都序列。"],
        ["bj-axis-02", "天坛", "sight", 116.4100, 39.8820, 80, 34, "明清皇帝祭天场所，祈年殿是最具代表性的建筑。"],
        ["bj-axis-03", "前门大街", "food", 116.3980, 39.8990, 50, 0, "老字号与铛铛车并存，连接天坛与天安门。"],
        ["bj-axis-04", "天安门广场", "sight", 116.3970, 39.9050, 40, 0, "城市中轴的核心空间，适合观察北京的空间秩序。"],
        ["bj-axis-05", "景山公园", "sight", 116.3960, 39.9250, 50, 2, "登万春亭俯瞰故宫屋顶，是中轴线的最佳收尾。"]
      ]
    },
    {
      id: "bj-hutong",
      cityId: "beijing",
      title: "胡同烟火线",
      theme: "街区",
      summary: "从南锣鼓巷钻进什刹海，在胡同、湖面和鼓楼之间感受老北京。",
      coverImage: "assets/images/routes/bj-hutong.svg",
      durationMinutes: 210,
      distanceKm: 4.5,
      budget: 20,
      bestTime: "午后至傍晚",
      stops: [
        ["bj-hutong-01", "南锣鼓巷", "food", 116.4030, 39.9370, 40, 0, "元代胡同格局保留较完整，主街热闹、支巷更安静。"],
        ["bj-hutong-02", "雨儿胡同", "sight", 116.4020, 39.9360, 25, 0, "南锣鼓巷旁的安静支巷，能看到日常胡同生活。"],
        ["bj-hutong-03", "什刹海", "sight", 116.3860, 39.9400, 45, 0, "前海、后海与西海组成的水系，傍晚适合沿湖散步。"],
        ["bj-hutong-04", "烟袋斜街", "food", 116.3900, 39.9400, 30, 0, "连接什刹海与鼓楼的小街，店铺密集、烟火气足。"],
        ["bj-hutong-05", "鼓楼", "sight", 116.3940, 39.9410, 40, 20, "北京老城的时间坐标，周边胡同与钟楼可一并浏览。"]
      ]
    },
    {
      id: "bj-yonghe",
      cityId: "beijing",
      title: "雍和宫文艺线",
      theme: "历史",
      summary: "雍和宫、国子监与五道营胡同，宗教、学府和文艺街区相邻。",
      coverImage: "assets/images/routes/bj-yonghe.svg",
      durationMinutes: 180,
      distanceKm: 3.2,
      budget: 57,
      bestTime: "上午至午后",
      stops: [
        ["bj-yonghe-01", "雍和宫", "sight", 116.4110, 39.9470, 50, 25, "北京规模最大的藏传佛教寺院，香火与建筑细节都值得看。"],
        ["bj-yonghe-02", "国子监", "sight", 116.4090, 39.9460, 45, 30, "元明清三代最高学府，与孔庙相邻，庭院古树成荫。"],
        ["bj-yonghe-03", "五道营胡同", "food", 116.4120, 39.9470, 35, 0, "文艺小店与咖啡馆集中的胡同，适合慢走。"],
        ["bj-yonghe-04", "箭厂胡同", "sight", 116.4150, 39.9460, 20, 0, "五道营旁的安静支巷，保留老北京院落尺度。"],
        ["bj-yonghe-05", "地坛公园", "sight", 116.4140, 39.9520, 40, 2, "史铁生笔下的地坛，古柏与方泽坛让节奏慢下来。"]
      ]
    },
    {
      id: "cd-yulin",
      cityId: "chengdu",
      title: "玉林烟火线",
      theme: "街区",
      summary: "玉林西路到倪家桥，走进成都最日常的街区与音乐记忆。",
      coverImage: "assets/images/routes/cd-yulin.svg",
      durationMinutes: 180,
      distanceKm: 3.6,
      budget: 50,
      bestTime: "傍晚",
      stops: [
        ["cd-yulin-01", "玉林西路", "food", 104.0610, 30.6300, 30, 0, "成都生活感最强的街区之一，小店、酒吧与梧桐交织。"],
        ["cd-yulin-02", "小酒馆", "food", 104.0610, 30.6290, 40, 50, "玉林西路上的独立音乐地标，赵雷歌词让这里广为人知。"],
        ["cd-yulin-03", "玉林四巷", "sight", 104.0640, 30.6260, 30, 0, "涂鸦、社区小店和院坝生活混合的窄巷。"],
        ["cd-yulin-04", "芳草街", "food", 104.0580, 30.6280, 30, 0, "玉林片区的日常街道，适合观察成都的社区节奏。"],
        ["cd-yulin-05", "倪家桥", "transport", 104.0670, 30.6250, 20, 0, "地铁与老社区交汇，适合作为玉林路线的终点。"]
      ]
    },
    {
      id: "cd-park",
      cityId: "chengdu",
      title: "公园慢生活线",
      theme: "美食",
      summary: "人民公园喝茶，穿宽窄巷子，再拐进奎星楼街吃一顿。",
      coverImage: "assets/images/routes/cd-park.svg",
      durationMinutes: 240,
      distanceKm: 4.8,
      budget: 100,
      bestTime: "上午至午后",
      stops: [
        ["cd-park-01", "人民公园", "food", 104.0550, 30.6570, 60, 20, "鹤鸣茶社、盖碗茶和相亲角，是成都慢生活的缩影。"],
        ["cd-park-02", "宽窄巷子", "sight", 104.0550, 30.6630, 50, 0, "由宽巷子、窄巷子和井巷子组成的历史街区。"],
        ["cd-park-03", "奎星楼街", "food", 104.0520, 30.6670, 60, 80, "成都美食密度极高的街道，适合安排一顿正餐。"],
        ["cd-park-04", "文殊院", "sight", 104.0730, 30.6740, 50, 0, "闹市中的古寺，红墙、香火与素斋都很出名。"]
      ]
    },
    {
      id: "cd-dongjiao",
      cityId: "chengdu",
      title: "东郊记忆线",
      theme: "夜景",
      summary: "从工业遗存到锦江夜色，适合下午出发的成都东门路线。",
      coverImage: "assets/images/routes/cd-dongjiao.svg",
      durationMinutes: 240,
      distanceKm: 5.5,
      budget: 150,
      bestTime: "下午至夜间",
      stops: [
        ["cd-dongjiao-01", "东郊记忆", "sight", 104.1260, 30.6710, 60, 0, "由老工业厂房改造的文创园区，工业遗存与展览并存。"],
        ["cd-dongjiao-02", "建设路小吃街", "food", 104.1150, 30.6730, 50, 60, "成都夜宵代表街区，适合边逛边吃。"],
        ["cd-dongjiao-03", "猛追湾", "sight", 104.0990, 30.6690, 30, 0, "锦江边的城市更新片区，新旧成都在这里交叠。"],
        ["cd-dongjiao-04", "望平街", "food", 104.0930, 30.6570, 40, 40, "沿河咖啡馆与小店密集，适合傍晚散步。"],
        ["cd-dongjiao-05", "九眼桥", "food", 104.0900, 30.6450, 60, 50, "成都夜生活地标，锦江夜景与酒吧街相邻。"]
      ]
    },
    {
      id: "dl-oldtown",
      cityId: "dali",
      title: "古城慢游线",
      theme: "街区",
      summary: "从南门走到洱海门，在古城街巷里把脚步放慢。",
      coverImage: "assets/images/routes/dl-oldtown.svg",
      durationMinutes: 180,
      distanceKm: 3.0,
      budget: 0,
      bestTime: "上午至傍晚",
      stops: [
        ["dl-oldtown-01", "大理古城南门", "sight", 100.1630, 25.6900, 30, 0, "古城的经典入口，城楼与苍山构成第一眼大理。"],
        ["dl-oldtown-02", "人民路", "food", 100.1610, 25.6950, 40, 0, "古城最有生活气的主街，手作店、咖啡馆与旅人汇聚。"],
        ["dl-oldtown-03", "五华楼", "sight", 100.1610, 25.6970, 25, 0, "古城中心的标志性城楼，可俯瞰人民路与屋顶。"],
        ["dl-oldtown-04", "洋人街", "food", 100.1600, 25.6960, 35, 0, "古城早期的旅行者街区，适合傍晚闲逛。"],
        ["dl-oldtown-05", "洱海门", "sight", 100.1660, 25.7010, 20, 0, "古城东侧通往洱海方向的城门，适合作为慢游终点。"]
      ]
    },
    {
      id: "dl-erhai",
      cityId: "dali",
      title: "洱海西岸线",
      theme: "自然",
      summary: "沿洱海西岸从码头骑到喜洲，湖光、稻田和白族村落连成一线。",
      coverImage: "assets/images/routes/dl-erhai.svg",
      durationMinutes: 300,
      distanceKm: 12.0,
      budget: 30,
      bestTime: "全天",
      stops: [
        ["dl-erhai-01", "龙龛码头", "sight", 100.1940, 25.6740, 35, 0, "洱海西岸的安静码头，清晨光线柔和。"],
        ["dl-erhai-02", "才村码头", "sight", 100.1890, 25.6880, 35, 0, "靠近古城的洱海码头，适合看湖面与苍山倒影。"],
        ["dl-erhai-03", "磻溪村S弯", "sight", 100.1560, 25.7530, 40, 0, "洱海生态廊道上的著名弯道，骑行与拍照都很出片。"],
        ["dl-erhai-04", "喜洲古镇", "sight", 100.1320, 25.8500, 70, 30, "白族民居与稻田环绕的古镇，严家大院值得一看。"],
        ["dl-erhai-05", "海舌公园", "sight", 100.1410, 25.8670, 50, 0, "伸入洱海的狭长半岛，湿地与湖景层次丰富。"]
      ]
    },
    {
      id: "dl-cangshan",
      cityId: "dali",
      title: "苍山人文线",
      theme: "自然",
      summary: "索道上苍山，经清碧溪与寂照庵，再回到大理古城。",
      coverImage: "assets/images/routes/dl-cangshan.svg",
      durationMinutes: 300,
      distanceKm: 6.5,
      budget: 70,
      bestTime: "上午",
      stops: [
        ["dl-cangshan-01", "感通索道", "transport", 100.1940, 25.6420, 60, 50, "上苍山的主要索道之一，可进入清碧溪峡谷。"],
        ["dl-cangshan-02", "清碧溪", "sight", 100.1880, 25.6510, 70, 0, "苍山十八溪之一，溪谷清凉，适合短途徒步。"],
        ["dl-cangshan-03", "寂照庵", "food", 100.1800, 25.6610, 50, 20, "苍山脚下的尼姑庵，以多肉花园和素斋闻名。"],
        ["dl-cangshan-04", "大理古城", "sight", 100.1630, 25.6930, 60, 0, "从苍山回到古城，结束一段山野与人间相接的路线。"]
      ]
    }
  ];

  const cities = CITY_SEED.map(function (city) {
    return Object.assign({}, city, { routeIds: [] });
  });
  const routes = [];
  const stops = {};

  ROUTE_SEED.forEach(function (seed) {
    const stopIds = seed.stops.map(function (row) {
      const id = row[0];
      stops[id] = {
        id: id,
        name: row[1],
        category: row[2],
        lng: row[3],
        lat: row[4],
        stayMinutes: row[5],
        cost: row[6],
        description: row[7]
      };
      return id;
    });

    const route = Object.assign({}, seed, { stopIds: stopIds });
    delete route.stops;
    routes.push(route);

    const city = cities.find(function (item) { return item.id === seed.cityId; });
    if (city) city.routeIds.push(route.id);
  });

  global.CITYWALK_DATA = {
    cities: cities,
    routes: routes,
    stops: stops
  };
})(window);
