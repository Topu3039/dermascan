/* =========================================================
   DermaScan — client-side app
   - 5 languages
   - camera / upload capture
   - Claude vision analysis (user supplies their own API key,
     stored only in this browser's localStorage)
   - fixed, translated natural-remedy knowledge base
   ========================================================= */

const APP_URL = window.location.href;

/* ---------------- 1. ISSUE KNOWLEDGE BASE ---------------- */
/* Each issue has: label, short description, remedy — per language.
   The model only ever returns issue KEYS; all user-facing text
   for causes/remedies comes from this fixed, reviewed table. */
const ISSUES = {
  oily_skin: {
    en:{name:"Oily skin",desc:"Excess oil, especially across the T-zone.",remedy:"Wash face with a gentle cleanser twice a day. Once or twice a week, use a Multani mitti (Fuller's earth) + rose water mask."},
    bn:{name:"তৈলাক্ত ত্বক",desc:"বিশেষত T-zone-এ অতিরিক্ত তেল।",remedy:"দিনে ২ বার হালকা ফেসওয়াশ ব্যবহার করো। সপ্তাহে ১–২ বার মুলতানি মাটি + গোলাপ জলের মাস্ক দাও।"},
    hi:{name:"ऑयली त्वचा",desc:"खासकर T-zone में अतिरिक्त तेल।",remedy:"दिन में 2 बार हल्के फेसवॉश से चेहरा धोएं। सप्ताह में 1-2 बार मुल्तानी मिट्टी + गुलाब जल का मास्क लगाएं।"},
    de:{name:"Fettige Haut",desc:"Übermäßiger Glanz, besonders in der T-Zone.",remedy:"Zweimal täglich mit einem milden Reinigungsmittel waschen. 1–2 Mal pro Woche eine Maske aus Multani-Mitti (Fullererde) und Rosenwasser auftragen."},
    fr:{name:"Peau grasse",desc:"Excès de sébum, surtout sur la zone T.",remedy:"Lavez le visage avec un nettoyant doux deux fois par jour. Une à deux fois par semaine, appliquez un masque à la terre de Fuller (Multani mitti) et à l'eau de rose."}
  },
  acne:{
    en:{name:"Acne",desc:"Active breakouts and inflamed spots.",remedy:"Apply pure aloe vera gel. Reduce oily and fried foods."},
    bn:{name:"ব্রণ",desc:"সক্রিয় ব্রণ ও লালচে ফোলাভাব।",remedy:"খাঁটি অ্যালোভেরা জেল লাগাও। অতিরিক্ত তেলযুক্ত খাবার কমাও।"},
    hi:{name:"मुंहासे",desc:"सक्रिय ब्रेकआउट और सूजन वाले दाने।",remedy:"शुद्ध एलोवेरा जेल लगाएं। तैलीय और तले हुए भोजन कम करें।"},
    de:{name:"Akne",desc:"Aktive Pickel und entzündete Stellen.",remedy:"Reines Aloe-vera-Gel auftragen. Fettiges und frittiertes Essen reduzieren."},
    fr:{name:"Acné",desc:"Boutons actifs et zones enflammées.",remedy:"Appliquez du gel d'aloe vera pur. Réduisez les aliments gras et frits."}
  },
  acne_scars:{
    en:{name:"Acne scars",desc:"Marks left behind after breakouts heal.",remedy:"Apply aloe vera gel daily. Eat vitamin-C rich foods like orange and amla."},
    bn:{name:"ব্রণের দাগ",desc:"ব্রণ সেরে যাওয়ার পরেও থেকে যাওয়া দাগ।",remedy:"প্রতিদিন অ্যালোভেরা জেল লাগাও। ভিটামিন C সমৃদ্ধ খাবার (কমলা, আমলকি) খাও।"},
    hi:{name:"मुंहासों के दाग",desc:"मुंहासे ठीक होने के बाद रह जाने वाले निशान।",remedy:"रोज़ एलोवेरा जेल लगाएं। संतरा, आंवला जैसे विटामिन-C युक्त भोजन खाएं।"},
    de:{name:"Aknenarben",desc:"Male, die nach abgeheilten Pickeln zurückbleiben.",remedy:"Täglich Aloe-vera-Gel auftragen. Vitamin-C-reiche Lebensmittel wie Orangen und Amla essen."},
    fr:{name:"Cicatrices d'acné",desc:"Marques laissées après la guérison des boutons.",remedy:"Appliquez du gel d'aloe vera chaque jour. Mangez des aliments riches en vitamine C (orange, amla)."}
  },
  blackheads:{
    en:{name:"Blackheads & whiteheads",desc:"Clogged pores with dark or white tips.",remedy:"Once a week, gently scrub with oats + yogurt."},
    bn:{name:"ব্ল্যাকহেডস ও হোয়াইটহেডস",desc:"বন্ধ হয়ে যাওয়া পোরে কালচে বা সাদা বিন্দু।",remedy:"সপ্তাহে ১ বার ওটস + দই দিয়ে হালকা স্ক্রাব করো।"},
    hi:{name:"ब्लैकहेड्स और व्हाइटहेड्स",desc:"बंद रोमछिद्रों में काले या सफेद निशान।",remedy:"सप्ताह में एक बार ओट्स + दही से हल्का स्क्रब करें।"},
    de:{name:"Mitesser",desc:"Verstopfte Poren mit dunklen oder weißen Spitzen.",remedy:"Einmal pro Woche sanft mit Haferflocken + Joghurt peelen."},
    fr:{name:"Points noirs et blancs",desc:"Pores obstrués avec des pointes sombres ou blanches.",remedy:"Une fois par semaine, exfoliez doucement avec des flocons d'avoine et du yaourt."}
  },
  open_pores:{
    en:{name:"Open / enlarged pores",desc:"Visibly widened pores, often on the nose and cheeks.",remedy:"Wrap ice in a cloth and press on the face for 30–60 seconds (never apply ice directly)."},
    bn:{name:"বড় পোর (Open pores)",desc:"নাক ও গালে দৃশ্যমান বড় পোর।",remedy:"বরফ কাপড়ে মুড়ে ৩০–৬০ সেকেন্ড মুখে চেপে ধরো (সরাসরি বরফ নয়)।"},
    hi:{name:"बड़े रोमछिद्र",desc:"नाक और गालों पर स्पष्ट रूप से बड़े रोमछिद्र।",remedy:"बर्फ को कपड़े में लपेटकर 30–60 सेकंड चेहरे पर लगाएं (सीधे बर्फ न लगाएं)।"},
    de:{name:"Erweiterte Poren",desc:"Sichtbar vergrößerte Poren, oft an Nase und Wangen.",remedy:"Eis in ein Tuch wickeln und 30–60 Sekunden auf das Gesicht drücken (nie direkt auftragen)."},
    fr:{name:"Pores dilatés",desc:"Pores visiblement élargis, souvent sur le nez et les joues.",remedy:"Enveloppez de la glace dans un tissu et appliquez 30 à 60 secondes (jamais de glace directe)."}
  },
  pigmentation:{
    en:{name:"Dark spots / pigmentation",desc:"Patches of darker skin from old marks or sun exposure.",remedy:"Apply aloe vera gel and use sunscreen daily — this is the single most important step."},
    bn:{name:"পিগমেন্টেশন / কালো দাগ",desc:"পুরনো দাগ বা রোদের কারণে ত্বকের কালচে অংশ।",remedy:"অ্যালোভেরা জেল লাগাও এবং প্রতিদিন সানস্ক্রিন ব্যবহার করো — এটি সবচেয়ে গুরুত্বপূর্ণ।"},
    hi:{name:"पिगमेंटेशन / काले धब्बे",desc:"पुराने निशान या धूप के कारण त्वचा का काला भाग।",remedy:"एलोवेरा जेल लगाएं और रोज़ सनस्क्रीन का इस्तेमाल करें — यह सबसे ज़रूरी कदम है।"},
    de:{name:"Pigmentflecken",desc:"Dunklere Hautstellen durch alte Male oder Sonne.",remedy:"Aloe-vera-Gel auftragen und täglich Sonnencreme benutzen — das ist der wichtigste Schritt."},
    fr:{name:"Taches pigmentaires",desc:"Zones plus foncées dues à d'anciennes marques ou au soleil.",remedy:"Appliquez du gel d'aloe vera et utilisez un écran solaire chaque jour — c'est l'étape la plus importante."}
  },
  melasma:{
    en:{name:"Melasma",desc:"Larger brownish patches, often on cheeks and forehead.",remedy:"Strict daily sunscreen (SPF 30+), a wide-brim hat outdoors, and aloe vera gel at night."},
    bn:{name:"মেছতা (Melasma)",desc:"গাল ও কপালে বড় বাদামি দাগ।",remedy:"প্রতিদিন কড়াভাবে সানস্ক্রিন (SPF 30+), বাইরে গেলে চওড়া টুপি, এবং রাতে অ্যালোভেরা জেল।"},
    hi:{name:"मेलास्मा",desc:"गाल और माथे पर बड़े भूरे धब्बे।",remedy:"रोज़ सख्ती से सनस्क्रीन (SPF 30+), बाहर जाते समय चौड़ी टोपी, और रात में एलोवेरा जेल।"},
    de:{name:"Melasma",desc:"Größere bräunliche Flecken, oft auf Wangen und Stirn.",remedy:"Konsequent täglich Sonnencreme (SPF 30+), ein breitkrempiger Hut im Freien und abends Aloe-vera-Gel."},
    fr:{name:"Mélasma",desc:"Grandes taches brunâtres, souvent sur les joues et le front.",remedy:"Écran solaire quotidien strict (SPF 30+), un chapeau à large bord dehors, et du gel d'aloe vera le soir."}
  },
  freckles:{
    en:{name:"Freckles",desc:"Small, scattered brown spots, often sun-related.",remedy:"Daily sunscreen is key; aloe vera gel helps keep tone even."},
    bn:{name:"ফ্রেকলস",desc:"ছোট ছোট বাদামি দাগ, সাধারণত রোদের কারণে।",remedy:"প্রতিদিন সানস্ক্রিন সবচেয়ে জরুরি; অ্যালোভেরা জেল ত্বকের টোন সমান রাখতে সাহায্য করে।"},
    hi:{name:"झाइयां",desc:"छोटे, बिखरे भूरे धब्बे, अक्सर धूप के कारण।",remedy:"रोज़ सनस्क्रीन सबसे ज़रूरी है; एलोवेरा जेल त्वचा का रंग एक समान रखने में मदद करता है।"},
    de:{name:"Sommersprossen",desc:"Kleine, verstreute braune Flecken, oft sonnenbedingt.",remedy:"Tägliche Sonnencreme ist entscheidend; Aloe-vera-Gel hilft, den Hautton auszugleichen."},
    fr:{name:"Taches de rousseur",desc:"Petites taches brunes éparses, souvent liées au soleil.",remedy:"L'écran solaire quotidien est essentiel ; le gel d'aloe vera aide à unifier le teint."}
  },
  sunburn:{
    en:{name:"Sunburn",desc:"Redness and heat from recent sun exposure.",remedy:"Cool aloe vera gel to soothe skin, and stay out of direct sun until it heals."},
    bn:{name:"সানবার্ন",desc:"রোদে পোড়ার কারণে লালচেভাব ও উষ্ণতা।",remedy:"ঠান্ডা অ্যালোভেরা জেল আরাম দেয়; সেরে না ওঠা পর্যন্ত সরাসরি রোদ এড়িয়ে চলো।"},
    hi:{name:"सनबर्न",desc:"धूप में जलने से लालिमा और गर्माहट।",remedy:"ठंडा एलोवेरा जेल राहत देता है; ठीक होने तक सीधी धूप से बचें।"},
    de:{name:"Sonnenbrand",desc:"Rötung und Hitze durch kürzliche Sonneneinstrahlung.",remedy:"Kühles Aloe-vera-Gel beruhigt die Haut; direkte Sonne meiden, bis sie abgeheilt ist."},
    fr:{name:"Coup de soleil",desc:"Rougeur et chaleur dues à une exposition récente au soleil.",remedy:"Du gel d'aloe vera frais apaise la peau ; évitez le soleil direct jusqu'à guérison."}
  },
  rosacea:{
    en:{name:"Redness / rosacea-like flushing",desc:"Persistent redness, often across cheeks and nose.",remedy:"Use lukewarm (not hot) water, a fragrance-free moisturizer, and daily sunscreen; avoid known triggers like spicy food."},
    bn:{name:"ত্বক লাল হয়ে যাওয়া (Rosacea)",desc:"গাল ও নাকে দীর্ঘস্থায়ী লালচেভাব।",remedy:"হালকা গরম (গরম নয়) পানি, সুগন্ধিহীন ময়েশ্চারাইজার, ও প্রতিদিন সানস্ক্রিন ব্যবহার করো; ঝাল খাবারের মতো ট্রিগার এড়িয়ে চলো।"},
    hi:{name:"त्वचा का लाल होना (Rosacea)",desc:"गालों और नाक पर लगातार लालिमा।",remedy:"गुनगुने (गर्म नहीं) पानी, बिना खुशबू वाले मॉइस्चराइज़र, और रोज़ सनस्क्रीन का उपयोग करें; मसालेदार खाने जैसे ट्रिगर से बचें।"},
    de:{name:"Rötung / Rosacea-artiges Erröten",desc:"Anhaltende Rötung, oft an Wangen und Nase.",remedy:"Lauwarmes (nicht heißes) Wasser, eine parfümfreie Feuchtigkeitscreme und tägliche Sonnencreme verwenden; bekannte Auslöser wie scharfes Essen meiden."},
    fr:{name:"Rougeurs de type rosacée",desc:"Rougeur persistante, souvent sur les joues et le nez.",remedy:"Utilisez de l'eau tiède (pas chaude), une crème hydratante sans parfum et un écran solaire quotidien ; évitez les déclencheurs connus comme les plats épicés."}
  },
  dark_circles:{
    en:{name:"Dark circles",desc:"Darker skin under the eyes, often from tiredness.",remedy:"Get enough sleep. Place cool tea bags or cold cucumber slices under the eyes for 10 minutes."},
    bn:{name:"ডার্ক সার্কেল",desc:"চোখের নিচে কালচে ত্বক, প্রায়ই ঘুম কম হওয়ার কারণে।",remedy:"পর্যাপ্ত ঘুমাও। ঠান্ডা টি-ব্যাগ বা ঠান্ডা শসার টুকরো চোখের নিচে ১০ মিনিট রাখো।"},
    hi:{name:"डार्क सर्कल",desc:"आंखों के नीचे काली त्वचा, अक्सर थकान से।",remedy:"पर्याप्त नींद लें। ठंडी टी-बैग या ठंडे खीरे के टुकड़े आंखों के नीचे 10 मिनट रखें।"},
    de:{name:"Augenringe",desc:"Dunklere Haut unter den Augen, oft durch Müdigkeit.",remedy:"Ausreichend schlafen. Kühle Teebeutel oder kalte Gurkenscheiben 10 Minuten unter die Augen legen."},
    fr:{name:"Cernes",desc:"Peau plus foncée sous les yeux, souvent due à la fatigue.",remedy:"Dormez suffisamment. Placez des sachets de thé froids ou des rondelles de concombre froides sous les yeux pendant 10 minutes."}
  },
  puffy_eyes:{
    en:{name:"Puffy eyes",desc:"Swelling under the eyes, often on waking.",remedy:"Use a chilled spoon or cold cucumber slices under the eyes."},
    bn:{name:"চোখের নিচে ফোলা (Eye bags)",desc:"সকালে ঘুম থেকে উঠলে চোখের নিচে ফোলাভাব।",remedy:"ঠান্ডা চামচ বা ঠান্ডা শসার টুকরো চোখের নিচে ব্যবহার করো।"},
    hi:{name:"आंखों की सूजन",desc:"सोकर उठने पर आंखों के नीचे सूजन।",remedy:"ठंडा चम्मच या ठंडे खीरे के टुकड़े आंखों के नीचे इस्तेमाल करें।"},
    de:{name:"Geschwollene Augen",desc:"Schwellung unter den Augen, oft beim Aufwachen.",remedy:"Einen gekühlten Löffel oder kalte Gurkenscheiben unter die Augen legen."},
    fr:{name:"Poches sous les yeux",desc:"Gonflement sous les yeux, souvent au réveil.",remedy:"Utilisez une cuillère froide ou des rondelles de concombre froides sous les yeux."}
  },
  under_eye_wrinkles:{
    en:{name:"Fine lines under the eyes",desc:"Thin lines in the delicate under-eye skin.",remedy:"Keep the area moisturized, use daily sunscreen, and drink enough water."},
    bn:{name:"চোখের নিচে বলিরেখা",desc:"চোখের নিচের পাতলা ত্বকে সূক্ষ্ম রেখা।",remedy:"জায়গাটি ময়েশ্চারাইজড রাখো, প্রতিদিন সানস্ক্রিন দাও, এবং পর্যাপ্ত পানি পান করো।"},
    hi:{name:"आंखों के नीचे महीन रेखाएं",desc:"आंखों के नीचे की नाज़ुक त्वचा में पतली रेखाएं।",remedy:"क्षेत्र को नम रखें, रोज़ सनस्क्रीन लगाएं, और पर्याप्त पानी पिएं।"},
    de:{name:"Feine Linien unter den Augen",desc:"Feine Linien in der zarten Haut unter den Augen.",remedy:"Den Bereich feucht halten, täglich Sonnencreme verwenden und genug Wasser trinken."},
    fr:{name:"Ridules sous les yeux",desc:"Fines lignes dans la peau délicate sous les yeux.",remedy:"Gardez la zone hydratée, utilisez un écran solaire quotidien et buvez assez d'eau."}
  },
  wrinkles:{
    en:{name:"Wrinkles & fine lines",desc:"Lines from reduced elasticity and repeated expressions.",remedy:"Aloe vera gel, daily sunscreen, and drinking enough water all help."},
    bn:{name:"বলিরেখা ও ফাইন লাইন",desc:"ইলাস্টিসিটি কমে যাওয়া ও বারবার একই ভাবভঙ্গির কারণে রেখা।",remedy:"অ্যালোভেরা জেল, প্রতিদিন সানস্ক্রিন, এবং পর্যাপ্ত পানি পান সবই সাহায্য করে।"},
    hi:{name:"झुर्रियां और महीन रेखाएं",desc:"लचीलापन कम होने और बार-बार भाव-भंगिमा से बनी रेखाएं।",remedy:"एलोवेरा जेल, रोज़ सनस्क्रीन, और पर्याप्त पानी पीना — सब मदद करता है।"},
    de:{name:"Falten & feine Linien",desc:"Linien durch verminderte Elastizität und wiederholte Mimik.",remedy:"Aloe-vera-Gel, tägliche Sonnencreme und ausreichend Wasser trinken helfen alle."},
    fr:{name:"Rides et ridules",desc:"Lignes dues à une élasticité réduite et aux expressions répétées.",remedy:"Le gel d'aloe vera, l'écran solaire quotidien et boire assez d'eau aident tous."}
  },
  sagging:{
    en:{name:"Sagging skin",desc:"Loss of firmness, especially along the jawline.",remedy:"Stay hydrated, get enough sleep, eat protein and vitamin-C rich foods, and use daily sunscreen to slow further loss of elasticity."},
    bn:{name:"ত্বক ঝুলে যাওয়া",desc:"বিশেষত চোয়ালের রেখা বরাবর দৃঢ়তা কমে যাওয়া।",remedy:"পর্যাপ্ত পানি পান করো, ভালো ঘুমাও, প্রোটিন ও ভিটামিন-C সমৃদ্ধ খাবার খাও, এবং প্রতিদিন সানস্ক্রিন দিয়ে ইলাস্টিসিটি কমা ধীর করো।"},
    hi:{name:"त्वचा का ढीला पड़ना",desc:"खासकर जॉलाइन पर कसावट कम होना।",remedy:"पर्याप्त पानी पिएं, अच्छी नींद लें, प्रोटीन और विटामिन-C युक्त भोजन खाएं, और रोज़ सनस्क्रीन से लोच में कमी को धीमा करें।"},
    de:{name:"Erschlaffte Haut",desc:"Verlust der Festigkeit, besonders entlang der Kieferlinie.",remedy:"Ausreichend trinken, genug schlafen, proteinreiche und vitamin-C-reiche Lebensmittel essen und täglich Sonnencreme verwenden, um weiteren Elastizitätsverlust zu verlangsamen."},
    fr:{name:"Relâchement cutané",desc:"Perte de fermeté, surtout le long de la mâchoire.",remedy:"Restez hydraté, dormez suffisamment, mangez des aliments riches en protéines et vitamine C, et utilisez un écran solaire quotidien pour ralentir la perte d'élasticité."}
  },
  dry_skin:{
    en:{name:"Dry skin",desc:"Tightness, flaking, or a rough texture.",remedy:"Apply honey for 10–15 minutes, then rinse off."},
    bn:{name:"শুষ্ক ত্বক",desc:"টানটান ভাব, খসখসে বা রুক্ষ টেক্সচার।",remedy:"মধু ১০–১৫ মিনিট লাগিয়ে রেখে ধুয়ে ফেলো।"},
    hi:{name:"रूखी त्वचा",desc:"कसाव, परतदार या खुरदुरी बनावट।",remedy:"शहद 10–15 मिनट लगाकर धो लें।"},
    de:{name:"Trockene Haut",desc:"Spannungsgefühl, Schuppung oder raue Textur.",remedy:"Honig 10–15 Minuten auftragen, dann abwaschen."},
    fr:{name:"Peau sèche",desc:"Tiraillements, desquamation ou texture rugueuse.",remedy:"Appliquez du miel pendant 10 à 15 minutes, puis rincez."}
  },
  dull_skin:{
    en:{name:"Dull skin",desc:"Skin looks tired and lacks natural glow.",remedy:"Once or twice a week, use a besan (gram flour) + yogurt face pack."},
    bn:{name:"নিষ্প্রভ ত্বক",desc:"ত্বক ক্লান্ত দেখায় এবং প্রাকৃতিক উজ্জ্বলতা কমে যায়।",remedy:"সপ্তাহে ১–২ বার বেসন + দই দিয়ে ফেস প্যাক দাও।"},
    hi:{name:"बेजान त्वचा",desc:"त्वचा थकी हुई दिखती है और प्राकृतिक चमक कम होती है।",remedy:"सप्ताह में 1–2 बार बेसन + दही का फेस पैक लगाएं।"},
    de:{name:"Fahle Haut",desc:"Die Haut wirkt müde und ohne natürlichen Glanz.",remedy:"1–2 Mal pro Woche eine Gesichtsmaske aus Kichererbsenmehl (Besan) und Joghurt auftragen."},
    fr:{name:"Peau terne",desc:"La peau paraît fatiguée et manque d'éclat naturel.",remedy:"Une à deux fois par semaine, appliquez un masque à la farine de pois chiche (besan) et au yaourt."}
  },
  chapped_lips:{
    en:{name:"Chapped lips",desc:"Dry, cracked, or flaking lips.",remedy:"Apply honey or a little coconut oil."},
    bn:{name:"ঠোঁট ফাটা / শুষ্ক ঠোঁট",desc:"শুষ্ক, ফাটা বা খসখসে ঠোঁট।",remedy:"মধু বা সামান্য নারিকেল তেল লাগাও।"},
    hi:{name:"फटे होंठ",desc:"सूखे, फटे या परतदार होंठ।",remedy:"शहद या थोड़ा नारियल तेल लगाएं।"},
    de:{name:"Spröde Lippen",desc:"Trockene, rissige oder schuppende Lippen.",remedy:"Honig oder etwas Kokosöl auftragen."},
    fr:{name:"Lèvres gercées",desc:"Lèvres sèches, fissurées ou qui pèlent.",remedy:"Appliquez du miel ou un peu d'huile de coco."}
  }
};

/* ---------------- 2. DAILY ROUTINE / LIFESTYLE / AVOID ---------------- */
const DAILY = {
  en:{am:["Gentle face wash","Thin layer of aloe vera gel","Moisturizer","Sunscreen SPF 30 or higher"],
      pm:["Cleanse your face","Aloe vera gel","Moisturizer"],
      life:["Sleep 7–8 hours a night","Drink water through the day","Eat more fruit and vegetables","Cut down on sugar and junk food","Touch your face less","Change your pillowcase 1–2 times a week"],
      avoid:["Applying raw lemon juice directly to skin","Drying out acne with toothpaste","Baking soda on the face","Scrubbing every single day","Rubbing raw garlic directly on skin"]},
  bn:{am:["হালকা ফেসওয়াশ","পাতলা করে অ্যালোভেরা জেল","ময়েশ্চারাইজার","SPF 30 বা তার বেশি সানস্ক্রিন"],
      pm:["মুখ পরিষ্কার করা","অ্যালোভেরা জেল","ময়েশ্চারাইজার"],
      life:["প্রতিদিন ৭–৮ ঘণ্টা ঘুম","সারাদিন পর্যাপ্ত পানি পান","ফল ও শাকসবজি বেশি খাও","অতিরিক্ত চিনি ও জাঙ্ক ফুড কমাও","মুখে হাত দেওয়া কমাও","বালিশের কভার সপ্তাহে ১–২ বার পরিবর্তন করো"],
      avoid:["লেবুর রস সরাসরি মুখে লাগানো","টুথপেস্ট দিয়ে ব্রণ শুকানোর চেষ্টা","বেকিং সোডা ব্যবহার","প্রতিদিন স্ক্রাব করা","কাঁচা রসুন সরাসরি ত্বকে লাগানো"]},
  hi:{am:["हल्का फेसवॉश","पतली परत में एलोवेरा जेल","मॉइस्चराइज़र","SPF 30 या उससे अधिक सनस्क्रीन"],
      pm:["चेहरा साफ करें","एलोवेरा जेल","मॉइस्चराइज़र"],
      life:["रोज़ 7–8 घंटे नींद लें","दिनभर पर्याप्त पानी पिएं","फल और सब्ज़ियां ज़्यादा खाएं","चीनी और जंक फूड कम करें","चेहरे को कम छुएं","तकिए का कवर सप्ताह में 1–2 बार बदलें"],
      avoid:["नींबू का रस सीधे चेहरे पर लगाना","टूथपेस्ट से मुंहासे सुखाने की कोशिश","बेकिंग सोडा का उपयोग","हर दिन स्क्रब करना","कच्चा लहसुन सीधे त्वचा पर लगाना"]},
  de:{am:["Sanftes Gesichtswaschmittel","Eine dünne Schicht Aloe-vera-Gel","Feuchtigkeitscreme","Sonnencreme SPF 30 oder höher"],
      pm:["Gesicht reinigen","Aloe-vera-Gel","Feuchtigkeitscreme"],
      life:["7–8 Stunden Schlaf pro Nacht","Über den Tag verteilt Wasser trinken","Mehr Obst und Gemüse essen","Zucker und Junkfood reduzieren","Das Gesicht seltener berühren","Kissenbezug 1–2 Mal pro Woche wechseln"],
      avoid:["Rohen Zitronensaft direkt auf die Haut auftragen","Pickel mit Zahnpasta austrocknen","Backpulver im Gesicht verwenden","Jeden Tag peelen","Rohen Knoblauch direkt auf die Haut reiben"]},
  fr:{am:["Nettoyant doux pour le visage","Une fine couche de gel d'aloe vera","Crème hydratante","Écran solaire SPF 30 ou plus"],
      pm:["Nettoyer le visage","Gel d'aloe vera","Crème hydratante"],
      life:["Dormir 7 à 8 heures par nuit","Boire de l'eau tout au long de la journée","Manger plus de fruits et légumes","Réduire le sucre et la malbouffe","Toucher son visage moins souvent","Changer sa taie d'oreiller 1 à 2 fois par semaine"],
      avoid:["Appliquer du jus de citron brut directement sur la peau","Assécher les boutons avec du dentifrice","Utiliser du bicarbonate de soude sur le visage","Exfolier tous les jours","Frotter de l'ail cru directement sur la peau"]}
};

/* ---------------- 3. UI STRINGS ---------------- */
const STR = {
  en:{eyebrow02:"02 · Connect the reader",keyTitle:"One-time setup",keyDesc:"Your skin has a story to tell. Just one quick step, and we'll show you exactly what's going on — clearly, kindly, and just for you.",keySave:"Save & continue",keyHint:"Paste your free Anthropic key below (get one at console.anthropic.com in about a minute) — it's saved only in this browser and goes straight to Anthropic, nowhere else.",back:"← back",eyebrow03:"03 · Show your face",captureTitle:"Good light. Bare face. No filters.",captureDesc:"For the most accurate reading, use natural daylight and remove makeup if you can.",openCamera:"Turn on camera",uploadPhoto:"Upload a photo",takeShot:"Take the photo",retake:"↺ retake",analyze:"Analyze my skin",loadingTitle:"Reading your skin…",loadingMsg1:"Mapping tone, texture and pores",loadingMsg2:"Checking for common skin patterns",loadingMsg3:"Putting your results together",eyebrow04:"04 · Your reading",resultsTitle:"Here's what your skin is telling us",getSolutions:"Get my natural routine",routineTitle:"Your natural routine",morning:"Morning",night:"Night",lifestyleTitle:"Habits that help",avoidTitle:"Avoid these",thankYou:"Thank you for scanning with DermaScan 🌿",sharePrompt:"Share this with a friend who needs it too:",scanAgain:"Scan again",noIssues:"No major concerns spotted — your skin looks balanced. Keep up a simple daily routine.",errKey:"Please enter a valid API key.",errCamera:"Couldn't access the camera. Try uploading a photo instead.",errApi:"Something went wrong reaching the analysis service. Check your API key and try again."},
  bn:{eyebrow02:"০২ · রিডার যুক্ত করো",keyTitle:"এককালীন সেটআপ",keyDesc:"তোমার ত্বক তোমাকে অনেক কথা বলতে চায়। শুধু একটা ছোট্ট ধাপ পার হও, আর জেনে নাও তোমার ত্বকের আসল অবস্থা — স্পষ্টভাবে, যত্ন নিয়ে, শুধু তোমার জন্য।",keySave:"সেভ করে এগিয়ে যাও",keyHint:"নিচে তোমার ফ্রি Anthropic key দাও (console.anthropic.com থেকে মাত্র এক মিনিটে বানানো যায়) — এটি শুধু এই ব্রাউজারে থাকবে, সরাসরি Anthropic ছাড়া আর কোথাও যাবে না।",back:"← ফিরে যাও",eyebrow03:"০৩ · তোমার মুখ দেখাও",captureTitle:"ভালো আলো। খালি মুখ। কোনো ফিল্টার নয়।",captureDesc:"সবচেয়ে নির্ভুল ফলাফলের জন্য প্রাকৃতিক আলোতে ছবি তোলো এবং সম্ভব হলে মেকআপ তুলে ফেলো।",openCamera:"ক্যামেরা চালু করো",uploadPhoto:"ছবি আপলোড করো",takeShot:"ছবি তোলো",retake:"↺ আবার তোলো",analyze:"আমার ত্বক বিশ্লেষণ করো",loadingTitle:"তোমার ত্বক পড়া হচ্ছে…",loadingMsg1:"টোন, টেক্সচার ও পোর ম্যাপ করা হচ্ছে",loadingMsg2:"সাধারণ ত্বকের সমস্যা যাচাই করা হচ্ছে",loadingMsg3:"তোমার ফলাফল সাজানো হচ্ছে",eyebrow04:"০৪ · তোমার রিডিং",resultsTitle:"তোমার ত্বক যা বলছে",getSolutions:"আমার প্রাকৃতিক রুটিন দাও",routineTitle:"তোমার প্রাকৃতিক রুটিন",morning:"সকাল",night:"রাত",lifestyleTitle:"যা করলে উপকার হবে",avoidTitle:"যা এড়িয়ে চলা ভালো",thankYou:"DermaScan-এ স্ক্যান করার জন্য ধন্যবাদ 🌿",sharePrompt:"যে বন্ধুর দরকার, তার সাথে শেয়ার করো:",scanAgain:"আবার স্ক্যান করো",noIssues:"বড় কোনো সমস্যা পাওয়া যায়নি — তোমার ত্বক মোটামুটি ভালো আছে। সহজ দৈনন্দিন রুটিন চালিয়ে যাও।",errKey:"সঠিক API key দাও।",errCamera:"ক্যামেরা চালু করা যায়নি। এর বদলে ছবি আপলোড করে দেখো।",errApi:"বিশ্লেষণ সার্ভিসে পৌঁছাতে সমস্যা হয়েছে। তোমার API key যাচাই করে আবার চেষ্টা করো।"},
  hi:{eyebrow02:"02 · रीडर जोड़ें",keyTitle:"एक बार की सेटअप",keyDesc:"आपकी त्वचा आपको बहुत कुछ बताना चाहती है। बस एक छोटा कदम, और हम आपको बिल्कुल साफ़ तौर पर, प्यार से, सिर्फ़ आपके लिए बताएंगे कि असल में क्या हो रहा है।",keySave:"सेव करें और जारी रखें",keyHint:"नीचे अपनी मुफ़्त Anthropic key डालें (console.anthropic.com पर लगभग एक मिनट में बनती है) — यह सिर्फ़ इस ब्राउज़र में सेव होती है और सीधे Anthropic को जाती है, कहीं और नहीं।",back:"← वापस",eyebrow03:"03 · अपना चेहरा दिखाएं",captureTitle:"अच्छी रोशनी। बिना मेकअप का चेहरा। कोई फ़िल्टर नहीं।",captureDesc:"सबसे सटीक परिणाम के लिए प्राकृतिक धूप का उपयोग करें और हो सके तो मेकअप हटा दें।",openCamera:"कैमरा चालू करें",uploadPhoto:"फोटो अपलोड करें",takeShot:"फोटो लें",retake:"↺ फिर से लें",analyze:"मेरी त्वचा का विश्लेषण करें",loadingTitle:"आपकी त्वचा पढ़ी जा रही है…",loadingMsg1:"टोन, टेक्सचर और पोर्स मैप किए जा रहे हैं",loadingMsg2:"सामान्य त्वचा समस्याओं की जांच हो रही है",loadingMsg3:"आपके परिणाम तैयार किए जा रहे हैं",eyebrow04:"04 · आपकी रीडिंग",resultsTitle:"आपकी त्वचा यह बता रही है",getSolutions:"मेरा प्राकृतिक रूटीन पाएं",routineTitle:"आपका प्राकृतिक रूटीन",morning:"सुबह",night:"रात",lifestyleTitle:"ये आदतें मदद करेंगी",avoidTitle:"इनसे बचें",thankYou:"DermaScan से स्कैन करने के लिए धन्यवाद 🌿",sharePrompt:"इसे उस दोस्त के साथ साझा करें जिसे इसकी ज़रूरत है:",scanAgain:"फिर से स्कैन करें",noIssues:"कोई बड़ी समस्या नहीं मिली — आपकी त्वचा संतुलित लग रही है। सरल दैनिक रूटीन जारी रखें।",errKey:"कृपया एक सही API key दर्ज करें।",errCamera:"कैमरा एक्सेस नहीं हो सका। इसके बजाय फोटो अपलोड करें।",errApi:"विश्लेषण सेवा तक पहुंचने में समस्या हुई। अपनी API key जांचें और फिर से प्रयास करें।"},
  de:{eyebrow02:"02 · Reader verbinden",keyTitle:"Einmalige Einrichtung",keyDesc:"Deine Haut hat einiges zu erzählen. Nur ein kurzer Schritt, und wir zeigen dir genau, was los ist — klar, einfühlsam und ganz auf dich zugeschnitten.",keySave:"Speichern & weiter",keyHint:"Füge unten deinen kostenlosen Anthropic-Key ein (in etwa einer Minute erstellt auf console.anthropic.com) — er wird nur in diesem Browser gespeichert und geht direkt an Anthropic, sonst nirgendwohin.",back:"← zurück",eyebrow03:"03 · Zeig dein Gesicht",captureTitle:"Gutes Licht. Ungeschminktes Gesicht. Keine Filter.",captureDesc:"Für das genaueste Ergebnis natürliches Tageslicht nutzen und wenn möglich Make-up entfernen.",openCamera:"Kamera einschalten",uploadPhoto:"Foto hochladen",takeShot:"Foto aufnehmen",retake:"↺ erneut aufnehmen",analyze:"Meine Haut analysieren",loadingTitle:"Deine Haut wird gelesen…",loadingMsg1:"Ton, Textur und Poren werden erfasst",loadingMsg2:"Häufige Hautmuster werden geprüft",loadingMsg3:"Deine Ergebnisse werden zusammengestellt",eyebrow04:"04 · Deine Auswertung",resultsTitle:"Das sagt deine Haut",getSolutions:"Meine natürliche Routine erhalten",routineTitle:"Deine natürliche Routine",morning:"Morgens",night:"Abends",lifestyleTitle:"Gewohnheiten, die helfen",avoidTitle:"Das solltest du vermeiden",thankYou:"Danke, dass du mit DermaScan gescannt hast 🌿",sharePrompt:"Teile das mit einer Freundin oder einem Freund, der es auch braucht:",scanAgain:"Erneut scannen",noIssues:"Keine größeren Auffälligkeiten gefunden — deine Haut wirkt ausgeglichen. Behalte eine einfache tägliche Routine bei.",errKey:"Bitte gib einen gültigen API-Key ein.",errCamera:"Kein Kamerazugriff möglich. Lade stattdessen ein Foto hoch.",errApi:"Beim Erreichen des Analysedienstes ist etwas schiefgelaufen. Überprüfe deinen API-Key und versuche es erneut."},
  fr:{eyebrow02:"02 · Connecter le lecteur",keyTitle:"Configuration unique",keyDesc:"Votre peau a beaucoup à raconter. Une seule petite étape, et nous vous montrerons exactement ce qui se passe — clairement, avec soin, rien que pour vous.",keySave:"Enregistrer et continuer",keyHint:"Collez votre clé Anthropic gratuite ci-dessous (créée en environ une minute sur console.anthropic.com) — elle n'est enregistrée que dans ce navigateur et va directement à Anthropic, nulle part ailleurs.",back:"← retour",eyebrow03:"03 · Montrez votre visage",captureTitle:"Bonne lumière. Visage nu. Aucun filtre.",captureDesc:"Pour un résultat plus précis, utilisez la lumière naturelle et enlevez le maquillage si possible.",openCamera:"Activer la caméra",uploadPhoto:"Importer une photo",takeShot:"Prendre la photo",retake:"↺ reprendre",analyze:"Analyser ma peau",loadingTitle:"Lecture de votre peau…",loadingMsg1:"Cartographie du teint, de la texture et des pores",loadingMsg2:"Vérification des signes courants",loadingMsg3:"Préparation de vos résultats",eyebrow04:"04 · Votre lecture",resultsTitle:"Voici ce que dit votre peau",getSolutions:"Obtenir ma routine naturelle",routineTitle:"Votre routine naturelle",morning:"Matin",night:"Soir",lifestyleTitle:"Habitudes qui aident",avoidTitle:"À éviter",thankYou:"Merci d'avoir scanné avec DermaScan 🌿",sharePrompt:"Partagez avec un ami qui en a aussi besoin :",scanAgain:"Scanner à nouveau",noIssues:"Aucun problème majeur détecté — votre peau semble équilibrée. Gardez une routine quotidienne simple.",errKey:"Veuillez entrer une clé API valide.",errCamera:"Impossible d'accéder à la caméra. Essayez plutôt d'importer une photo.",errApi:"Un problème est survenu en contactant le service d'analyse. Vérifiez votre clé API et réessayez."}
};

/* ---------------- 4. STATE ---------------- */
let state = { lang:"en", apiKey:"", imageDataUrl:"", stream:null };

/* ---------------- 5. HELPERS ---------------- */
const $ = id => document.getElementById(id);
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");
}
function toast(msg){
  const t=$("toast"); t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2600);
}
function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if (STR[state.lang] && STR[state.lang][key]) el.textContent = STR[state.lang][key];
  });
}

/* ---------------- 6. LANGUAGE GATE ---------------- */
document.querySelectorAll(".lang-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    state.lang = btn.dataset.lang;
    document.documentElement.lang = state.lang;
    applyI18n();
    const savedKey = localStorage.getItem("dermascan_api_key");
    if (savedKey){ state.apiKey = savedKey; showScreen("capture-gate"); }
    else showScreen("key-gate");
  });
});

/* ---------------- 7. API KEY GATE ---------------- */
$("save-key-btn").addEventListener("click",()=>{
  const val = $("api-key-input").value.trim();
  if (!val.startsWith("sk-ant-") || val.length < 20){ toast(STR[state.lang].errKey); return; }
  state.apiKey = val;
  localStorage.setItem("dermascan_api_key", val);
  showScreen("capture-gate");
});

/* ---------------- 8. CAPTURE ---------------- */
const video = $("camera-video"), previewImg = $("preview-img"), canvas = $("capture-canvas");
const scanSweep = $("scan-sweep");

$("open-camera-btn").addEventListener("click", async ()=>{
  try{
    state.stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"user" }, audio:false });
    video.srcObject = state.stream;
    video.style.display = "block";
    previewImg.style.display = "none";
    $("capture-controls").style.display = "none";
    $("snap-btn").style.display = "inline-block";
    $("retake-row").style.display = "none";
  }catch(err){ toast(STR[state.lang].errCamera); }
});

$("upload-btn").addEventListener("click",()=> $("file-input").click());
$("file-input").addEventListener("change", e=>{
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    state.imageDataUrl = reader.result;
    previewImg.src = state.imageDataUrl;
    previewImg.style.display = "block";
    video.style.display = "none";
    $("capture-controls").style.display = "none";
    $("snap-btn").style.display = "none";
    $("retake-row").style.display = "flex";
  };
  reader.readAsDataURL(file);
});

$("snap-btn").addEventListener("click",()=>{
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video,0,0);
  state.imageDataUrl = canvas.toDataURL("image/jpeg",0.9);
  previewImg.src = state.imageDataUrl;
  previewImg.style.display = "block";
  video.style.display = "none";
  stopCamera();
  $("snap-btn").style.display = "none";
  $("retake-row").style.display = "flex";
});

function stopCamera(){
  if (state.stream){ state.stream.getTracks().forEach(t=>t.stop()); state.stream = null; }
}

$("retake-btn").addEventListener("click",()=>{
  previewImg.style.display = "none";
  $("retake-row").style.display = "none";
  $("capture-controls").style.display = "flex";
  state.imageDataUrl = "";
});

$("analyze-btn").addEventListener("click", runAnalysis);

/* ---------------- 9. ANALYSIS ---------------- */
const LOADING_MSGS_KEYS = ["loadingMsg1","loadingMsg2","loadingMsg3"];

async function runAnalysis(){
  showScreen("loading-gate");
  scanSweep.classList.add("active");
  let msgIdx = 0;
  $("loading-msg").textContent = STR[state.lang][LOADING_MSGS_KEYS[0]];
  const cycler = setInterval(()=>{
    msgIdx = (msgIdx+1) % LOADING_MSGS_KEYS.length;
    $("loading-msg").textContent = STR[state.lang][LOADING_MSGS_KEYS[msgIdx]];
  },1600);

  try{
    const issues = await callClaudeVision(state.imageDataUrl, state.apiKey);
    clearInterval(cycler);
    scanSweep.classList.remove("active");
    renderResults(issues);
    showScreen("results-gate");
  }catch(err){
    clearInterval(cycler);
    scanSweep.classList.remove("active");
    console.error(err);
    toast(STR[state.lang].errApi);
    showScreen("capture-gate");
  }
}

async function callClaudeVision(dataUrl, apiKey){
  const [meta, base64] = dataUrl.split(",");
  const mediaType = meta.match(/data:(.*);base64/)[1];
  const issueKeys = Object.keys(ISSUES);

  const systemPrompt =
`You are a cosmetic skin-appearance classifier. Look only at visible surface qualities of the skin in the photo — texture, tone, pores, redness, dryness, oiliness, marks. This is for a casual beauty app, not a medical diagnosis.
Return STRICT JSON only, no prose, no markdown fences, in this exact shape:
{"issues": ["key1","key2"], "note": "one short, kind sentence in ${langName(state.lang)} summarizing overall skin condition"}
Only use keys from this fixed list, choosing every key that visibly applies (can be 0 to many): ${issueKeys.join(", ")}.
If the image does not clearly show a human face, return {"issues": [], "note": "one short sentence in ${langName(state.lang)} saying no face was clearly detected"}.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-api-key": apiKey,
      "anthropic-version":"2023-06-01",
      "anthropic-dangerous-direct-browser-access":"true"
    },
    body: JSON.stringify({
      model:"claude-sonnet-5",
      max_tokens:400,
      system: systemPrompt,
      messages:[{
        role:"user",
        content:[
          { type:"image", source:{ type:"base64", media_type: mediaType, data: base64 } },
          { type:"text", text:"Analyze this face photo now." }
        ]
      }]
    })
  });

  if (!resp.ok){
    const errText = await resp.text().catch(()=> "");
    throw new Error("API error " + resp.status + " " + errText);
  }
  const data = await resp.json();
  const textBlock = (data.content || []).find(b=>b.type==="text");
  let parsed;
  try{
    let raw = textBlock ? textBlock.text.trim() : "{}";
    raw = raw.replace(/^```json/,"").replace(/^```/,"").replace(/```$/,"").trim();
    parsed = JSON.parse(raw);
  }catch(e){ parsed = { issues: [], note: "" }; }

  return {
    keys: (parsed.issues || []).filter(k => ISSUES[k]),
    note: parsed.note || ""
  };
}

function langName(code){
  return { en:"English", bn:"Bangla (বাংলা)", hi:"Hindi (हिन्दी)", de:"German (Deutsch)", fr:"French (Français)" }[code] || "English";
}

/* ---------------- 10. RESULTS RENDER ---------------- */
let lastIssueKeys = [];

function renderResults(result){
  lastIssueKeys = result.keys;
  $("result-img").src = state.imageDataUrl;
  const list = $("issue-list");
  list.innerHTML = "";

  if (!lastIssueKeys.length){
    const div = document.createElement("div");
    div.className = "issue-card";
    div.innerHTML = `<div class="issue-dot"></div><div><h4>🌿</h4><p>${STR[state.lang].noIssues}</p></div>`;
    list.appendChild(div);
  } else {
    lastIssueKeys.forEach(key=>{
      const info = ISSUES[key][state.lang] || ISSUES[key].en;
      const div = document.createElement("div");
      div.className = "issue-card";
      div.innerHTML = `<div class="issue-dot"></div><div><h4>${info.name}</h4><p>${info.desc}</p></div>`;
      list.appendChild(div);
    });
  }
  $("routine-panel").style.display = "none";
}

$("solution-btn").addEventListener("click",()=>{
  const table = $("routine-table");
  table.innerHTML = "";
  const keys = lastIssueKeys.length ? lastIssueKeys : [];
  keys.forEach(key=>{
    const info = ISSUES[key][state.lang] || ISSUES[key].en;
    const row = document.createElement("div");
    row.className = "routine-row";
    row.innerHTML = `<div class="rk">${info.name}</div><div class="rv">${info.remedy}</div>`;
    table.appendChild(row);
  });

  const d = DAILY[state.lang] || DAILY.en;
  $("am-list").innerHTML = d.am.map(x=>`<li>${x}</li>`).join("");
  $("pm-list").innerHTML = d.pm.map(x=>`<li>${x}</li>`).join("");
  $("lifestyle-list").innerHTML = d.life.map(x=>`<li>${x}</li>`).join("");
  $("avoid-list").innerHTML = d.avoid.map(x=>`<li>${x}</li>`).join("");

  $("routine-panel").style.display = "block";
  $("routine-panel").scrollIntoView({behavior:"smooth", block:"start"});
});

/* ---------------- 11. SHARE ---------------- */
function setShareLinks(){
  const text = encodeURIComponent("I just scanned my skin with DermaScan 🌿 — try it here:");
  const url = encodeURIComponent(APP_URL);
  $("share-wa").href = `https://wa.me/?text=${text}%20${url}`;
  $("share-fb").href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  $("share-msg").href = `https://www.facebook.com/dialog/send?link=${url}&app_id=0&redirect_uri=${url}`;
  $("share-imo").href = `imo://share?text=${text}%20${url}`;
}
setShareLinks();

$("scan-again-btn").addEventListener("click",()=>{
  state.imageDataUrl = "";
  $("capture-controls").style.display = "flex";
  $("retake-row").style.display = "none";
  $("snap-btn").style.display = "none";
  previewImg.style.display = "none";
  showScreen("capture-gate");
});

/* init */
showScreen("lang-gate");
