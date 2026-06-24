require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const pool = require("./db");

// loremflickr.com — free, keyword-based, lock= makes it deterministic per product
const IMG = (keyword, lock) =>
  `https://loremflickr.com/400/400/${keyword}?lock=${lock}`;

const products = [
  // ── Smartphones ─────────────────────────────────────────────────────────────
  { name: "Apple iPhone 16 Pro Max",              price: 159900, stock: 50,  category: "Smartphones",    image_url: IMG("iphone",            1)  },
  { name: "Samsung Galaxy S25 Ultra",              price: 129999, stock: 45,  category: "Smartphones",    image_url: IMG("samsung,phone",     2)  },
  { name: "Google Pixel 9 Pro XL",                 price: 109999, stock: 60,  category: "Smartphones",    image_url: IMG("smartphone",        3)  },
  { name: "OnePlus 13",                             price: 69999,  stock: 80,  category: "Smartphones",    image_url: IMG("android,phone",     4)  },
  { name: "Nothing Phone (3)",                      price: 59999,  stock: 70,  category: "Smartphones",    image_url: IMG("phone,mobile",      5)  },
  { name: "Sony Xperia 1 VI",                       price: 89999,  stock: 35,  category: "Smartphones",    image_url: IMG("sony,phone",        6)  },
  { name: "Motorola Edge 50 Pro",                   price: 31999,  stock: 90,  category: "Smartphones",    image_url: IMG("motorola",          7)  },
  { name: "ASUS ROG Phone 9",                       price: 79999,  stock: 30,  category: "Smartphones",    image_url: IMG("gaming,phone",      8)  },
  { name: "Xiaomi 15 Ultra",                        price: 89999,  stock: 40,  category: "Smartphones",    image_url: IMG("xiaomi,phone",      9)  },
  { name: "Vivo X200 Pro",                          price: 64999,  stock: 45,  category: "Smartphones",    image_url: IMG("smartphone,camera", 10) },

  // ── Laptops ──────────────────────────────────────────────────────────────────
  { name: "Apple MacBook Pro 16\" M4 Pro",         price: 249900, stock: 25,  category: "Laptops",        image_url: IMG("macbook",           11) },
  { name: "Apple MacBook Air 15\" M3",             price: 134900, stock: 40,  category: "Laptops",        image_url: IMG("laptop,apple",      12) },
  { name: "Dell XPS 15 (2025)",                    price: 189990, stock: 30,  category: "Laptops",        image_url: IMG("laptop,dell",       13) },
  { name: "ASUS ROG Zephyrus G16",                 price: 179990, stock: 20,  category: "Laptops",        image_url: IMG("gaming,laptop",     14) },
  { name: "HP Spectre x360 14",                    price: 149990, stock: 35,  category: "Laptops",        image_url: IMG("laptop,hp",         15) },
  { name: "Lenovo ThinkPad X1 Carbon Gen 12",      price: 169990, stock: 28,  category: "Laptops",        image_url: IMG("thinkpad,laptop",   16) },
  { name: "Microsoft Surface Laptop 7",            price: 129990, stock: 40,  category: "Laptops",        image_url: IMG("laptop,microsoft",  17) },
  { name: "Razer Blade 16 (2025)",                 price: 279990, stock: 15,  category: "Laptops",        image_url: IMG("razer,laptop",      18) },
  { name: "Acer Swift Go 16",                       price: 89990,  stock: 50,  category: "Laptops",        image_url: IMG("laptop,slim",       19) },

  // ── Audio ────────────────────────────────────────────────────────────────────
  { name: "Apple AirPods Pro (3rd Gen)",            price: 24900,  stock: 120, category: "Audio",          image_url: IMG("airpods",           20) },
  { name: "Sony WH-1000XM6",                        price: 34990,  stock: 85,  category: "Audio",          image_url: IMG("headphones",        21) },
  { name: "Bose QuietComfort Ultra Headphones",     price: 39990,  stock: 70,  category: "Audio",          image_url: IMG("headphones,bose",   22) },
  { name: "Samsung Galaxy Buds3 Pro",               price: 19990,  stock: 100, category: "Audio",          image_url: IMG("earbuds",           23) },
  { name: "JBL Charge 6",                           price: 14999,  stock: 95,  category: "Audio",          image_url: IMG("speaker,bluetooth", 24) },
  { name: "Sennheiser Momentum 4 Wireless",         price: 29990,  stock: 60,  category: "Audio",          image_url: IMG("headphones,music",  25) },
  { name: "Apple AirPods Max (USB-C)",              price: 54900,  stock: 45,  category: "Audio",          image_url: IMG("headphones,apple",  26) },
  { name: "Sony WF-1000XM5",                        price: 24990,  stock: 75,  category: "Audio",          image_url: IMG("earbuds,wireless",  27) },

  // ── Tablets ──────────────────────────────────────────────────────────────────
  { name: "Apple iPad Pro 13\" M4",                price: 119900, stock: 35,  category: "Tablets",        image_url: IMG("ipad",              28) },
  { name: "Apple iPad Air 11\" M2",                price: 59900,  stock: 60,  category: "Tablets",        image_url: IMG("tablet,apple",      29) },
  { name: "Samsung Galaxy Tab S10 Ultra",           price: 108999, stock: 40,  category: "Tablets",        image_url: IMG("samsung,tablet",    30) },
  { name: "Amazon Fire HD 10 (2025)",               price: 14999,  stock: 200, category: "Tablets",        image_url: IMG("tablet,amazon",     31) },
  { name: "Microsoft Surface Pro 11",               price: 159990, stock: 25,  category: "Tablets",        image_url: IMG("tablet,microsoft",  32) },

  // ── Smart Home ───────────────────────────────────────────────────────────────
  { name: "Amazon Echo Dot (5th Gen)",              price: 4499,   stock: 300, category: "Smart Home",     image_url: IMG("alexa,echo",        33) },
  { name: "Amazon Echo Show 10 (3rd Gen)",          price: 22999,  stock: 75,  category: "Smart Home",     image_url: IMG("smart,speaker",     34) },
  { name: "Ring Video Doorbell Pro 2",              price: 24999,  stock: 80,  category: "Smart Home",     image_url: IMG("doorbell,security", 35) },
  { name: "Google Nest Learning Thermostat",        price: 22999,  stock: 65,  category: "Smart Home",     image_url: IMG("thermostat,smart",  36) },
  { name: "Philips Hue White & Color Starter Kit",  price: 17999,  stock: 90,  category: "Smart Home",     image_url: IMG("smart,bulb",        37) },

  // ── Monitors & TVs ───────────────────────────────────────────────────────────
  { name: "LG 27\" 4K UHD IPS Monitor",            price: 42990,  stock: 55,  category: "Monitors & TVs", image_url: IMG("monitor,display",   38) },
  { name: "Samsung 65\" QLED 4K Smart TV",         price: 114990, stock: 30,  category: "Monitors & TVs", image_url: IMG("television,samsung",39) },
  { name: "Sony BRAVIA 55\" OLED 4K TV",           price: 149990, stock: 20,  category: "Monitors & TVs", image_url: IMG("tv,oled",           40) },
  { name: "ASUS ROG Swift 32\" OLED Monitor",      price: 89990,  stock: 25,  category: "Monitors & TVs", image_url: IMG("gaming,monitor",    41) },

  // ── Home & Kitchen ───────────────────────────────────────────────────────────
  { name: "Instant Pot Duo 7-in-1 (8 Qt)",         price: 7999,   stock: 150, category: "Home & Kitchen", image_url: IMG("cooking,pot",       42) },
  { name: "Ninja AF161 Max XL Air Fryer",           price: 9999,   stock: 130, category: "Home & Kitchen", image_url: IMG("airfryer,cooking",  43) },
  { name: "KitchenAid Artisan Series Stand Mixer",  price: 44999,  stock: 55,  category: "Home & Kitchen", image_url: IMG("kitchenaid,mixer",  44) },
  { name: "Nespresso Vertuo Plus Coffee Maker",     price: 17999,  stock: 85,  category: "Home & Kitchen", image_url: IMG("coffee,espresso",   45) },
  { name: "Dyson V15 Detect Absolute",              price: 64990,  stock: 40,  category: "Home & Kitchen", image_url: IMG("vacuum,dyson",      46) },
  { name: "Breville Smart Oven Air Fryer Pro",      price: 37999,  stock: 50,  category: "Home & Kitchen", image_url: IMG("oven,kitchen",      47) },
  { name: "Vitamix 5200 Blender",                   price: 49999,  stock: 45,  category: "Home & Kitchen", image_url: IMG("blender,kitchen",   48) },

  // ── Books ────────────────────────────────────────────────────────────────────
  { name: "Atomic Habits – James Clear",            price: 399,    stock: 500, category: "Books",          image_url: IMG("book,reading",      49) },
  { name: "The Psychology of Money – Morgan Housel",price: 349,    stock: 450, category: "Books",          image_url: IMG("book,finance",      50) },
  { name: "Sapiens – Yuval Noah Harari",            price: 399,    stock: 400, category: "Books",          image_url: IMG("book,history",      51) },
  { name: "Zero to One – Peter Thiel",              price: 349,    stock: 380, category: "Books",          image_url: IMG("book,startup",      52) },
  { name: "Deep Work – Cal Newport",                price: 399,    stock: 420, category: "Books",          image_url: IMG("book,work",         53) },
  { name: "The Lean Startup – Eric Ries",           price: 449,    stock: 350, category: "Books",          image_url: IMG("book,business",     54) },
  { name: "Ikigai – Héctor García",                 price: 299,    stock: 460, category: "Books",          image_url: IMG("book,japan",        55) },
  { name: "Rich Dad Poor Dad – Robert Kiyosaki",    price: 299,    stock: 500, category: "Books",          image_url: IMG("book,money",        56) },

  // ── Sports & Fitness ─────────────────────────────────────────────────────────
  { name: "Apple Watch Series 10 (GPS 46mm)",      price: 46900,  stock: 90,  category: "Sports & Fitness", image_url: IMG("smartwatch,apple",  57) },
  { name: "Fitbit Charge 6",                        price: 14999,  stock: 110, category: "Sports & Fitness", image_url: IMG("fitness,tracker",   58) },
  { name: "Garmin Forerunner 965",                  price: 64990,  stock: 50,  category: "Sports & Fitness", image_url: IMG("running,watch",     59) },
  { name: "Bowflex SelectTech 552 Dumbbells",      price: 42999,  stock: 35,  category: "Sports & Fitness", image_url: IMG("dumbbells,gym",     60) },
  { name: "Manduka PRO Yoga Mat",                   price: 13999,  stock: 120, category: "Sports & Fitness", image_url: IMG("yoga,mat",          61) },
  { name: "Theragun Prime Massage Gun",             price: 29990,  stock: 65,  category: "Sports & Fitness", image_url: IMG("massage,gym",       62) },
  { name: "Peloton Bike+",                          price: 249990, stock: 15,  category: "Sports & Fitness", image_url: IMG("cycling,exercise",  63) },

  // ── Beauty & Personal Care ────────────────────────────────────────────────────
  { name: "Dyson Airwrap Complete Styler",          price: 54900,  stock: 45,  category: "Beauty",         image_url: IMG("hair,styling",      64) },
  { name: "CeraVe Moisturizing Cream (19 oz)",      price: 1899,   stock: 500, category: "Beauty",         image_url: IMG("skincare,cream",    65) },
  { name: "The Ordinary Niacinamide 10% + Zinc 1%", price: 699,   stock: 600, category: "Beauty",         image_url: IMG("serum,skincare",    66) },
  { name: "Olay Regenerist Micro-Sculpting Cream",  price: 2999,   stock: 350, category: "Beauty",         image_url: IMG("cream,antiaging",   67) },
  { name: "Neutrogena Hydro Boost Gel-Cream",       price: 1999,   stock: 400, category: "Beauty",         image_url: IMG("skincare,beauty",   68) },
  { name: "Philips Norelco 9000 Prestige Shaver",   price: 31990,  stock: 60,  category: "Beauty",         image_url: IMG("shaving,razor",     69) },

  // ── Gaming ───────────────────────────────────────────────────────────────────
  { name: "Sony PlayStation 5 Slim",                price: 54990,  stock: 30,  category: "Gaming",         image_url: IMG("playstation,gaming",70) },
  { name: "Microsoft Xbox Series X",                price: 52990,  stock: 28,  category: "Gaming",         image_url: IMG("xbox,gaming",       71) },
  { name: "Nintendo Switch OLED Model",             price: 34999,  stock: 75,  category: "Gaming",         image_url: IMG("nintendo,gaming",   72) },
  { name: "Razer DeathAdder V3 HyperSpeed",         price: 14990,  stock: 80,  category: "Gaming",         image_url: IMG("gaming,mouse",      73) },
  { name: "SteelSeries Arctis Nova Pro Wireless",   price: 29990,  stock: 55,  category: "Gaming",         image_url: IMG("headset,gaming",    74) },
  { name: "ASUS ROG Ally X Gaming Handheld",        price: 79990,  stock: 35,  category: "Gaming",         image_url: IMG("gaming,handheld",   75) },

  // ── Fashion ──────────────────────────────────────────────────────────────────
  { name: "Levi's 501 Original Fit Jeans",          price: 5999,   stock: 200, category: "Fashion",        image_url: IMG("jeans,denim",       76) },
  { name: "Nike Air Force 1 '07",                   price: 9995,   stock: 180, category: "Fashion",        image_url: IMG("sneakers,nike",     77) },
  { name: "The North Face Thermoball Eco Jacket",   price: 19995,  stock: 90,  category: "Fashion",        image_url: IMG("jacket,outdoor",    78) },
  { name: "Adidas Ultraboost 22 Running Shoes",     price: 17999,  stock: 150, category: "Fashion",        image_url: IMG("shoes,running",     79) },
  { name: "Ray-Ban Aviator Classic Sunglasses",     price: 14990,  stock: 120, category: "Fashion",        image_url: IMG("sunglasses",        80) },
  { name: "Rolex Submariner Date 41mm",              price: 985000, stock: 5,   category: "Fashion",        image_url: IMG("watch,luxury",      81) },
  { name: "Louis Vuitton Neverfull MM Tote",         price: 179000, stock: 10,  category: "Fashion",        image_url: IMG("handbag,luxury",    82) },

  // ── Cameras & Drones ─────────────────────────────────────────────────────────
  { name: "Sony Alpha 7 IV Full-Frame Camera",      price: 249990, stock: 20,  category: "Cameras",        image_url: IMG("camera,mirrorless", 83) },
  { name: "Canon EOS R6 Mark II",                   price: 229990, stock: 18,  category: "Cameras",        image_url: IMG("camera,canon",      84) },
  { name: "GoPro HERO13 Black",                     price: 39990,  stock: 65,  category: "Cameras",        image_url: IMG("gopro,action",      85) },
  { name: "DJI Pocket 3 Creator Combo",             price: 49990,  stock: 55,  category: "Cameras",        image_url: IMG("camera,gimbal",     86) },
  { name: "DJI Mini 4 Pro Drone",                   price: 74900,  stock: 40,  category: "Cameras",        image_url: IMG("drone,aerial",      87) },

  // ── Office & Peripherals ─────────────────────────────────────────────────────
  { name: "Logitech MX Master 3S Mouse",            price: 9995,   stock: 150, category: "Office",         image_url: IMG("mouse,computer",    88) },
  { name: "Apple Magic Keyboard with Touch ID",     price: 9500,   stock: 130, category: "Office",         image_url: IMG("keyboard,apple",    89) },
  { name: "Anker 65W USB-C Charger (Nano Pro)",     price: 4999,   stock: 200, category: "Office",         image_url: IMG("charger,usb",       90) },
  { name: "Secretlab TITAN Evo Gaming Chair",       price: 54990,  stock: 30,  category: "Office",         image_url: IMG("chair,gaming",      91) },
  { name: "Keychron Q1 Pro Mechanical Keyboard",    price: 19990,  stock: 70,  category: "Office",         image_url: IMG("keyboard,mechanical",92) },
];

// Descriptions kept in a separate map to keep the product list readable
const descriptions = {
  "Apple iPhone 16 Pro Max": "6.9\" Super Retina XDR, A18 Pro chip, 48MP Fusion triple camera, titanium design, Action Button, USB-C, up to 33h video playback.",
  "Samsung Galaxy S25 Ultra": "6.9\" QHD+ Dynamic AMOLED 2X 120Hz, Snapdragon 8 Elite, 200MP camera, built-in S Pen, 5000mAh, 45W charging.",
  "Google Pixel 9 Pro XL": "6.8\" LTPO OLED, Google Tensor G4, 50MP main camera, 7 years of OS & security updates, Gemini AI assistant built-in.",
  "OnePlus 13": "6.82\" 2K ProXDR AMOLED 120Hz, Snapdragon 8 Elite, Hasselblad triple camera, 100W SUPERVOOC charging, 6000mAh battery.",
  "Nothing Phone (3)": "6.7\" LTPO OLED 120Hz, Snapdragon 8s Gen 4, Glyph Interface 2.0, 50MP dual camera, clean Android, 3-year OS updates.",
  "Sony Xperia 1 VI": "6.5\" 4K HDR OLED, Snapdragon 8 Gen 3, Zeiss optics, 85–170mm optical zoom, 3.5mm headphone jack, 5000mAh.",
  "Motorola Edge 50 Pro": "6.7\" pOLED 144Hz display, Snapdragon 7 Gen 3, 50MP OIS camera, 125W TurboPower wired charging, vegan leather back.",
  "ASUS ROG Phone 9": "6.78\" AMOLED 165Hz, Snapdragon 8 Elite, 50MP Sony IMX890 camera, 6000mAh, AeroActive Cooler 9, gaming triggers.",
  "Xiaomi 15 Ultra": "6.73\" LTPO OLED, Snapdragon 8 Elite, Leica quad camera with 200MP periscope, 90W wireless charging, IP68.",
  "Vivo X200 Pro": "6.78\" LTPO AMOLED 120Hz, Dimensity 9400, Zeiss triple camera, 6000mAh, 90W wired + 30W wireless, IP69.",
  "Apple MacBook Pro 16\" M4 Pro": "16\" Liquid Retina XDR, M4 Pro chip, 24GB unified RAM, 512GB SSD, MagSafe 3, up to 24h battery life.",
  "Apple MacBook Air 15\" M3": "15.3\" Liquid Retina display, M3 chip, 8GB RAM, 256GB SSD, fanless design, MagSafe, 1080p FaceTime camera.",
  "Dell XPS 15 (2025)": "15.6\" OLED 3.5K touch display, Intel Core Ultra 9, NVIDIA RTX 4070, 32GB DDR5, 1TB PCIe 4.0 NVMe SSD.",
  "ASUS ROG Zephyrus G16": "16\" QHD+ 240Hz ROG Nebula OLED, AMD Ryzen 9 HX, RTX 4090, 32GB DDR5, MUX Switch, per-key RGB.",
  "HP Spectre x360 14": "14\" 2.8K OLED touch 120Hz, Intel Core Ultra 7, Intel Arc graphics, 32GB LPDDR5, 1TB SSD, 360° convertible.",
  "Lenovo ThinkPad X1 Carbon Gen 12": "14\" 2.8K IPS, Intel Core Ultra 7, 32GB RAM, 1TB SSD, under 1.12kg, MIL-SPEC durability, 4x Thunderbolt 4.",
  "Microsoft Surface Laptop 7": "15\" PixelSense touchscreen, Snapdragon X Elite, 32GB RAM, 1TB SSD, Copilot+ PC, all-day battery, Wi-Fi 7.",
  "Razer Blade 16 (2025)": "16\" QHD+ 240Hz OLED, Intel Core i9 HX, RTX 4090, 32GB DDR5, 2TB SSD, CNC aluminum, vapor chamber cooling.",
  "Acer Swift Go 16": "16\" 3.2K OLED, Intel Core Ultra 5, 16GB LPDDR5x, 512GB SSD, 1.64kg, Wi-Fi 6E, AI-assisted performance.",
  "Apple AirPods Pro (3rd Gen)": "Active Noise Cancellation, Transparency mode, Adaptive Audio, H2 chip, Conversation Awareness, 30h total with case.",
  "Sony WH-1000XM6": "Industry-leading ANC, 30h battery, multipoint connection, speak-to-chat, Hi-Res Audio, LDAC codec support.",
  "Bose QuietComfort Ultra Headphones": "Bose spatial audio, CustomTune technology, 24h battery, soft leather earcups, premium acoustic performance.",
  "Samsung Galaxy Buds3 Pro": "3-mic ANC, Intelligent ANC, Dolby Head Tracking, IPX7, 30h total battery, earbud wings for secure fit.",
  "JBL Charge 6": "360° sound, 40h playtime, IP67 waterproof, built-in 20W power bank, PartyBoost for multi-speaker pairing.",
  "Sennheiser Momentum 4 Wireless": "60h battery life (industry record), Adaptive ANC, audiophile-grade 42mm transducers, folding design.",
  "Apple AirPods Max (USB-C)": "40mm dynamic drivers, computational audio, Active Noise Cancellation, Transparency mode, 20h battery, H1 chip.",
  "Sony WF-1000XM5": "World's smallest and lightest premium ANC earbuds, 8h + 16h battery, multipoint, Hi-Res Audio Wireless.",
  "Apple iPad Pro 13\" M4": "Ultra Retina XDR tandem OLED, M4 chip, Apple Pencil Pro, Thunderbolt 4, Wi-Fi 6E, nano-texture glass option.",
  "Apple iPad Air 11\" M2": "11\" Liquid Retina display, M2 chip, USB-C, Apple Pencil (2nd gen) and Magic Keyboard support, 10h battery.",
  "Samsung Galaxy Tab S10 Ultra": "14.6\" Dynamic AMOLED 2X 120Hz, Snapdragon 8 Gen 3, S Pen included, 11200mAh, 45W fast charging, DeX mode.",
  "Amazon Fire HD 10 (2025)": "10.1\" 1080p display, octa-core 2.0GHz, 3GB RAM, 32GB storage, Alexa built-in, USB-C, 12h battery.",
  "Microsoft Surface Pro 11": "13\" PixelSense Flow touch 120Hz, Snapdragon X Plus, 16GB RAM, 256GB SSD, Copilot+ PC, foldable kickstand.",
  "Amazon Echo Dot (5th Gen)": "Compact smart speaker with Alexa, improved bass, temperature sensor, eero Wi-Fi built-in, LED display ring.",
  "Amazon Echo Show 10 (3rd Gen)": "10.1\" HD screen that moves with you, 13MP camera, premium speakers, Zigbee hub, Alexa video calling.",
  "Ring Video Doorbell Pro 2": "1536p HD head-to-toe video, 3D Motion Detection, advanced Pre-Roll, color night vision, works with Alexa.",
  "Google Nest Learning Thermostat": "Programs itself in a week, remote control, Energy History, works with most HVAC systems, ENERGY STAR certified.",
  "Philips Hue White & Color Starter Kit": "4 smart A19 bulbs + Bridge, 16 million colors, works with Alexa/Google/HomeKit, schedules, scenes, routines.",
  "LG 27\" 4K UHD IPS Monitor": "27\" 4K UHD (3840×2160), IPS panel, 144Hz, HDR600, USB-C 90W, height-adjustable stand, FreeSync Premium.",
  "Samsung 65\" QLED 4K Smart TV": "65\" QLED 4K 120Hz, Quantum HDR, Object Tracking Sound, Alexa/Google/SmartThings built-in, Gaming Hub.",
  "Sony BRAVIA 55\" OLED 4K TV": "55\" OLED 4K 120Hz, XR Cognitive Processor, Acoustic Surface Audio, Google TV, HDMI 2.1, PS5 features.",
  "ASUS ROG Swift 32\" OLED Monitor": "32\" 4K OLED 240Hz, 0.03ms response, DisplayHDR True Black 400, USB-C 90W, G-Sync compatible.",
  "Instant Pot Duo 7-in-1 (8 Qt)": "Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker & warmer. 8-quart stainless steel.",
  "Ninja AF161 Max XL Air Fryer": "5.5-quart, 400°F max, 7 cooking programs, cooks 3 lbs of food, dishwasher-safe basket, no preheat needed.",
  "KitchenAid Artisan Series Stand Mixer": "5-quart stainless bowl, 10 speeds, tilt-head design, includes flat beater, dough hook & wire whip.",
  "Nespresso Vertuo Plus Coffee Maker": "Centrifusion technology, 5 cup sizes (espresso to alto), 30s heat-up, auto capsule ejection, 17oz tank.",
  "Dyson V15 Detect Absolute": "Laser dust detection, LCD particle count display, 60-min runtime, HEPA filtration, 240AW suction.",
  "Breville Smart Oven Air Fryer Pro": "13-in-1 countertop oven: bake, broil, toast, air fry, roast, dehydrate. Element IQ, super convection, 1800W.",
  "Vitamix 5200 Blender": "Variable speed control, aircraft-grade stainless steel blades, 64oz container, self-cleaning in 60 seconds, 7-year warranty.",
  "Atomic Habits – James Clear": "#1 NYT bestseller. Tiny changes, remarkable results. The definitive guide to building good habits and breaking bad ones.",
  "The Psychology of Money – Morgan Housel": "19 timeless lessons on wealth, greed, and happiness. How people think about money in strange, illogical ways.",
  "Sapiens – Yuval Noah Harari": "A Brief History of Humankind. How Homo sapiens came to rule the world from the Stone Age to Silicon Valley.",
  "Zero to One – Peter Thiel": "Notes on Startups or How to Build the Future. Thiel's contrarian framework for creating businesses that matter.",
  "Deep Work – Cal Newport": "Rules for Focused Success in a Distracted World. How to develop the ability to perform cognitively demanding tasks.",
  "The Lean Startup – Eric Ries": "How entrepreneurs use continuous innovation to build radically successful businesses. The Build-Measure-Learn loop.",
  "Ikigai – Héctor García": "The Japanese secret to a long and happy life. Find your purpose where passion, mission, vocation and profession meet.",
  "Rich Dad Poor Dad – Robert Kiyosaki": "What the rich teach their kids about money that the poor and middle class do not. #1 personal finance book of all time.",
  "Apple Watch Series 10 (GPS 46mm)": "Thinnest Apple Watch ever, always-on Retina display, sleep apnea detection, ECG, crash detection, 18h battery.",
  "Fitbit Charge 6": "Built-in GPS, Google Maps & Wallet, 7-day battery, EDA stress sensor, 40+ exercise modes, SpO2, heart rate.",
  "Garmin Forerunner 965": "AMOLED display, advanced running metrics, Training Readiness, daily health stats, 31-day battery in smartwatch mode.",
  "Bowflex SelectTech 552 Dumbbells": "Adjusts from 5 to 52.5 lbs in 2.5-lb increments, replaces 15 sets of weights, quick dial selector, 2-year warranty.",
  "Manduka PRO Yoga Mat": "6mm thick, 71-inch, ultra-dense cushioning, closed-cell surface, alignment lines, lifetime guarantee.",
  "Theragun Prime Massage Gun": "5 built-in speeds (1750–2400PPM), QuietForce Technology, 16mm amplitude, 4 attachments, 120-min battery.",
  "Peloton Bike+": "24\" rotating HD touchscreen, auto-resistance with Peloton instructors, Apple GymKit, real-time metrics, live classes.",
  "Dyson Airwrap Complete Styler": "Styles and dries simultaneously using Coanda airflow — no extreme heat. 6 attachments for all hair types.",
  "CeraVe Moisturizing Cream (19 oz)": "Dry to very dry skin, 3 essential ceramides + hyaluronic acid, fragrance-free, non-comedogenic.",
  "The Ordinary Niacinamide 10% + Zinc 1%": "High-strength vitamin B3 formula. Reduces pore appearance, controls sebum, evens skin tone. Vegan, cruelty-free.",
  "Olay Regenerist Micro-Sculpting Cream": "Advanced anti-aging with amino-peptide complex + hyaluronic acid, visibly firms and plumps skin in 28 days.",
  "Neutrogena Hydro Boost Gel-Cream": "Hyaluronic acid gel-cream, absorbs quickly, oil-free, non-comedogenic, fragrance-free, dermatologist tested.",
  "Philips Norelco 9000 Prestige Shaver": "SenseIQ technology, V-Track PRO blades, 8-direction contouring, 60-min runtime, premium leather case.",
  "Sony PlayStation 5 Slim": "PS5 Slim, 1TB SSD, 4K gaming, ray tracing, 120fps, DualSense haptic feedback + adaptive triggers.",
  "Microsoft Xbox Series X": "12 teraflops GPU, 1TB NVMe SSD, 4K 120fps, Quick Resume, Smart Delivery, backward compatible.",
  "Nintendo Switch OLED Model": "7\" OLED screen, enhanced audio, 64GB storage, adjustable stand, wired LAN port in dock, TV and handheld modes.",
  "Razer DeathAdder V3 HyperSpeed": "Ultra-lightweight 63g ergonomic wireless mouse, 26K Focus Pro sensor, 90-hour battery, HyperSpeed 2.4GHz.",
  "SteelSeries Arctis Nova Pro Wireless": "Hi-Fi gaming audio, dual wireless + Bluetooth 5.0, ANC, 22h battery, modular design, multipoint connect.",
  "ASUS ROG Ally X Gaming Handheld": "7\" FHD 120Hz, AMD Ryzen Z1 Extreme, 24GB RAM, 1TB SSD, 80Wh battery, full Windows 11.",
  "Levi's 501 Original Fit Jeans": "The original straight fit since 1873. Button fly, 100% cotton denim, sits at waist, straight through hip and thigh.",
  "Nike Air Force 1 '07": "Iconic basketball silhouette since 1982. Genuine leather upper, full-length Air unit, durable rubber outsole.",
  "The North Face Thermoball Eco Jacket": "Packable synthetic insulation, water-resistant DWR finish, stuffs into its own pocket.",
  "Adidas Ultraboost 22 Running Shoes": "Responsive BOOST midsole, Primeknit+ upper, Continental rubber outsole, Linear Energy Push, 4D heel frame.",
  "Ray-Ban Aviator Classic Sunglasses": "Iconic teardrop shape since 1937, crystal glass lenses, 100% UV protection, spring hinges, gold metal frame.",
  "Rolex Submariner Date 41mm": "Swiss luxury dive watch, 300m water resistance, perpetual rotor movement, Oystersteel case, Cerachrom bezel.",
  "Louis Vuitton Neverfull MM Tote": "Monogram canvas, removable zip pouch, flexible sides for extra capacity, two handles, iconic LV print.",
  "Sony Alpha 7 IV Full-Frame Camera": "33MP BSI CMOS, BIONZ XR, 4K 60p, real-time Eye AF, 5-axis IBIS, dual CFexpress + UHS-II SD card slots.",
  "Canon EOS R6 Mark II": "24.2MP full-frame CMOS, DIGIC X, 4K 60p RAW, 40fps electronic shutter, subject tracking AI, 5-axis IBIS.",
  "GoPro HERO13 Black": "5.3K60 video, HyperSmooth 6.0 stabilization, Enduro battery, HDR video, waterproof to 33ft, 10-bit color.",
  "DJI Pocket 3 Creator Combo": "1-inch CMOS, 4K 120fps, 3-axis stabilization, OLED touchscreen, subject tracking, built-in mic, 166-min battery.",
  "DJI Mini 4 Pro Drone": "4K/60fps with 10-bit D-Log M, omnidirectional obstacle sensing, 34-min flight time, 20km video transmission.",
  "Logitech MX Master 3S Mouse": "8000 DPI optical tracking on any surface including glass, MagSpeed scroll, 70-day battery, Bluetooth + USB.",
  "Apple Magic Keyboard with Touch ID": "Scissor mechanism keys, Touch ID for Mac, rechargeable via Lightning, connects via Bluetooth, US English layout.",
  "Anker 65W USB-C Charger (Nano Pro)": "4-port (2x USB-C + 2x USB-A), GaN technology, foldable plug, charges MacBook/iPhone/iPad simultaneously.",
  "Secretlab TITAN Evo Gaming Chair": "Lumbar support system, 4-way adjustable armrests, magnetic memory foam head pillow, reclines 85–165°.",
  "Keychron Q1 Pro Mechanical Keyboard": "75% layout, QMK/Via programmable, Gateron G Pro switches, gasket mount, aluminum body, Bluetooth + wired.",
};

async function seed() {
  console.log("Clearing existing products…");
  await pool.query("DELETE FROM products");
  await pool.query("ALTER SEQUENCE products_id_seq RESTART WITH 1");

  console.log(`Inserting ${products.length} products…`);
  let inserted = 0;
  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, description, price, stock, category, image_url)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [p.name, descriptions[p.name] || "", p.price, p.stock, p.category, p.image_url]
    );
    inserted++;
    process.stdout.write(`\r  ${inserted}/${products.length}`);
  }
  const cats = [...new Set(products.map(p => p.category))].length;
  console.log(`\nDone! ${inserted} products across ${cats} categories.`);
  process.exit(0);
}

seed().catch((err) => { console.error(err.message); process.exit(1); });
