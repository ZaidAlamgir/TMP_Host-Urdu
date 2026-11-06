/**
 * TMP InfoLens - Pinterest-Style Interactive SVG Infographics Engine (Urdu Edition)
 * دی اردو پوسٹ - بصری صحافت اور انفوگرافکس انجن
 */
(function() {
    // --- SAMPLE HIGH-PRECISION SVG INFOGRAPHICS DATASET (URDU) ---
    let INFOLENS_DATA = [
        {
            id: "brics-vs-g7-gdp-2026",
            title: "برکس پلس بمقابلہ جی7: عالمی جی ڈی پی (پی پی پی) میں حصہ داری 2026",
            category: "geopolitics",
            categoryLabel: "جغرافیائی سیاست",
            date: "5 نومبر، 2026",
            aspectRatio: "tall",
            description: "نئے رکن ممالک کی تاریخی شمولیت کے بعد، توسیعی برکس پلس اتحاد اب قوتِ خرید کی مساوات (PPP) کے لحاظ سے عالمی جی ڈی پی کے 37.8 فیصد حصے پر قابض ہے، جو جی7 کے 29.4 فیصد سے کہیں زیادہ ہے۔",
            takeaways: [
                "برکس پلس عالمی معاشی پیداوار (PPP) کے 37.8 فیصد کی نمائندگی کرتا ہے۔",
                "جی7 کا معاشی تناسب سن 2000 میں 44 فیصد سے گھٹ کر سن 2026 میں 29.4 فیصد رہ گیا ہے۔",
                "توانائی برآمدات: برکس پلس عالمی خام تیل کی پیداوار کے 43 فیصد کو کنٹرول کرتا ہے۔"
            ],
            tags: ["brics", "g7", "geopolitics", "economy", "trade"],
            likes: 248,
            views: 4820,
            svgContent: `<svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a; border-radius:12px;">
                <defs>
                    <linearGradient id="bricsGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#f59e0b"/>
                        <stop offset="100%" stop-color="#ef4444"/>
                    </linearGradient>
                    <linearGradient id="g7Grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#38bdf8"/>
                        <stop offset="100%" stop-color="#2563eb"/>
                    </linearGradient>
                </defs>
                <text x="20" y="36" fill="#f8fafc" font-size="16" font-weight="800" font-family="sans-serif">Global GDP Share (PPP) 2026</text>
                <text x="20" y="56" fill="#94a3b8" font-size="11" font-family="sans-serif">Source: IMF World Economic Outlook & TMP Research</text>
                
                <!-- BRICS+ Card -->
                <rect x="20" y="80" width="360" height="150" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>
                <circle cx="48" cy="112" r="16" fill="#f59e0b" fill-opacity="0.2"/>
                <text x="48" y="117" text-anchor="middle" fill="#f59e0b" font-weight="900" font-size="12">B+</text>
                <text x="75" y="116" fill="#ffffff" font-size="16" font-weight="700" font-family="sans-serif">BRICS+ Alliance</text>
                <text x="355" y="116" text-anchor="end" fill="#f59e0b" font-size="22" font-weight="900" font-family="sans-serif">37.8%</text>
                
                <!-- Progress Bar -->
                <rect x="40" y="145" width="320" height="14" rx="7" fill="#334155"/>
                <rect x="40" y="145" width="242" height="14" rx="7" fill="url(#bricsGrad)"/>
                
                <text x="40" y="185" fill="#cbd5e1" font-size="12" font-family="sans-serif">Population: 3.65 Billion (45% of World)</text>
                <text x="40" y="205" fill="#94a3b8" font-size="11" font-family="sans-serif">Global Oil Reserves: 43.2% Controlled</text>
                
                <!-- G7 Card -->
                <rect x="20" y="250" width="360" height="150" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>
                <circle cx="48" cy="282" r="16" fill="#38bdf8" fill-opacity="0.2"/>
                <text x="48" y="287" text-anchor="middle" fill="#38bdf8" font-weight="900" font-size="12">G7</text>
                <text x="75" y="286" fill="#ffffff" font-size="16" font-weight="700" font-family="sans-serif">G7 Nations</text>
                <text x="355" y="286" text-anchor="end" fill="#38bdf8" font-size="22" font-weight="900" font-family="sans-serif">29.4%</text>
                
                <!-- Progress Bar -->
                <rect x="40" y="315" width="320" height="14" rx="7" fill="#334155"/>
                <rect x="40" y="315" width="188" height="14" rx="7" fill="url(#g7Grad)"/>
                
                <text x="40" y="355" fill="#cbd5e1" font-size="12" font-family="sans-serif">Population: 780 Million (9.7% of World)</text>
                <text x="40" y="375" fill="#94a3b8" font-size="11" font-family="sans-serif">Global Financial Reserves Share: 58%</text>
                
                <!-- Footer Tag -->
                <rect x="20" y="420" width="360" height="38" rx="8" fill="#0284c7" fill-opacity="0.12" stroke="#0284c7" stroke-width="1"/>
                <text x="200" y="444" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="700" font-family="sans-serif">Vector Data Chart • Verified by TMP InfoLens</text>
            </svg>`
        },
        {
            id: "maritime-chokepoints-oil-transit",
            title: "عالمی سمندری آبی گزرگاہیں: یومیہ تیل کی ترسیل کے حجم کا تجزیہ",
            category: "economy",
            categoryLabel: "معیشت اور تجارت",
            date: "4 نومبر، 2026",
            aspectRatio: "medium",
            description: "دنیا بھر کے سمندری خام تیل اور پیٹرولیم مصنوعات کی 61 فیصد سے زائد ترسیل محض 5 اہم سمندری گزرگاہوں سے ہوتی ہے۔ آبنائے ہرمز یا باب المندب میں کوئی بھی رکاوٹ فوری طور پر عالمی قیمتوں میں شدید ہلچل پیدا کر دیتی ہے۔",
            takeaways: [
                "آبنائے ہرمز: 21.0 ملین بیرل یومیہ (عالمی کھپت کا 21 فیصد)۔",
                "آبنائے ملاکا: 16.8 ملین بیرل یومیہ جو خلیج کو مشرقی ایشیا سے جوڑتی ہے۔",
                "باب المندب اور نہر سویز: بالترتیب 7.2 ملین اور 6.6 ملین بیرل یومیہ۔"
            ],
            tags: ["oil", "transit", "hormuz", "suez", "shipping", "energy"],
            likes: 194,
            views: 3410,
            svgContent: `<svg viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:12px;">
                <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#0284c7"/>
                        <stop offset="100%" stop-color="#38bdf8"/>
                    </linearGradient>
                </defs>
                <text x="20" y="34" fill="#ffffff" font-size="15" font-weight="800" font-family="sans-serif">Daily Crude & Fuel Flow (M bpd)</text>
                <text x="20" y="52" fill="#64748b" font-size="11" font-family="sans-serif">Strategic maritime passages vital to world supply</text>
                
                <!-- Hormuz -->
                <text x="20" y="90" fill="#e2e8f0" font-size="12" font-weight="600" font-family="sans-serif">Strait of Hormuz (Persian Gulf)</text>
                <text x="380" y="90" text-anchor="end" fill="#f59e0b" font-weight="800" font-size="13">21.0M</text>
                <rect x="20" y="100" width="360" height="12" rx="6" fill="#1e293b"/>
                <rect x="20" y="100" width="310" height="12" rx="6" fill="#f59e0b"/>
                
                <!-- Malacca -->
                <text x="20" y="145" fill="#e2e8f0" font-size="12" font-weight="600" font-family="sans-serif">Strait of Malacca (Indo-Pacific)</text>
                <text x="380" y="145" text-anchor="end" fill="#38bdf8" font-weight="800" font-size="13">16.8M</text>
                <rect x="20" y="155" width="360" height="12" rx="6" fill="#1e293b"/>
                <rect x="20" y="155" width="248" height="12" rx="6" fill="url(#barGrad)"/>
                
                <!-- Bab el-Mandeb -->
                <text x="20" y="200" fill="#e2e8f0" font-size="12" font-weight="600" font-family="sans-serif">Bab el-Mandeb (Red Sea Entrance)</text>
                <text x="380" y="200" text-anchor="end" fill="#38bdf8" font-weight="800" font-size="13">7.2M</text>
                <rect x="20" y="210" width="360" height="12" rx="6" fill="#1e293b"/>
                <rect x="20" y="210" width="106" height="12" rx="6" fill="url(#barGrad)"/>
                
                <!-- Suez Canal -->
                <text x="20" y="255" fill="#e2e8f0" font-size="12" font-weight="600" font-family="sans-serif">Suez Canal / SUMED Pipeline</text>
                <text x="380" y="255" text-anchor="end" fill="#38bdf8" font-weight="800" font-size="13">6.6M</text>
                <rect x="20" y="265" width="360" height="12" rx="6" fill="#1e293b"/>
                <rect x="20" y="265" width="97" height="12" rx="6" fill="url(#barGrad)"/>
                
                <!-- Danish & Turkish Straits -->
                <text x="20" y="310" fill="#e2e8f0" font-size="12" font-weight="600" font-family="sans-serif">Turkish Straits (Bosphorus & Dardanelles)</text>
                <text x="380" y="310" text-anchor="end" fill="#38bdf8" font-weight="800" font-size="13">3.2M</text>
                <rect x="20" y="320" width="360" height="12" rx="6" fill="#1e293b"/>
                <rect x="20" y="320" width="47" height="12" rx="6" fill="url(#barGrad)"/>
            </svg>`
        },
        {
            id: "jf17-block3-avionics-matrix",
            title: "جے ایف-17 تھنڈر بلاک III: جدید ایویونکس اور میزائل فائرنگ صلاحیت",
            category: "defense",
            categoryLabel: "دفاع اور سلامتی",
            date: "4 نومبر، 2026",
            aspectRatio: "tall",
            description: "4.5+ جنریشن کے جے ایف-17 تھنڈر بلاک III ملٹی رول لڑاکا طیارے کا تفصیلی تکنیکی جائزہ، جس میں KLJ-7A ایکٹو الیکٹرانکلی سکینڈ ایرے (AESA) ریڈار اور بی وی آر میزائل شامل ہیں۔",
            takeaways: [
                "KLJ-7A AESA ریڈار: بیک وقت 15 اہداف کی ٹریکنگ کے ساتھ 170 کلومیٹر رینج۔",
                "پی ایل-15 اور فائز میزائل انضمام کے ساتھ 145+ کلومیٹر مارک صلاحیت۔",
                "وائیڈ اینگل ہولوگرافک ایچ یو ڈی اور ہیلمٹ ماؤنٹڈ ڈسپلے (HMD) ٹارگٹنگ سسٹم۔"
            ],
            tags: ["jf17", "defense", "missile", "pakistan", "airforce", "radar"],
            likes: 312,
            views: 5240,
            svgContent: `<svg viewBox="0 0 400 460" xmlns="http://www.w3.org/2000/svg" style="background:#0c1322; border-radius:12px;">
                <defs>
                    <radialGradient id="radarPing" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#10b981" stop-opacity="0.6"/>
                        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <text x="20" y="34" fill="#34d399" font-size="15" font-weight="800" font-family="monospace">SYSTEM MATRIX // JF-17 BLOCK III</text>
                <text x="20" y="52" fill="#64748b" font-size="11" font-family="sans-serif">4.5+ Generation Multi-Role Combat Fighter</text>
                
                <!-- Fighter Jet Wireframe Outline -->
                <path d="M 200 80 L 210 130 L 245 190 L 330 240 L 315 255 L 225 240 L 225 290 L 255 330 L 240 340 L 200 325 L 160 340 L 145 330 L 175 290 L 175 240 L 85 255 L 70 240 L 155 190 L 190 130 Z" 
                      fill="#1e293b" stroke="#38bdf8" stroke-width="1.8" stroke-linejoin="round"/>
                
                <!-- Nose Radome Pulse -->
                <circle cx="200" cy="80" r="18" fill="url(#radarPing)"/>
                <circle cx="200" cy="80" r="4" fill="#34d399"/>
                
                <!-- Spec Cards Overlay -->
                <!-- 1. Radar -->
                <rect x="20" y="120" width="120" height="52" rx="8" fill="#1e293b" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
                <text x="28" y="138" fill="#38bdf8" font-size="10" font-weight="700">KLJ-7A AESA</text>
                <text x="28" y="152" fill="#e2e8f0" font-size="11" font-weight="600">Range: 170 km</text>
                <text x="28" y="164" fill="#94a3b8" font-size="9">Track: 15 Targets</text>
                
                <!-- 2. BVR Missiles -->
                <rect x="260" y="120" width="120" height="52" rx="8" fill="#1e293b" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
                <text x="268" y="138" fill="#f59e0b" font-size="10" font-weight="700">FA'AZ / PL-15</text>
                <text x="268" y="152" fill="#e2e8f0" font-size="11" font-weight="600">BVR Reach: 145+ km</text>
                <text x="268" y="164" fill="#94a3b8" font-size="9">Dual-Pulse Motor</text>
                
                <!-- 3. Cockpit & HMD -->
                <rect x="20" y="270" width="120" height="52" rx="8" fill="#1e293b" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
                <text x="28" y="288" fill="#a855f7" font-size="10" font-weight="700">AVIONICS SUITE</text>
                <text x="28" y="302" fill="#e2e8f0" font-size="11" font-weight="600">HMD / NVG Helmet</text>
                <text x="28" y="314" fill="#94a3b8" font-size="9">Fly-by-Wire (FBW)</text>
                
                <!-- 4. Electronic Warfare -->
                <rect x="260" y="270" width="120" height="52" rx="8" fill="#1e293b" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
                <text x="268" y="288" fill="#10b981" font-size="10" font-weight="700">EW & DEFENSE</text>
                <text x="268" y="302" fill="#e2e8f0" font-size="11" font-weight="600">Internal Jammer</text>
                <text x="268" y="314" fill="#94a3b8" font-size="9">MAWS 360° Detect</text>
                
                <!-- Bottom Stat Bar -->
                <rect x="20" y="375" width="360" height="65" rx="10" fill="#131e33" stroke="#1e293b"/>
                <text x="35" y="400" fill="#cbd5e1" font-size="11" font-weight="600">Top Speed: Mach 1.6</text>
                <text x="35" y="422" fill="#94a3b8" font-size="10">Combat Radius: 1,350 km</text>
                <text x="220" y="400" fill="#cbd5e1" font-size="11" font-weight="600">Service Ceiling: 55,000 ft</text>
                <text x="220" y="422" fill="#94a3b8" font-size="10">Hardpoints: 8 Weapon Stations</text>
            </svg>`
        },
        {
            id: "renewable-energy-capacity-expansion",
            title: "عالمی ماحول دوست توانائی منتقلی: شمسی اور پون توانائی میں اضافہ (2020-2026)",
            category: "climate",
            categoryLabel: "ماحولیات اور توانائی",
            date: "3 نومبر، 2026",
            aspectRatio: "medium",
            description: "شمسی فوٹو وولٹک اور پون توانائی کی سالانہ صلاحیت میں غیر معمولی تیزی آئی ہے، جو سن 2020 میں 260 گیگاواٹ سے بڑھ کر سن 2026 میں 585 گیگاواٹ تک پہنچ چکی ہے۔",
            takeaways: [
                "سن 2026 میں عالمی سطح پر 585 گیگاواٹ نئی صاف توانائی شامل کی گئی۔",
                "شمسی پی وی نے لاگت میں نمایاں کمی کے باعث مجموعی اضافے کا 74 فیصد حصہ حاصل کیا۔",
                "ایشیا 62 فیصد تنصیبات کے ساتھ عالمی سطح پر سرفہرست ہے۔"
            ],
            tags: ["solar", "wind", "climate", "energy", "renewables", "green"],
            likes: 178,
            views: 2980,
            svgContent: `<svg viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg" style="background:#091b18; border-radius:12px;">
                <defs>
                    <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#10b981" stop-opacity="0.5"/>
                        <stop offset="100%" stop-color="#10b981" stop-opacity="0.02"/>
                    </linearGradient>
                </defs>
                <text x="20" y="34" fill="#34d399" font-size="15" font-weight="800" font-family="sans-serif">Annual Renewable Additions (GW)</text>
                <text x="20" y="52" fill="#6ee7b7" font-size="11" font-family="sans-serif">Steep trajectory toward 2030 net-zero targets</text>
                
                <!-- Grid Lines -->
                <line x1="40" y1="90" x2="370" y2="90" stroke="#134e48" stroke-dasharray="3,3"/>
                <text x="25" y="94" fill="#5eead4" font-size="9">600</text>
                
                <line x1="40" y1="150" x2="370" y2="150" stroke="#134e48" stroke-dasharray="3,3"/>
                <text x="25" y="154" fill="#5eead4" font-size="9">400</text>
                
                <line x1="40" y1="210" x2="370" y2="210" stroke="#134e48" stroke-dasharray="3,3"/>
                <text x="25" y="214" fill="#5eead4" font-size="9">200</text>
                
                <!-- Area Fill -->
                <polygon points="50,225 105,200 160,175 215,145 270,118 325,96 325,260 50,260" fill="url(#greenArea)"/>
                
                <!-- Trend Line -->
                <polyline points="50,225 105,200 160,175 215,145 270,118 325,96" 
                          fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
                
                <!-- Data Nodes -->
                <circle cx="50" cy="225" r="4" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
                <text x="50" y="280" text-anchor="middle" fill="#99f6e4" font-size="10">'21</text>
                
                <circle cx="105" cy="200" r="4" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
                <text x="105" y="280" text-anchor="middle" fill="#99f6e4" font-size="10">'22</text>
                
                <circle cx="160" cy="175" r="4" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
                <text x="160" y="280" text-anchor="middle" fill="#99f6e4" font-size="10">'23</text>
                
                <circle cx="215" cy="145" r="4" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
                <text x="215" y="280" text-anchor="middle" fill="#99f6e4" font-size="10">'24</text>
                
                <circle cx="270" cy="118" r="4" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
                <text x="270" y="280" text-anchor="middle" fill="#99f6e4" font-size="10">'25</text>
                
                <circle cx="325" cy="96" r="6" fill="#34d399" stroke="#ffffff" stroke-width="2"/>
                <text x="325" y="280" text-anchor="middle" fill="#34d399" font-size="11" font-weight="700">'26</text>
                <text x="325" y="80" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="800">585 GW</text>
                
                <!-- Bottom Stat Pills -->
                <rect x="30" y="305" width="160" height="30" rx="6" fill="#134e4a"/>
                <text x="110" y="324" text-anchor="middle" fill="#ccfbf1" font-size="10" font-weight="600">Solar PV: 432 GW (74%)</text>
                
                <rect x="210" y="305" width="160" height="30" rx="6" fill="#134e4a"/>
                <text x="290" y="324" text-anchor="middle" fill="#ccfbf1" font-size="10" font-weight="600">Wind: 153 GW (26%)</text>
            </svg>`
        },
        {
            id: "semiconductor-ai-foundry-share",
            title: "مصنوعی ذہانت چپس سپلائی چین: سب-5nm ایڈوانسڈ نوڈ فاؤنڈری تقسیم",
            category: "technology",
            categoryLabel: "ٹیکنالوجی اور AI",
            date: "3 نومبر، 2026",
            aspectRatio: "tall",
            description: "اعلیٰ کارکردگی والے کمپیوٹنگ اور مصنوعی ذہانت کے تیز رفتار پروسیسر چپس کی مینوفیکچرنگ جغرافیائی طور پر انتہائی محدود خطوں میں مرکوز ہے، جس سے تائیوان کی آبنائے میں اسٹریٹجک انحصار پیدا ہوتا ہے۔",
            takeaways: [
                "تائیوان (TSMC) تمام 5 نینو میٹر سے باریک AI پروسیسرز کا 64 فیصد تیار کرتا ہے۔",
                "جنوبی کوریا (سام سنگ) عالمی سطح پر 18 فیصد جدید ویفرز تیار کرتا ہے۔",
                "چپس ایکٹ کے کارخانوں کی شروعات کے بعد امریکی ملکی پیداواری حصہ 12 فیصد تک پہنچ رہا ہے۔"
            ],
            tags: ["semiconductors", "ai", "chips", "tsmc", "foundry", "technology"],
            likes: 220,
            views: 4120,
            svgContent: `<svg viewBox="0 0 400 450" xmlns="http://www.w3.org/2000/svg" style="background:#13111c; border-radius:12px;">
                <text x="20" y="34" fill="#a78bfa" font-size="15" font-weight="800" font-family="sans-serif">Sub-5nm Chip Foundry Share</text>
                <text x="20" y="52" fill="#7c3aed" font-size="11" font-family="sans-serif">Global concentration of advanced AI accelerators</text>
                
                <!-- Semi-circle / Donut representation -->
                <circle cx="200" cy="160" r="70" fill="none" stroke="#2e1065" stroke-width="32"/>
                <circle cx="200" cy="160" r="70" fill="none" stroke="#a78bfa" stroke-width="32"
                        stroke-dasharray="280 440" stroke-dashoffset="0"/>
                <circle cx="200" cy="160" r="70" fill="none" stroke="#60a5fa" stroke-width="32"
                        stroke-dasharray="79 440" stroke-dashoffset="-280"/>
                <circle cx="200" cy="160" r="70" fill="none" stroke="#f43f5e" stroke-width="32"
                        stroke-dasharray="52 440" stroke-dashoffset="-359"/>
                <circle cx="200" cy="160" r="70" fill="none" stroke="#34d399" stroke-width="32"
                        stroke-dasharray="29 440" stroke-dashoffset="-411"/>
                
                <text x="200" y="156" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="900" font-family="sans-serif">&lt; 5nm</text>
                <text x="200" y="172" text-anchor="middle" fill="#a78bfa" font-size="10" font-weight="700">FOUNDRY NODES</text>
                
                <!-- Breakdown Bars -->
                <!-- Taiwan -->
                <rect x="25" y="255" width="350" height="38" rx="8" fill="#1f1d2e" stroke="#2e1065"/>
                <circle cx="45" cy="274" r="6" fill="#a78bfa"/>
                <text x="60" y="278" fill="#ffffff" font-size="12" font-weight="700">Taiwan (TSMC)</text>
                <text x="360" y="278" text-anchor="end" fill="#a78bfa" font-size="14" font-weight="800">64.0%</text>
                
                <!-- South Korea -->
                <rect x="25" y="300" width="350" height="38" rx="8" fill="#1f1d2e" stroke="#2e1065"/>
                <circle cx="45" cy="319" r="6" fill="#60a5fa"/>
                <text x="60" y="323" fill="#ffffff" font-size="12" font-weight="700">South Korea (Samsung)</text>
                <text x="360" y="323" text-anchor="end" fill="#60a5fa" font-size="14" font-weight="800">18.0%</text>
                
                <!-- United States -->
                <rect x="25" y="345" width="350" height="38" rx="8" fill="#1f1d2e" stroke="#2e1065"/>
                <circle cx="45" cy="364" r="6" fill="#f43f5e"/>
                <text x="60" y="368" fill="#ffffff" font-size="12" font-weight="700">United States (Intel / TSMC AZ)</text>
                <text x="360" y="368" text-anchor="end" fill="#f43f5e" font-size="14" font-weight="800">12.0%</text>
                
                <!-- Rest of World -->
                <rect x="25" y="390" width="350" height="38" rx="8" fill="#1f1d2e" stroke="#2e1065"/>
                <circle cx="45" cy="409" r="6" fill="#34d399"/>
                <text x="60" y="413" fill="#ffffff" font-size="12" font-weight="700">Japan / EU / Others</text>
                <text x="360" y="413" text-anchor="end" fill="#34d399" font-size="14" font-weight="800">6.0%</text>
            </svg>`
        },
        {
            id: "electoral-voter-deletion-form7",
            title: "اہم انتخابی حلقوں میں فارم 7 ووٹر لسٹ اخراج کی جانچ پڑتال",
            category: "human-rights",
            categoryLabel: "انسانی حقوق",
            date: "2 نومبر، 2026",
            aspectRatio: "medium",
            description: "شہری اور دیہی حلقوں میں فارم 7 کے تحت داخل کیے گئے ووٹر اعتراضات کا تفتیشی ڈیٹا تجزیہ، جس میں مسترد اور قبول شدہ اپیلوں کا گہرا جائزہ لیا گیا ہے۔",
            takeaways: [
                "منتخب اضلاع میں فارم 7 کے تحت 84,000 سے زائد اعتراضات درج کروائے گئے۔",
                "تصدیق شدہ ووٹرز میں سے 91.4 فیصد اپنے درج شدہ پتے پر ہی رہائش پذیر پائے گئے۔",
                "سول سوسائٹی کے آڈٹ کے باعث 72 فیصد چیلنج کیے گئے کیسز میں غیر قانونی ووٹر اخراج روکا گیا۔"
            ],
            tags: ["elections", "voting", "voter-rights", "delhi", "human-rights"],
            likes: 284,
            views: 4560,
            svgContent: `<svg viewBox="0 0 400 370" xmlns="http://www.w3.org/2000/svg" style="background:#181216; border-radius:12px;">
                <text x="20" y="34" fill="#fb7185" font-size="15" font-weight="800" font-family="sans-serif">Form 7 Deletion Audits (2026)</text>
                <text x="20" y="52" fill="#9f1239" font-size="11" font-family="sans-serif">Targeted electoral roll objection verification rates</text>
                
                <!-- Stat Boxes -->
                <rect x="20" y="75" width="170" height="75" rx="10" fill="#29151e" stroke="#4c1d30"/>
                <text x="35" y="102" fill="#fda4af" font-size="11" font-weight="700">TOTAL OBJECTIONS</text>
                <text x="35" y="132" fill="#ffffff" font-size="24" font-weight="900">84,210</text>
                
                <rect x="210" y="75" width="170" height="75" rx="10" fill="#29151e" stroke="#4c1d30"/>
                <text x="225" y="102" fill="#fda4af" font-size="11" font-weight="700">FALSE / DISMISSED</text>
                <text x="225" y="132" fill="#fb7185" font-size="24" font-weight="900">91.4%</text>
                
                <!-- Constituency Bars -->
                <text x="20" y="180" fill="#fecdd3" font-size="12" font-weight="700">Mustafabad (North East Delhi)</text>
                <text x="380" y="180" text-anchor="end" fill="#f43f5e" font-size="12" font-weight="700">94.2% False</text>
                <rect x="20" y="190" width="360" height="12" rx="6" fill="#29151e"/>
                <rect x="20" y="190" width="339" height="12" rx="6" fill="#f43f5e"/>
                
                <text x="20" y="230" fill="#fecdd3" font-size="12" font-weight="700">Belagavi North (Karnataka)</text>
                <text x="380" y="230" text-anchor="end" fill="#f43f5e" font-size="12" font-weight="700">89.8% False</text>
                <rect x="20" y="240" width="360" height="12" rx="6" fill="#29151e"/>
                <rect x="20" y="240" width="323" height="12" rx="6" fill="#f43f5e"/>
                
                <text x="20" y="280" fill="#fecdd3" font-size="12" font-weight="700">Dhubri & Goalpara (Assam)</text>
                <text x="380" y="280" text-anchor="end" fill="#f43f5e" font-size="12" font-weight="700">92.6% False</text>
                <rect x="20" y="290" width="360" height="12" rx="6" fill="#29151e"/>
                <rect x="20" y="290" width="333" height="12" rx="6" fill="#f43f5e"/>
                
                <!-- Notice -->
                <rect x="20" y="320" width="360" height="32" rx="6" fill="#4c0519"/>
                <text x="200" y="340" text-anchor="middle" fill="#fecdd3" font-size="11" font-weight="600">Cross-verified via Door-to-Door Field Audits</text>
            </svg>`
        }
    ];

    // State
    let currentCategory = 'all';
    let searchQuery = '';
    let currentActivePin = null;

    // --- PINCH-TO-ZOOM GESTURE ENGINE (Native Two-Finger Touch & Double-Tap) ---
    let pinchScale = 1.0;
    let pinchStartDist = 0;
    let isPinching = false;
    let lastTapTimestamp = 0;

    function resetPinchZoom() {
        pinchScale = 1.0;
        const stage = document.getElementById('infolens-modal-svg');
        if (stage) {
            stage.style.transform = 'scale(1)';
        }
    }

    function setupPinchZoom() {
        const mediaPane = document.getElementById('infolens-modal-media-pane');
        const stage = document.getElementById('infolens-modal-svg');
        if (!mediaPane || !stage || mediaPane._pinchZoomAttached) return;
        mediaPane._pinchZoomAttached = true;

        function getTouchDistance(touches) {
            return Math.hypot(
                touches[0].clientX - touches[1].clientX,
                touches[0].clientY - touches[1].clientY
            );
        }

        mediaPane.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isPinching = true;
                pinchStartDist = getTouchDistance(e.touches);
            } else if (e.touches.length === 1) {
                // Double-tap toggle zoom between 1.0 and 2.0x
                const now = Date.now();
                if (now - lastTapTimestamp < 320) {
                    e.preventDefault();
                    pinchScale = (pinchScale > 1.2) ? 1.0 : 2.0;
                    stage.style.transform = `scale(${pinchScale})`;
                }
                lastTapTimestamp = now;
            }
        }, { passive: false });

        mediaPane.addEventListener('touchmove', (e) => {
            if (isPinching && e.touches.length === 2) {
                e.preventDefault();
                const dist = getTouchDistance(e.touches);
                if (pinchStartDist > 0) {
                    const factor = dist / pinchStartDist;
                    pinchScale = Math.min(Math.max(pinchScale * factor, 1.0), 3.5);
                    pinchStartDist = dist;
                    stage.style.transform = `scale(${pinchScale})`;
                }
            }
        }, { passive: false });

        mediaPane.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                isPinching = false;
                if (pinchScale < 1.08) {
                    pinchScale = 1.0;
                    stage.style.transform = 'scale(1)';
                }
            }
        });

        // Desktop mouse wheel zoom with Ctrl or Meta key
        mediaPane.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.15 : -0.15;
                pinchScale = Math.min(Math.max(pinchScale + delta, 1.0), 3.5);
                stage.style.transform = `scale(${pinchScale})`;
            }
        }, { passive: false });
    }

    // --- RENDER MAIN PINTEREST MASONRY GRID ---
    function renderGrid() {
        const grid = document.getElementById('infolens-grid');
        if (!grid) return;

        // Filter items
        const filtered = INFOLENS_DATA.filter(item => {
            const matchesCategory = (currentCategory === 'all') || (item.category === currentCategory);
            const textToSearch = (item.title + ' ' + (item.description || '') + ' ' + (item.tags || []).join(' ')).toLowerCase();
            const matchesSearch = !searchQuery || textToSearch.includes(searchQuery.toLowerCase().trim());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="infolens-empty-state">
                    <div class="infolens-empty-icon"><i class="fas fa-layer-group"></i></div>
                    <h3 style="font-weight: 700; margin-bottom: 6px;">کوئی انفوگرافک نہیں ملا</h3>
                    <p style="font-size: 0.9rem;">براہ کرم کوئی دوسرا زمرہ منتخب کریں یا تلاش کا فلٹر صاف کریں۔</p>
                </div>
            `;
            return;
        }

        // Clean Pinterest editorial card layout: No likes, No saved, No download buttons
        grid.innerHTML = filtered.map(item => `
            <div class="infolens-card" data-id="${item.id}">
                <div class="infolens-card-media">
                    <span class="infolens-card-pill-svg">SVG</span>
                    <div class="infolens-hover-overlay">
                        <span class="infolens-inspect-pill"><i class="fas fa-expand"></i> گرافک دیکھیں</span>
                    </div>
                    ${item.svgContent}
                </div>
                <div class="infolens-card-body">
                    <div class="infolens-card-top-row">
                        <span class="infolens-card-category">${item.categoryLabel || item.category}</span>
                        <span class="infolens-card-date">${item.date || ''}</span>
                    </div>
                    <h3 class="infolens-card-title">${item.title}</h3>
                    <p class="infolens-card-desc">${item.description || ''}</p>
                    <div class="infolens-card-footer">
                        <div class="infolens-card-source">
                            <span>دی اردو پوسٹ انفولینس</span>
                            <i class="fas fa-check-circle infolens-verified-check"></i>
                        </div>
                        <span class="infolens-card-arrow"><i class="fas fa-arrow-up-right-from-square"></i></span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // --- RENDER SUGGESTED INFOGRAPHICS GRID INSIDE MODAL (Pinterest Infinite Cycle) ---
    function renderSuggestedGrid(activeId) {
        const suggestedGrid = document.getElementById('infolens-modal-suggested-grid');
        if (!suggestedGrid) return;

        // Exclude current active graphic
        const otherItems = INFOLENS_DATA.filter(item => item.id !== activeId);
        if (otherItems.length === 0) {
            suggestedGrid.innerHTML = '<p class="text-xs text-slate-400 py-4 text-center">فی الوقت کوئی اور انفوگرافک دستیاب نہیں ہے۔</p>';
            return;
        }

        // Sort items: same category first, then others
        const activeItem = INFOLENS_DATA.find(x => x.id === activeId);
        const sortedItems = [...otherItems].sort((a, b) => {
            if (activeItem && a.category === activeItem.category && b.category !== activeItem.category) return -1;
            if (activeItem && b.category === activeItem.category && a.category !== activeItem.category) return 1;
            return 0;
        });

        suggestedGrid.innerHTML = sortedItems.map(item => `
            <div class="infolens-card infolens-suggested-card" data-id="${item.id}">
                <div class="infolens-card-media">
                    <span class="infolens-card-pill-svg">SVG</span>
                    <div class="infolens-hover-overlay">
                        <span class="infolens-inspect-pill"><i class="fas fa-expand"></i> گرافک دیکھیں</span>
                    </div>
                    ${item.svgContent}
                </div>
                <div class="infolens-card-body">
                    <div class="infolens-card-top-row">
                        <span class="infolens-card-category">${item.categoryLabel || item.category}</span>
                        <span class="infolens-card-date">${item.date || ''}</span>
                    </div>
                    <h3 class="infolens-card-title">${item.title}</h3>
                    <p class="infolens-card-desc">${item.description || ''}</p>
                    <div class="infolens-card-footer">
                        <div class="infolens-card-source">
                            <span>دی اردو پوسٹ انفولینس</span>
                            <i class="fas fa-check-circle infolens-verified-check"></i>
                        </div>
                        <span class="infolens-card-arrow"><i class="fas fa-arrow-up-right-from-square"></i></span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // --- PINTEREST-STYLE LIGHTBOX MODAL ---
    function openModal(id) {
        const item = INFOLENS_DATA.find(x => x.id === id);
        if (!item) return;

        currentActivePin = item;

        const modalBackdrop = document.getElementById('infolens-modal');
        const modalBox = document.getElementById('infolens-modal-box');
        const modalMediaPane = document.getElementById('infolens-modal-svg');
        const modalCategory = document.getElementById('infolens-modal-category');
        const modalDate = document.getElementById('infolens-modal-date');
        const modalTitle = document.getElementById('infolens-modal-title');
        const modalDesc = document.getElementById('infolens-modal-desc');
        const modalTakeaways = document.getElementById('infolens-modal-takeaways');
        const modalArticleLink = document.getElementById('infolens-modal-article-link');
        const modalExpandable = document.getElementById('infolens-modal-expandable');
        const readmoreBtnText = document.getElementById('infolens-readmore-text');
        const readmoreBtnIcon = document.getElementById('infolens-readmore-icon');

        if (!modalBackdrop) return;

        // 1. Populate visual & header
        if (modalMediaPane) modalMediaPane.innerHTML = item.svgContent;
        if (modalCategory) modalCategory.textContent = item.categoryLabel || item.category;
        if (modalDate) modalDate.textContent = item.date || '';
        if (modalTitle) modalTitle.textContent = item.title;
        if (modalDesc) modalDesc.textContent = item.description || 'دی اردو پوسٹ کی تصدیق شدہ بصری صحافت اور تفتیشی انفوگرافک رپورٹ۔';

        // 2. Populate takeaways
        if (modalTakeaways) {
            if (Array.isArray(item.takeaways) && item.takeaways.length > 0) {
                modalTakeaways.innerHTML = item.takeaways.map(t => `<li>${t}</li>`).join('');
                document.getElementById('infolens-modal-takeaways-box')?.classList.remove('hidden');
            } else {
                document.getElementById('infolens-modal-takeaways-box')?.classList.add('hidden');
            }
        }

        // 3. Connect Article CTA link (Optional - only shown when valid specific article URL is provided)
        if (modalArticleLink) {
            const articleUrl = (item.relatedArticleUrl || item.related_article_url || "").trim();
            const isBareDirectory = !articleUrl || articleUrl === "#" || articleUrl === "/news" || articleUrl === "/news/" || /^\/news\/[^\/]+\/?$/.test(articleUrl);
            if (articleUrl && !isBareDirectory) {
                modalArticleLink.href = articleUrl;
                modalArticleLink.style.display = "inline-flex";
            } else {
                modalArticleLink.style.display = "none";
            }
        }

        // 4. Reset "Read more" toggle to collapsed state on new open
        if (modalExpandable) modalExpandable.classList.remove('is-expanded');
        if (readmoreBtnText) readmoreBtnText.textContent = 'اس گرافک کے بارے میں مزید پڑھیں';
        if (readmoreBtnIcon) readmoreBtnIcon.className = 'fas fa-chevron-down';
        const modalReadmoreBtn = document.getElementById('infolens-modal-readmore-btn');
        if (modalReadmoreBtn) modalReadmoreBtn.setAttribute('aria-expanded', 'false');

        // 5. Reset pinch zoom transform
        resetPinchZoom();

        // 6. Populate Suggested Infographics below (Pinterest Cycle)
        renderSuggestedGrid(item.id);

        // 7. Show modal
        modalBackdrop.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        // 8. Smoothly scroll modal box back to top
        if (modalBox) {
            modalBox.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 9. Attach pinch gestures if not already attached
        setupPinchZoom();

        // 10. Update URL hash without page reload
        try {
            history.replaceState(null, null, `#${item.id}`);
        } catch(e) {}
    }

    function closeModal() {
        const modalBackdrop = document.getElementById('infolens-modal');
        if (!modalBackdrop) return;
        modalBackdrop.classList.remove('is-open');
        document.body.style.overflow = '';
        currentActivePin = null;
        resetPinchZoom();

        try {
            history.replaceState(null, null, window.location.pathname);
        } catch(e) {}
    }

    function shareCurrentPin(id) {
        const item = INFOLENS_DATA.find(x => x.id === id) || currentActivePin;
        if (!item) return;

        const shareUrl = `${window.location.origin}/infolens/#${item.id}`;
        if (navigator.share) {
            navigator.share({
                title: item.title,
                text: item.description,
                url: shareUrl
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('انفوگرافک کا لنک کاپی ہو گیا!');
            }).catch(() => {});
        }
    }

    // --- MAIN INITIALIZER ---
    function initInfolensPage() {
        const appContainer = document.getElementById('infolens-app');
        if (!appContainer || appContainer._infolensInitialized) return;
        appContainer._infolensInitialized = true;

        // 1. Initial Grid Render
        renderGrid();

        // 1b. Dynamic Sync with Consolidator JSON & D1 Edge Fallback
        let feedPage = 1;
        let isFetchingFeed = false;
        let feedReachedEnd = false;

        function fetchEdgeFeed(page) {
            if (isFetchingFeed || feedReachedEnd) return;
            isFetchingFeed = true;
            fetch(`/api/infolens/feed?lang=ur&page=${page}&limit=20`)
                .then(res => res.json())
                .then(data => {
                    isFetchingFeed = false;
                    if (data && Array.isArray(data.items) && data.items.length > 0) {
                        const existingIds = new Set(INFOLENS_DATA.map(x => x.id));
                        const newItems = data.items.filter(x => !existingIds.has(x.id));
                        if (newItems.length > 0) {
                            INFOLENS_DATA = INFOLENS_DATA.concat(newItems);
                            renderGrid();
                            if (currentActivePin) {
                                renderSuggestedGrid(currentActivePin.id);
                            }
                        }
                        if (data.items.length < (data.limit || 20)) {
                            feedReachedEnd = true;
                        }
                    } else {
                        feedReachedEnd = true;
                    }
                })
                .catch(() => {
                    isFetchingFeed = false;
                });
        }

        fetch('/infolens.json')
            .then(res => {
                if (!res.ok) throw new Error('Status ' + res.status);
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    INFOLENS_DATA = data;
                    renderGrid();
                    if (currentActivePin) {
                        renderSuggestedGrid(currentActivePin.id);
                    }
                } else {
                    fetchEdgeFeed(1);
                }
            })
            .catch(() => {
                fetchEdgeFeed(1);
            });

        // Infinite Scroll Listener for D1 Archive Infographics
        window.addEventListener('scroll', () => {
            if (feedReachedEnd || isFetchingFeed) return;
            if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 900)) {
                feedPage++;
                fetchEdgeFeed(feedPage);
            }
        }, { passive: true });

        // 2. Setup Category Pills Interaction
        const catContainer = document.getElementById('infolens-categories');
        if (catContainer) {
            catContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.infolens-cat-btn');
                if (!btn) return;

                catContainer.querySelectorAll('.infolens-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                currentCategory = btn.getAttribute('data-category') || 'all';
                renderGrid();
            });

            // Touch drag support for horizontal scroll
            let isDown = false;
            let startX, scrollLeft;
            catContainer.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - catContainer.offsetLeft;
                scrollLeft = catContainer.scrollLeft;
            });
            catContainer.addEventListener('mouseleave', () => { isDown = false; });
            catContainer.addEventListener('mouseup', () => { isDown = false; });
            catContainer.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - catContainer.offsetLeft;
                const walk = (x - startX) * 1.5;
                catContainer.scrollLeft = scrollLeft - walk;
            });
        }

        // 3. Setup Live Search Input
        const searchInput = document.getElementById('infolens-search');
        const clearBtn = document.getElementById('infolens-search-clear');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim();
                if (clearBtn) {
                    clearBtn.style.display = searchQuery.length > 0 ? 'flex' : 'none';
                }
                renderGrid();
            });
        }
        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                clearBtn.style.display = 'none';
                renderGrid();
                searchInput.focus();
            });
        }

        // 4. Delegate Main Grid Card Clicks (No Like, No Save, No Download)
        const grid = document.getElementById('infolens-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.infolens-card');
                if (card) {
                    const id = card.getAttribute('data-id');
                    if (id) openModal(id);
                }
            });
        }

        // 5. Setup Modal Event Handlers (Guarded Against Double Taps)
        let lastReadmoreToggleTime = 0;
        function toggleInfolensReadMore(e) {
            if (e) {
                if (typeof e.preventDefault === 'function') e.preventDefault();
                if (typeof e.stopPropagation === 'function') e.stopPropagation();
            }
            const now = Date.now();
            if (now - lastReadmoreToggleTime < 220) return;
            lastReadmoreToggleTime = now;

            const expandable = document.getElementById('infolens-modal-expandable');
            const btn = document.getElementById('infolens-modal-readmore-btn');
            const btnText = document.getElementById('infolens-readmore-text');
            const btnIcon = document.getElementById('infolens-readmore-icon');
            if (!expandable) return;

            const isExpanded = expandable.classList.toggle('is-expanded');
            if (btn) {
                btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            }
            if (btnText) {
                btnText.textContent = isExpanded ? 'کم تفصیلات دکھائیں' : 'اس گرافک کے بارے میں مزید پڑھیں';
            }
            if (btnIcon) {
                btnIcon.className = isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
            }
        }
        window.toggleInfolensReadMore = toggleInfolensReadMore;

        const modal = document.getElementById('infolens-modal');
        const modalBox = document.getElementById('infolens-modal-box');
        if (modal && !modal._eventsBound) {
            modal._eventsBound = true;

            // Close on backdrop click or close button click
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'infolens-modal' || e.target.closest('#infolens-modal-close')) {
                    closeModal();
                }
            });

            // "Read More" button toggle (Guarded against duplicate attachment)
            const readmoreBtn = document.getElementById('infolens-modal-readmore-btn');
            if (readmoreBtn && !readmoreBtn._readmoreBound) {
                readmoreBtn._readmoreBound = true;
                readmoreBtn.addEventListener('click', toggleInfolensReadMore);
            }

            // Share button inside modal
            const shareBtn = document.getElementById('infolens-modal-share-btn');
            if (shareBtn && !shareBtn._shareBound) {
                shareBtn._shareBound = true;
                shareBtn.addEventListener('click', () => {
                    if (currentActivePin) shareCurrentPin(currentActivePin.id);
                });
            }

            // Suggested Grid Card Clicks (Pinterest Infinite Cycle)
            if (modalBox && !modalBox._boxEventsBound) {
                modalBox._boxEventsBound = true;
                modalBox.addEventListener('click', (e) => {
                    if (e.target.closest('#infolens-modal-readmore-btn')) {
                        return;
                    }
                    const suggestedCard = e.target.closest('.infolens-suggested-card');
                    if (suggestedCard) {
                        e.stopPropagation();
                        const id = suggestedCard.getAttribute('data-id');
                        if (id) {
                            openModal(id);
                        }
                    }
                });
            }

            // Setup multi-touch pinch to zoom
            setupPinchZoom();
        }

        // 6. Keyboard navigation (ESC to close modal)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('infolens-modal')?.classList.contains('is-open')) {
                closeModal();
            }
        });

        // 7. Check for direct hash navigation (e.g. /infolens/#brics-vs-g7-gdp-2026)
        if (window.location.hash) {
            const hashId = window.location.hash.replace('#', '');
            if (hashId) {
                setTimeout(() => openModal(hashId), 200);
            }
        }
    }

    // Export to window for Turbo & global execution
    window.initInfolensPage = initInfolensPage;
    window.INFOLENS_DATA = INFOLENS_DATA;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInfolensPage);
    } else {
        initInfolensPage();
    }
    document.addEventListener('turbo:load', () => {
        const app = document.getElementById('infolens-app');
        if (app) {
            app._infolensInitialized = false;
            initInfolensPage();
        }
    });
})();
