from pathlib import Path
import math

ROOT = Path(__file__).resolve().parents[1]
CITY_DIR = ROOT / "assets" / "images" / "cities"
ROUTE_DIR = ROOT / "assets" / "images" / "routes"
CITY_DIR.mkdir(parents=True, exist_ok=True)
ROUTE_DIR.mkdir(parents=True, exist_ok=True)


def svg_doc(bg1, bg2, content, accent="#1F6F5C", warm="#E56B3F"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" role="img">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/>
  </linearGradient>
  <radialGradient id="sunGlow"><stop offset="0" stop-color="{warm}" stop-opacity=".42"/><stop offset="1" stop-color="{warm}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0V72" fill="none" stroke="#ffffff" stroke-opacity=".18"/></pattern>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#1F6F5C" opacity=".16"/></pattern>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer></filter>
</defs>
<rect width="1600" height="1000" fill="url(#sky)"/>
<rect width="1600" height="1000" fill="url(#grid)" opacity=".72"/>
{content}
<rect width="1600" height="1000" filter="url(#grain)" opacity=".55"/>
<g fill="none" stroke="#ffffff" stroke-opacity=".46">
  <path d="M0 56H1600M0 944H1600M48 0V1000M1552 0V1000"/>
  <path d="M40 48h16M40 48v16M1544 944h16M1560 944v-16"/>
</g>
<g fill="{accent}" font-family="Arial, sans-serif" font-size="14" letter-spacing="4" opacity=".62">
  <text x="62" y="45">CITYWALK / FIELD STUDY</text>
  <text x="62" y="980">31°14′N  121°28′E</text>
</g>
</svg>'''


def mountains(points, color, opacity=1):
    pts = " ".join(f"{x},{y}" for x, y in points)
    return f'<polygon points="{pts}" fill="{color}" opacity="{opacity}"/>'


def tree(x, y, scale=1, color="#4f6e58", trunk="#6a5947", opacity=1):
    s = scale
    return f'''<g opacity="{opacity}">
<rect x="{x-4*s}" y="{y-95*s}" width="{8*s}" height="{100*s}" rx="{3*s}" fill="{trunk}" opacity=".8"/>
<circle cx="{x}" cy="{y-135*s}" r="{50*s}" fill="{color}" opacity=".82"/>
<circle cx="{x-34*s}" cy="{y-112*s}" r="{38*s}" fill="{color}" opacity=".62"/>
<circle cx="{x+35*s}" cy="{y-112*s}" r="{40*s}" fill="{color}" opacity=".7"/>
<circle cx="{x+10*s}" cy="{y-165*s}" r="{31*s}" fill="{color}" opacity=".48"/>
</g>'''


def roof(cx, y, width, color="#3f4d47", accent="#1f6f5c", upturn=34):
    left = cx - width / 2
    right = cx + width / 2
    return f'''<path d="M{left-upturn} {y} Q{left+width*.12} {y-14} {cx-width*.23} {y-76} Q{cx} {y-112} {cx+width*.23} {y-76} Q{right-width*.12} {y-14} {right+upturn} {y}Z" fill="{color}"/>
<path d="M{left-upturn*.7} {y+3} Q{cx} {y-28} {right+upturn*.7} {y+3}" fill="none" stroke="{accent}" stroke-width="5" opacity=".55"/>
<rect x="{cx-width*.42}" y="{y}" width="{width*.84}" height="22" rx="3" fill="{color}" opacity=".9"/>'''


def building(x, y, w, h, color, roof_color):
    return f'<rect x="{x}" y="{y-h}" width="{w}" height="{h}" fill="{color}"/><rect x="{x-18}" y="{y-h}" width="{w+36}" height="18" rx="5" fill="{roof_color}"/>'


def path_line(points, color="#1F6F5C", width=5, dash="13 18", opacity=.9):
    pts = " ".join(f"{x},{y}" for x, y in points)
    markers = "".join(f'<circle cx="{x}" cy="{y}" r="9" fill="{color}" stroke="#fff" stroke-width="4"/>' for x, y in points[::max(1, len(points)//5)])
    return f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="{width}" stroke-dasharray="{dash}" stroke-linecap="round" stroke-linejoin="round" opacity="{opacity}"/>{markers}'


def water(y, color="#9ebcb6", opacity=.75):
    return f'''<path d="M0 {y} C220 {y-32} 380 {y+38} 590 {y+4} S980 {y-25} 1200 {y+12} S1430 {y-28} 1600 {y+4}V1000H0Z" fill="{color}" opacity="{opacity}"/>
<g fill="none" stroke="#ffffff" stroke-width="3" opacity=".38"><path d="M80 {y+65}c90-18 170 16 260-2s170-16 260 2"/><path d="M940 {y+110}c100-20 190 14 290-4s150-10 260 8"/></g>'''


def birds(x, y, color="#3f4d47"):
    return f'<g fill="none" stroke="{color}" stroke-width="4" stroke-linecap="round" opacity=".55"><path d="M{x} {y}q12-10 24 0q12-10 24 0"/><path d="M{x+88} {y-38}q9-8 18 0q9-8 18 0"/><path d="M{x-76} {y-72}q7-6 14 0q7-6 14 0"/></g>'


def lantern(x, y, scale=1, color="#e56b3f"):
    return f'<g><path d="M{x} {y-78*scale}v18" stroke="#564838" stroke-width="3"/><ellipse cx="{x}" cy="{y}" rx="{18*scale}" ry="{25*scale}" fill="{color}"/><path d="M{x-18*scale} {y}h{36*scale}" stroke="#f5d7b8" stroke-width="3"/></g>'


def bike(x, y, scale=1, color="#344a44"):
    return f'''<g transform="translate({x} {y}) scale({scale})" fill="none" stroke="{color}" stroke-width="5" stroke-linecap="round"><circle cx="-45" cy="20" r="28"/><circle cx="50" cy="20" r="28"/><path d="M-45 20L-6-20l28 40H-45l25-55h30l17 55M-20-35h35M25-20l12-22h20"/></g>'''


def icon_composition(kind):
    if kind == "nanjing_city":
        content = f'''<circle cx="1240" cy="240" r="220" fill="url(#sunGlow)"/><circle cx="1240" cy="240" r="76" fill="#e7b17d" opacity=".55"/>
{mountains([(0,560),(240,430),(430,500),(650,390),(860,510),(1100,420),(1320,520),(1600,410),(1600,720),(0,720)],"#92a894",.62)}
<path d="M0 1000L610 410H990L1600 1000Z" fill="#c6cdbd"/>
<path d="M610 410H990L1600 1000H0Z" fill="#d8ddd0" opacity=".65"/>
<path d="M770 1000L795 440H840L860 1000Z" fill="#f0eee4" opacity=".8"/>
{''.join(tree(x, 760, s, '#58745e', '#5d4b3c', .9) for x,s in [(150,1.1),(330,.9),(1230,.9),(1430,1.1)])}
{building(1060,565,240,150,'#eee9de','#8d7b6b')}
<rect x="1090" y="470" width="48" height="56" fill="#d8cbb8"/><rect x="1220" y="470" width="48" height="56" fill="#d8cbb8"/>
{roof(1180,445,280,'#786b5e','#506f60',18)}
{birds(350,230,'#667467')}
{path_line([(720,920),(770,790),(835,670),(880,555),(905,462)],'#1f6f5c',5,'14 18',.7)}'''
    elif kind == "beijing_city":
        content = f'''<circle cx="800" cy="270" r="260" fill="url(#sunGlow)"/><circle cx="800" cy="260" r="80" fill="#cf785d" opacity=".45"/>
{mountains([(0,650),(240,570),(420,610),(680,520),(880,600),(1130,530),(1370,610),(1600,540),(1600,790),(0,790)],"#b6aa96",.5)}
<rect x="0" y="700" width="1600" height="300" fill="#b7aa91" opacity=".6"/>
<path d="M0 720H1600M210 720V1000M1390 720V1000M470 720V1000M1130 720V1000" stroke="#756a5a" stroke-width="2" opacity=".3"/>
{building(210,720,120,210,'#c5b59c','#9b7f66')}
{building(1270,720,120,210,'#c5b59c','#9b7f66')}
<rect x="540" y="510" width="520" height="290" fill="#9b5b4b" opacity=".88"/>
{roof(800,470,640,'#59463e','#b66b50',56)}
<rect x="720" y="585" width="160" height="215" fill="#3e3631"/>
<rect x="600" y="570" width="70" height="90" fill="#d8b68d" opacity=".7"/><rect x="930" y="570" width="70" height="90" fill="#d8b68d" opacity=".7"/>
{birds(330,280,'#6d5a4b')}
{path_line([(800,960),(800,860),(800,750),(800,640),(800,520)],'#e56b3f',4,'15 18',.75)}'''
    elif kind == "chengdu_city":
        content = f'''<circle cx="1280" cy="230" r="240" fill="url(#sunGlow)"/><circle cx="1280" cy="230" r="86" fill="#d99c58" opacity=".42"/>
{mountains([(0,640),(210,520),(390,580),(580,490),(810,570),(1010,510),(1230,580),(1450,500),(1600,550),(1600,790),(0,790)],"#8fa283",.5)}
<path d="M0 710C270 680 420 740 680 705S1130 680 1600 715V1000H0Z" fill="#b0c0a7" opacity=".75"/>
{water(790,'#95b1a8',.7)}
<rect x="230" y="540" width="430" height="230" fill="#e0d5bf" opacity=".9"/>
{roof(445,535,520,'#4f5d50','#b7714e',42)}
<rect x="285" y="615" width="80" height="120" fill="#665d4c"/><rect x="430" y="610" width="100" height="130" fill="#efe5cf"/><rect x="570" y="610" width="70" height="130" fill="#665d4c"/>
<rect x="760" y="735" width="210" height="18" rx="4" fill="#78654e"/><rect x="790" y="753" width="12" height="65" fill="#78654e"/><rect x="925" y="753" width="12" height="65" fill="#78654e"/>
{''.join(tree(1120+i*100,700,.9,'#55755a','#6a5840',.9) for i in range(4))}
{''.join(tree(100+i*22,770,.35,'#4b7459','#5e573e',.8) for i in range(9))}
{birds(330,300,'#69725d')}
{path_line([(760,960),(760,860),(750,760),(700,670),(620,600)],'#1f6f5c',5,'12 16',.7)}'''
    else:  # dali city
        content = f'''<circle cx="1120" cy="250" r="250" fill="url(#sunGlow)"/><circle cx="1120" cy="250" r="74" fill="#f3d39a" opacity=".58"/>
{mountains([(0,630),(200,470),(400,570),(620,350),(790,510),(920,300),(1130,530),(1370,390),(1600,590),(1600,810),(0,810)],"#718e8c",.72)}
{mountains([(0,690),(250,590),(470,650),(690,510),(850,630),(1050,500),(1260,650),(1450,570),(1600,660),(1600,830),(0,830)],"#4f7776",.7)}
<path d="M690 520L760 355L830 520Z" fill="#f3f1e8" opacity=".9"/><path d="M735 410L760 355L786 410Z" fill="#ffffff" opacity=".8"/>
{water(745,'#a7c7c4',.8)}
<g fill="#f3eee2"><rect x="210" y="665" width="180" height="120"/><rect x="460" y="700" width="150" height="92"/><rect x="1210" y="685" width="190" height="105"/></g>
<g fill="#64776c"><path d="M190 665L300 605L410 665Z"/><path d="M445 700L535 654L625 700Z"/><path d="M1190 685L1305 628L1420 685Z"/></g>
{''.join(tree(950+i*80,730,.55,'#55776c','#665742',.8) for i in range(6))}
{birds(450,240,'#536966')}
{path_line([(300,950),(430,875),(590,835),(760,810),(950,840),(1170,805),(1370,845)],'#1f6f5c',5,'12 18',.7)}'''
    return content


def city_asset(filename, kind):
    palettes = {
        "nanjing_city": ("#eef0e7", "#b8c7b6", "#1f6f5c", "#d69567"),
        "beijing_city": ("#f1e9dd", "#c7b9a3", "#8d5548", "#bd6e50"),
        "chengdu_city": ("#ece9dd", "#b8b99e", "#4d7460", "#d99155"),
        "dali_city": ("#e6efed", "#a8c3c0", "#2d6c69", "#e2b56e"),
    }
    bg1, bg2, accent, warm = palettes[kind]
    path = CITY_DIR / filename
    path.write_text(svg_doc(bg1, bg2, icon_composition(kind), accent, warm), encoding="utf-8")


def route_asset(filename, kind):
    palettes = {
        "nj-wutong": ("#eef0e7", "#b7c7b4", "#1f6f5c", "#d19c69"),
        "nj-qinhuai": ("#3a5150", "#162826", "#f0b26f", "#e56b3f"),
        "nj-zhongshan": ("#e6ece4", "#aabeb0", "#1f6f5c", "#d3a36d"),
        "bj-axis": ("#f2e9dc", "#c8b6a2", "#945d4d", "#c66b50"),
        "bj-hutong": ("#e9e5dc", "#b9b4a7", "#617369", "#b3654f"),
        "bj-yonghe": ("#ede4d7", "#b9a793", "#98614e", "#d17854"),
        "cd-yulin": ("#e7e1d2", "#a8a28c", "#526c57", "#dd874d"),
        "cd-park": ("#e7ebdf", "#a8b99b", "#406b58", "#c98955"),
        "cd-dongjiao": ("#d9dad0", "#8f9489", "#435f57", "#d66d4c"),
        "dl-oldtown": ("#e7eeea", "#a6bdb8", "#2f6e68", "#d8a66c"),
        "dl-erhai": ("#e3efed", "#9ebfbd", "#286c68", "#dfad69"),
        "dl-cangshan": ("#e7eee9", "#a4b9b1", "#2d655b", "#c58b5e"),
    }
    bg1, bg2, accent, warm = palettes[kind]
    path = ROUTE_DIR / filename
    path.write_text(svg_doc(bg1, bg2, route_composition(kind), accent, warm), encoding="utf-8")


def route_composition(kind):
    if kind == "nj-wutong":
        return f'''<circle cx="1290" cy="220" r="220" fill="url(#sunGlow)"/><circle cx="1290" cy="220" r="60" fill="#e7b77f" opacity=".65"/>
{mountains([(0,590),(250,480),(470,550),(740,430),(980,540),(1240,470),(1600,530),(1600,760),(0,760)],"#8ca18c",.55)}
<path d="M0 1000L600 430H1000L1600 1000Z" fill="#c6cec0"/><path d="M600 430H1000L1600 1000H0Z" fill="#d9ded2" opacity=".52"/>
<path d="M760 1000L790 470H830L850 1000Z" fill="#eeeade" opacity=".8"/>
{''.join(tree(x,780,s,'#58745e','#655340',.95) for x,s in [(120,1.2),(310,1),(1230,1),(1420,1.2)])}
{building(1060,575,250,150,'#eee8da','#847566')}
{roof(1185,450,290,'#71665a','#527363',20)}
<rect x="1090" y="510" width="44" height="65" fill="#d8cebc"/><rect x="1235" y="510" width="44" height="65" fill="#d8cebc"/>
{birds(355,215,'#697467')}{path_line([(720,930),(770,810),(825,690),(870,580),(900,470)],'#1f6f5c',5,'14 18',.72)}'''
    if kind == "nj-qinhuai":
        return f'''<circle cx="1210" cy="210" r="260" fill="url(#sunGlow)"/><circle cx="1210" cy="210" r="72" fill="#f0d6a0" opacity=".9"/>
{mountains([(0,610),(260,500),(460,570),(720,480),(980,560),(1230,510),(1450,580),(1600,530),(1600,760),(0,760)],"#304844",.9)}
{water(690,'#1d4545',.96)}
<g opacity=".96"><rect x="100" y="540" width="270" height="170" fill="#4a4c42"/><rect x="1230" y="510" width="270" height="195" fill="#4a4c42"/></g>
{roof(235,535,310,'#262f2c','#b56a48',26)}{roof(1365,505,310,'#262f2c','#b56a48',26)}
<path d="M520 710Q800 560 1080 710" fill="none" stroke="#c1a177" stroke-width="34"/><path d="M520 710Q800 560 1080 710" fill="none" stroke="#e3c795" stroke-width="4" opacity=".7"/>
<path d="M560 710v105M1040 710v105M800 620v220" stroke="#7b6c57" stroke-width="12"/>
{''.join(lantern(x,y,s) for x,y,s in [(360,380,1),(430,440,.8),(1270,355,1),(1200,425,.8),(650,450,.7),(930,450,.7)])}
<g fill="#f0c580" opacity=".75"><circle cx="330" cy="600" r="5"/><circle cx="410" cy="585" r="4"/><circle cx="1220" cy="590" r="4"/><circle cx="1300" cy="610" r="5"/></g>
{path_line([(480,920),(620,810),(760,750),(880,740),(1010,790),(1120,905)],'#e56b3f',4,'12 16',.8)}'''
    if kind == "nj-zhongshan":
        return f'''<circle cx="1240" cy="230" r="230" fill="url(#sunGlow)"/><circle cx="1240" cy="230" r="62" fill="#e6b67e" opacity=".55"/>
{mountains([(0,590),(220,440),(400,520),(610,340),(790,490),(980,300),(1160,500),(1370,380),(1600,560),(1600,760),(0,760)],"#7d9884",.65)}
{mountains([(0,670),(230,570),(470,630),(700,500),(930,610),(1180,515),(1420,620),(1600,560),(1600,790),(0,790)],"#557962",.75)}
<g fill="#3f5e4d">{''.join(tree(x, y, s, '#3f674f', '#574c3d', .9) for x,y,s in [(90,800,1.1),(210,760,.8),(310,840,.9),(1300,790,1),(1430,850,1.1),(1190,850,.8),(150,650,.55),(1400,650,.55)])}</g>
<rect x="605" y="545" width="390" height="215" fill="#e7e1d1"/><rect x="745" y="460" width="110" height="120" fill="#d4c9b5"/>
{roof(800,525,500,'#435a4d','#b9875b',35)}
<path d="M710 760h180l34 150H676Z" fill="#f0ece1"/>
{''.join(f'<path d="M{690+i*17} {850-i*8}h220" stroke="#c4c2b6" stroke-width="5" opacity=".7"/>' for i in range(7))}
{birds(330,260,'#526b59')}{path_line([(470,940),(590,830),(690,760),(790,680),(860,580)],'#1f6f5c',5,'14 18',.7)}'''
    if kind == "bj-axis":
        return f'''<circle cx="800" cy="235" r="250" fill="url(#sunGlow)"/><circle cx="800" cy="235" r="74" fill="#c9755a" opacity=".48"/>
{mountains([(0,620),(250,540),(450,580),(660,500),(850,570),(1080,500),(1320,580),(1600,510),(1600,780),(0,780)],"#b5a58f",.5)}
<rect x="0" y="700" width="1600" height="300" fill="#c0af95" opacity=".38"/>
<g fill="#b88062" opacity=".72"><rect x="80" y="600" width="220" height="200"/><rect x="1300" y="600" width="220" height="200"/><rect x="350" y="650" width="160" height="150"/><rect x="1090" y="650" width="160" height="150"/></g>
<rect x="550" y="500" width="500" height="310" fill="#9a5b4b"/>
{roof(800,455,620,'#55433a','#bd6b4f',58)}
<rect x="715" y="585" width="170" height="225" fill="#352e2a"/>
<rect x="610" y="560" width="65" height="80" fill="#dbb78d"/><rect x="925" y="560" width="65" height="80" fill="#dbb78d"/>
<g fill="#e6c59e" opacity=".7"><rect x="392" y="600" width="34" height="50"/><rect x="1175" y="600" width="34" height="50"/></g>
{birds(330,280,'#74604d')}{path_line([(800,950),(800,850),(800,740),(800,620),(800,505)],'#e56b3f',5,'13 17',.8)}'''
    if kind == "bj-hutong":
        return f'''<circle cx="1230" cy="230" r="220" fill="url(#sunGlow)"/><circle cx="1230" cy="230" r="62" fill="#d1a16e" opacity=".4"/>
{mountains([(0,600),(240,520),(440,580),(680,470),(920,560),(1180,480),(1400,570),(1600,510),(1600,760),(0,760)],"#aaa08d",.45)}
<path d="M0 1000L560 440H1040L1600 1000Z" fill="#b8b4a8"/><path d="M560 440H1040L1600 1000H0Z" fill="#d2cec2" opacity=".55"/>
<path d="M735 1000L792 450H810L860 1000Z" fill="#e9e5db" opacity=".85"/>
<g fill="#6f726d"><rect x="80" y="610" width="360" height="230"/><rect x="1160" y="610" width="360" height="230"/></g>
<g fill="#454c48">{roof(250,610,420,'#454c48','#8e6b56',30)}{roof(1340,610,420,'#454c48','#8e6b56',30)}</g>
<g fill="#d0b98e"><rect x="160" y="680" width="58" height="95"/><rect x="290" y="680" width="58" height="95"/><rect x="1240" y="680" width="58" height="95"/><rect x="1370" y="680" width="58" height="95"/></g>
{bike(510,840,1.2,'#48615a')}
{''.join(tree(x,760,.65,'#5d775b','#66523f',.9) for x in [105,1490])}
<g fill="none" stroke="#5f625d" stroke-width="3" opacity=".45"><path d="M0 380Q400 460 800 400T1600 410"/><path d="M320 380v-70M890 413v-86M1250 395v-70"/></g>
{birds(300,250,'#786b5d')}{path_line([(640,930),(700,830),(758,750),(805,670),(845,590)],'#e56b3f',4,'12 16',.7)}'''
    if kind == "bj-yonghe":
        return f'''<circle cx="1260" cy="220" r="230" fill="url(#sunGlow)"/><circle cx="1260" cy="220" r="64" fill="#d19766" opacity=".45"/>
{mountains([(0,610),(220,530),(450,575),(680,490),(910,560),(1140,490),(1380,565),(1600,520),(1600,760),(0,760)],"#aa9984",.42)}
<rect x="0" y="710" width="1600" height="290" fill="#b8aa94" opacity=".5"/>
<rect x="500" y="495" width="600" height="300" fill="#a8624f"/>
{roof(800,455,680,'#554039','#cf7957',54)}
<rect x="690" y="570" width="220" height="225" fill="#3a302b"/>
<rect x="550" y="560" width="86" height="100" fill="#d9b47f"/><rect x="965" y="560" width="86" height="100" fill="#d9b47f"/>
{lantern(400,390,1.1)}{lantern(1200,390,1.1)}{lantern(300,280,.8)}
<g fill="none" stroke="#f3e6cf" stroke-width="9" opacity=".38"><path d="M470 650c-70-90 40-135 10-230s55-130 15-210"/><path d="M1130 650c60-85-45-130-20-225s-40-120-5-205"/></g>
{birds(300,230,'#74604d')}{path_line([(700,940),(735,830),(765,730),(800,620),(835,505)],'#e56b3f',4,'12 16',.72)}'''
    if kind == "cd-yulin":
        return f'''<circle cx="1280" cy="230" r="230" fill="url(#sunGlow)"/><circle cx="1280" cy="230" r="66" fill="#e2a55c" opacity=".38"/>
{mountains([(0,620),(250,520),(470,580),(710,490),(930,565),(1190,500),(1420,575),(1600,520),(1600,760),(0,760)],"#8c937e",.45)}
<path d="M0 1000L630 470H970L1600 1000Z" fill="#b2b29c"/><path d="M630 470H970L1600 1000H0Z" fill="#d0cdb9" opacity=".54"/>
<g><rect x="60" y="580" width="410" height="280" fill="#625e4e"/><rect x="1130" y="555" width="410" height="305" fill="#625e4e"/></g>
<g fill="#d4c6a7"><rect x="115" y="640" width="80" height="95"/><rect x="250" y="640" width="80" height="95"/><rect x="1180" y="625" width="80" height="95"/><rect x="1320" y="625" width="80" height="95"/></g>
<g fill="#d58a50"><rect x="90" y="565" width="350" height="20"/><rect x="1160" y="540" width="350" height="20"/></g>
<path d="M-20 560L150 525H340L520 570Z" fill="#e0a062" opacity=".78"/><path d="M1080 535L1260 500H1440L1620 545Z" fill="#e0a062" opacity=".72"/>
<g fill="#6f634e"><rect x="690" y="810" width="120" height="18" rx="5"/><rect x="705" y="828" width="12" height="55"/><rect x="795" y="828" width="12" height="55"/><circle cx="600" cy="840" r="28"/><circle cx="900" cy="840" r="28"/></g>
{''.join(tree(x,800,.55,'#647a55','#6a5840',.82) for x in [1040,1080,1120])}
{path_line([(690,930),(710,850),(745,770),(800,690),(840,590)],'#1f6f5c',4,'12 16',.72)}'''
    if kind == "cd-park":
        return f'''<circle cx="1230" cy="215" r="240" fill="url(#sunGlow)"/><circle cx="1230" cy="215" r="72" fill="#d19b5d" opacity=".42"/>
{mountains([(0,600),(230,500),(430,560),(670,470),(920,545),(1160,480),(1390,560),(1600,500),(1600,760),(0,760)],"#8d9e83",.48)}
{water(680,'#94b5aa',.76)}
<path d="M0 690C270 660 430 720 670 685S1100 660 1600 700V1000H0Z" fill="#adba9e" opacity=".72"/>
<rect x="250" y="510" width="310" height="190" fill="#e0d6c1"/>
{roof(405,505,390,'#4a5c4e','#b9744f',36)}
<rect x="330" y="585" width="70" height="115" fill="#675f4e"/><rect x="440" y="585" width="70" height="115" fill="#efe6d1"/>
<path d="M290 705h240" stroke="#705e45" stroke-width="12"/>
<g fill="#6e5c45"><rect x="620" y="760" width="180" height="16" rx="5"/><rect x="650" y="776" width="10" height="62"/><rect x="760" y="776" width="10" height="62"/><circle cx="580" cy="800" r="24"/><circle cx="840" cy="800" r="24"/></g>
{''.join(tree(1080+i*70,730,.75,'#4f7456','#65543d',.9) for i in range(6))}
{''.join(tree(100+i*28,760,.38,'#497555','#5d563e',.82) for i in range(11))}
{birds(330,250,'#61705d')}{path_line([(570,940),(630,865),(690,800),(755,735),(815,650)],'#1f6f5c',4,'12 16',.7)}'''
    if kind == "cd-dongjiao":
        return f'''<circle cx="1240" cy="230" r="230" fill="url(#sunGlow)"/><circle cx="1240" cy="230" r="62" fill="#d6815b" opacity=".38"/>
{mountains([(0,630),(230,540),(450,590),(700,500),(950,575),(1200,505),(1420,580),(1600,520),(1600,760),(0,760)],"#868d81",.45)}
<rect x="0" y="710" width="1600" height="290" fill="#9fa79b" opacity=".62"/>
<g fill="#626b62"><rect x="170" y="525" width="420" height="260"/><rect x="700" y="575" width="350" height="210"/><rect x="1090" y="500" width="340" height="285"/></g>
<g fill="#d6a06e" opacity=".65"><rect x="220" y="580" width="55" height="75"/><rect x="310" y="580" width="55" height="75"/><rect x="400" y="580" width="55" height="75"/><rect x="745" y="620" width="55" height="70"/><rect x="840" y="620" width="55" height="70"/><rect x="1140" y="555" width="55" height="75"/><rect x="1240" y="555" width="55" height="75"/><rect x="1340" y="555" width="55" height="75"/></g>
<g fill="#4b514c"><rect x="430" y="340" width="45" height="200"/><rect x="1200" y="280" width="52" height="235"/><rect x="1260" y="360" width="32" height="150"/></g>
<g fill="none" stroke="#f0e5d2" stroke-width="7" opacity=".32"><path d="M450 350c-40-80 32-130-12-220"/><path d="M1225 290c-30-65 28-110-10-180"/></g>
{bike(660,850,1.1,'#495b54')}
<path d="M0 880C260 830 480 910 760 870S1220 830 1600 875" fill="none" stroke="#d4e4df" stroke-width="54" opacity=".45"/>
{path_line([(600,950),(690,880),(790,835),(900,845),(1030,880),(1140,920)],'#e56b3f',4,'12 16',.74)}'''
    if kind == "dl-oldtown":
        return f'''<circle cx="1210" cy="215" r="240" fill="url(#sunGlow)"/><circle cx="1210" cy="215" r="70" fill="#e7c17e" opacity=".48"/>
{mountains([(0,610),(190,460),(370,555),(580,330),(750,500),(900,280),(1090,510),(1320,360),(1600,560),(1600,760),(0,760)],"#678b88",.72)}
{mountains([(0,680),(220,585),(450,635),(680,510),(880,625),(1110,520),(1330,640),(1510,570),(1600,650),(1600,810),(0,810)],"#4c7774",.68)}
<path d="M675 510L750 340L825 510Z" fill="#f4f1e7" opacity=".88"/><path d="M725 400L750 340L775 400Z" fill="#fff" opacity=".75"/>
<rect x="0" y="735" width="1600" height="265" fill="#a9b9ad" opacity=".55"/>
<rect x="420" y="540" width="760" height="295" fill="#e6dfd0"/>
{roof(800,520,820,'#526258','#b87a54',52)}
<rect x="700" y="625" width="200" height="210" fill="#56564b"/>
<g fill="#7a6c59"><rect x="250" y="685" width="230" height="150"/><rect x="1130" y="670" width="250" height="165"/></g>
{roof(365,680,280,'#5a665c','#ad7553',28)}{roof(1255,665,300,'#5a665c','#ad7553',28)}
{''.join(tree(x,780,.62,'#557766','#65543f',.82) for x in [120,1480,1030,1110])}
{birds(420,230,'#526b67')}{path_line([(500,950),(600,870),(700,815),(800,780),(910,745),(1040,805),(1180,875)],'#1f6f5c',4,'12 16',.7)}'''
    if kind == "dl-erhai":
        return f'''<circle cx="1220" cy="210" r="250" fill="url(#sunGlow)"/><circle cx="1220" cy="210" r="76" fill="#e7bc74" opacity=".52"/>
{mountains([(0,590),(180,430),(370,540),(560,310),(730,490),(880,250),(1080,480),(1300,330),(1600,555),(1600,750),(0,750)],"#6b8e8b",.7)}
{mountains([(0,670),(250,570),(470,630),(690,490),(880,610),(1090,470),(1290,625),(1480,540),(1600,640),(1600,810),(0,810)],"#4e7977",.67)}
<path d="M690 490L760 315L830 490Z" fill="#f4f2e9" opacity=".86"/><path d="M737 380L760 315L785 380Z" fill="#fff" opacity=".78"/>
{water(710,'#9bc2c1',.85)}
<path d="M0 790C240 750 430 810 650 775S1030 760 1600 805V1000H0Z" fill="#9fbca0" opacity=".82"/>
<path d="M420 1000C560 870 690 880 820 815S1090 760 1260 690" fill="none" stroke="#f3efe2" stroke-width="38"/>
<path d="M420 1000C560 870 690 880 820 815S1090 760 1260 690" fill="none" stroke="#bfa576" stroke-width="3" stroke-dasharray="12 16"/>
<g fill="#e8e2d4"><rect x="120" y="700" width="160" height="100"/><rect x="1340" y="700" width="170" height="100"/></g>
<g fill="#5b7268"><path d="M105 700L200 650L295 700Z"/><path d="M1325 700L1425 650L1525 700Z"/></g>
{''.join(tree(1030+i*65,760,.52,'#537665','#65543e',.8) for i in range(5))}
{birds(390,230,'#536d69')}'''
    if kind == "dl-cangshan":
        return f'''<circle cx="1220" cy="210" r="240" fill="url(#sunGlow)"/><circle cx="1220" cy="210" r="64" fill="#e3b675" opacity=".42"/>
{mountains([(0,570),(160,420),(360,540),(540,280),(720,470),(900,210),(1100,460),(1280,300),(1450,500),(1600,370),(1600,760),(0,760)],"#628883",.7)}
{mountains([(0,650),(230,550),(450,620),(670,470),(850,600),(1070,430),(1270,610),(1460,520),(1600,620),(1600,810),(0,810)],"#456f6b",.72)}
<path d="M690 620L780 340L870 620Z" fill="#f2f0e7" opacity=".88"/><path d="M750 440L780 340L810 440Z" fill="#fff" opacity=".8"/>
<g fill="none" stroke="#e9dfca" stroke-width="6" opacity=".7"><path d="M250 300L850 530"/><path d="M285 338L850 550"/><path d="M250 300v-80M850 530v-80"/></g>
<g fill="#f1dfba"><rect x="225" y="218" width="54" height="34" rx="6"/><rect x="822" y="448" width="54" height="34" rx="6"/></g>
<path d="M0 810C280 760 450 835 700 800S1160 760 1600 820V1000H0Z" fill="#92ad8e" opacity=".82"/>
<rect x="430" y="650" width="290" height="185" fill="#e4ddcc"/>
{roof(575,640,330,'#4b5e53','#b67853',34)}
<rect x="500" y="720" width="55" height="95" fill="#665b49"/><rect x="610" y="720" width="55" height="95" fill="#f0e7d2"/>
{''.join(tree(x,790,.7,'#50755b','#65543f',.86) for x in [120,250,1230,1380,1500])}
{birds(350,240,'#536e68')}{path_line([(280,940),(420,860),(560,820),(700,780),(850,805),(1000,860),(1140,920)],'#1f6f5c',4,'12 16',.7)}'''
    return f'''<circle cx="1100" cy="220" r="220" fill="url(#sunGlow)"/><circle cx="1100" cy="220" r="62" fill="#e6bb7b" opacity=".45"/>
{mountains([(0,620),(220,510),(430,570),(680,450),(920,560),(1160,470),(1400,570),(1600,510),(1600,760),(0,760)],"#78938a",.55)}
{water(710,'#9dbdb7',.8)}
{path_line([(360,900),(560,810),(760,760),(960,800),(1180,740),(1390,820)],'#1f6f5c',5,'14 18',.72)}'''


city_asset("nanjing.svg", "nanjing_city")
city_asset("beijing.svg", "beijing_city")
city_asset("chengdu.svg", "chengdu_city")
city_asset("dali.svg", "dali_city")

for route_kind in ["nj-wutong", "nj-qinhuai", "nj-zhongshan", "bj-axis", "bj-hutong", "bj-yonghe", "cd-yulin", "cd-park", "cd-dongjiao", "dl-oldtown", "dl-erhai", "dl-cangshan"]:
    route_asset(route_kind + ".svg", route_kind)

print("Generated", len(list(CITY_DIR.glob("*.svg"))), "city covers and", len(list(ROUTE_DIR.glob("*.svg"))), "route covers.")
