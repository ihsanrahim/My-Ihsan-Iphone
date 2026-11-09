/* My Ihsan 0.12.0: Huruf Hijaiyah (idea 68) and common Quran words (idea 69). Pending review by a qualified ustaz.
   HIJAIYAH: [letter, name in Arabic for the voice, Malay name, English name, Malay sound, English sound, heavy, joins left]
   Heavy letters use "o" with baris atas in the Malay sounds (kho, ro, gho, qo...), as taught in Malaysian classes. */
var HIJAIYAH=[
["ا","أَلِف","Alif","Alif","","",0,0],["ب","بَاء","Ba","Ba","b","b",0,1],["ت","تَاء","Ta","Ta","t","t",0,1],["ث","ثَاء","Tsa","Tha","ts","th",0,1],
["ج","جِيم","Jim","Jim","j","j",0,1],["ح","حَاء","Ha","Ḥa","h","ḥ",0,1],["خ","خَاء","Kho","Kha","kh","kh",1,1],["د","دَال","Dal","Dal","d","d",0,0],
["ذ","ذَال","Dzal","Dhal","dz","dh",0,0],["ر","رَاء","Ro","Ra","r","r",1,0],["ز","زَاي","Zai","Zay","z","z",0,0],["س","سِين","Sin","Sin","s","s",0,1],
["ش","شِين","Syin","Shin","sy","sh",0,1],["ص","صَاد","Sod","Ṣad","s","ṣ",1,1],["ض","ضَاد","Dhod","Ḍad","dh","ḍ",1,1],["ط","طَاء","Tho","Ṭa","th","ṭ",1,1],
["ظ","ظَاء","Zho","Ẓa","zh","ẓ",1,1],["ع","عَيْن","'Ain","'Ayn","'","'",0,1],["غ","غَيْن","Ghain","Ghayn","gh","gh",1,1],["ف","فَاء","Fa","Fa","f","f",0,1],
["ق","قَاف","Qof","Qaf","q","q",1,1],["ك","كَاف","Kaf","Kaf","k","k",0,1],["ل","لَام","Lam","Lam","l","l",0,1],["م","مِيم","Mim","Mim","m","m",0,1],
["ن","نُون","Nun","Nun","n","n",0,1],["و","وَاو","Wau","Waw","w","w",0,0],["ه","هَاء","Ha","Ha","h","h",0,1],["ء","هَمْزَة","Hamzah","Hamzah","'","'",0,0],
["ي","يَاء","Ya","Ya","y","y",0,1]];
/* QWORDS: categories, then [category, Arabic as in the mushaf, Malay meaning, English meaning, spelling for the voice when the mushaf spelling differs] */
var QW_CATS=[["allah","Allah & iman","Allah & faith"],["insan","Manusia","People"],["alam","Alam","Creation"],["akhirat","Akhirat","The Hereafter"],["ibadah","Kitab & ibadah","Scripture & worship"],["fiil","Kata kerja","Verbs"],["harf","Kata kecil","Small words"]];
var QWORDS=[
["allah","ٱللَّهُ","Allah","Allah","اللَّهُ"],["allah","رَبّ","Tuhan, Pemelihara","Lord, Sustainer"],["allah","إِلَٰه","tuhan (yang disembah)","god (one who is worshipped)","إِلَاه"],
["allah","ٱلرَّحْمَٰن","Yang Maha Pemurah","the Most Gracious","الرَّحْمَان"],["allah","ٱلرَّحِيم","Yang Maha Penyayang","the Most Merciful","الرَّحِيم"],["allah","عَلِيم","Maha Mengetahui","All-Knowing"],
["allah","حَكِيم","Maha Bijaksana","All-Wise"],["allah","غَفُور","Maha Pengampun","Oft-Forgiving"],["allah","قَدِير","Maha Berkuasa","All-Powerful"],
["allah","سَمِيع","Maha Mendengar","All-Hearing"],["allah","بَصِير","Maha Melihat","All-Seeing"],["allah","إِيمَٰن","iman","faith","إِيمَان"],
["allah","ءَامَنُوا۟","mereka beriman","they believed","آمَنُوا"],["allah","كَفَرُوا۟","mereka ingkar (kufur)","they disbelieved","كَفَرُوا"],["allah","تَقْوَىٰ","takwa","mindfulness of Allah (taqwa)","تَقْوَى"],
["allah","رَحْمَة","rahmat, kasih sayang","mercy"],["allah","هُدًى","petunjuk","guidance"],["allah","نُور","cahaya","light"],["allah","حَقّ","kebenaran","truth"],["allah","ذِكْر","zikir, peringatan","remembrance, reminder"],
["insan","ٱلنَّاس","manusia","people, mankind","النَّاس"],["insan","إِنسَٰن","insan, manusia","human being","إِنْسَان"],["insan","قَوْم","kaum","people, nation"],
["insan","رَسُول","rasul, utusan","messenger"],["insan","نَبِىّ","nabi","prophet","نَبِيّ"],["insan","عِبَاد","hamba-hamba","servants"],
["insan","مُؤْمِنُون","orang beriman","believers"],["insan","مُتَّقِين","orang bertakwa","the mindful (muttaqin)"],["insan","ظَٰلِمِين","orang zalim","wrongdoers","ظَالِمِين"],
["insan","صَٰلِحِين","orang soleh","the righteous","صَالِحِين"],["insan","أَب","bapa","father"],["insan","أُمّ","ibu","mother"],
["insan","وَلَد","anak","child"],["insan","أَهْل","ahli, keluarga","family, people of"],["insan","نَفْس","diri, jiwa","self, soul"],["insan","قَلْب","hati","heart"],
["alam","ٱلسَّمَٰوَٰت","langit (banyak)","the heavens","السَّمَاوَات"],["alam","ٱلْأَرْض","bumi","the earth","الْأَرْض"],["alam","شَمْس","matahari","sun"],
["alam","قَمَر","bulan","moon"],["alam","مَآء","air","water","مَاء"],["alam","نَار","api, neraka","fire, the Fire"],
["alam","جَنَّة","syurga, taman","Paradise, garden"],["alam","لَيْل","malam","night"],["alam","نَهَار","siang","daytime"],
["alam","بَحْر","laut","sea"],["alam","جِبَال","gunung-ganang","mountains"],["alam","شَىْء","sesuatu","thing","شَيْء"],
["akhirat","يَوْم","hari","day"],["akhirat","ٱلْءَاخِرَة","akhirat","the Hereafter","الْآخِرَة"],["akhirat","ٱلْقِيَٰمَة","kiamat","the Resurrection","الْقِيَامَة"],
["akhirat","ٱلدُّنْيَا","dunia","this world","الدُّنْيَا"],["akhirat","عَذَاب","azab, seksa","punishment"],["akhirat","أَجْر","pahala, ganjaran","reward"],
["akhirat","حِسَاب","hisab, perhitungan","reckoning"],["akhirat","مَوْت","kematian","death"],["akhirat","سَبِيل","jalan","way, path"],
["ibadah","كِتَٰب","kitab","book, scripture","كِتَاب"],["ibadah","ءَايَة","ayat, tanda","verse, sign","آيَة"],["ibadah","ٱلْقُرْءَان","al-Quran","the Quran","الْقُرْآن"],
["ibadah","ٱلصَّلَوٰة","solat","the prayer","الصَّلَاة"],["ibadah","ٱلزَّكَوٰة","zakat","zakat","الزَّكَاة"],["ibadah","صَبْر","sabar","patience"],
["ibadah","شُكْر","syukur","gratitude"],["ibadah","عِلْم","ilmu","knowledge"],["ibadah","عَمَل","amal, perbuatan","deed"],
["ibadah","خَيْر","kebaikan","good"],["ibadah","سُوٓء","keburukan","evil","سُوء"],
["fiil","قَالَ","dia (lelaki) berkata","he said"],["fiil","قُلْ","katakanlah","say"],["fiil","كَانَ","adalah, dahulunya","was"],
["fiil","جَعَلَ","Dia menjadikan","He made"],["fiil","خَلَقَ","Dia mencipta","He created"],["fiil","يَعْلَمُونَ","mereka mengetahui","they know"],
["fiil","عَمِلُوا۟","mereka beramal","they did (deeds)","عَمِلُوا"],["fiil","جَآءَ","dia datang","he came","جَاءَ"],["fiil","أَنزَلَ","Dia menurunkan","He sent down","أَنْزَلَ"],
["fiil","يَشَآءُ","Dia kehendaki","He wills","يَشَاءُ"],["fiil","رَأَىٰ","dia melihat","he saw","رَأَى"],["fiil","ٱتَّقُوا۟","bertakwalah","be mindful of Allah","اتَّقُوا"],
["fiil","ٱعْبُدُوا۟","sembahlah","worship","اعْبُدُوا"],["fiil","يُؤْمِنُونَ","mereka beriman","they believe"],["fiil","هَدَىٰ","Dia memberi petunjuk","He guided","هَدَى"],
["fiil","غَفَرَ","Dia mengampunkan","He forgave"],["fiil","ٱذْكُرُوا۟","ingatlah","remember","اذْكُرُوا"],["fiil","تَعْقِلُونَ","kamu berfikir","you reason"],
["harf","مِنْ","daripada","from"],["harf","فِى","dalam, pada","in","فِي"],["harf","عَلَىٰ","atas","on, upon","عَلَى"],
["harf","إِلَى","ke, kepada","to"],["harf","عَن","tentang, daripada","about, away from"],["harf","مَعَ","bersama","with"],
["harf","لَا","tidak, jangan","no, do not"],["harf","مَا","apa, tidak","what, not"],["harf","لَمْ","tidak (telah)","did not"],
["harf","إِنَّ","sesungguhnya","indeed"],["harf","إِلَّا","kecuali","except"],["harf","إِذَا","apabila","when"],
["harf","إِن","jika","if"],["harf","ثُمَّ","kemudian","then"],["harf","قَدْ","sungguh, telah","indeed, already"],
["harf","كُلّ","setiap, semua","every, all"],["harf","بَيْنَ","antara","between"],["harf","يَٰٓأَيُّهَا","wahai","O (you)","يَا أَيُّهَا"],
["harf","ٱلَّذِى","yang (seorang)","who, which (one)","الَّذِي"],["harf","ٱلَّذِينَ","orang-orang yang","those who","الَّذِينَ"],["harf","هُوَ","dia (lelaki)","he"],
["harf","هُمْ","mereka","they"],["harf","نَحْنُ","kami","we"],["harf","أَنتَ","engkau","you","أَنْتَ"],["harf","لَعَلَّ","supaya, mudah-mudahan","so that, perhaps"]
];
