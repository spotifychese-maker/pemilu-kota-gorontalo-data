/* data-config.js
   Konfigurasi dashboard, URL database, warna partai, data dapil, data KPU resmi, dan data pembanding tetap.
   File ini harus dipanggil sebelum analytics.js dan dashboard.js.
*/

window.DEMO_PORTAL_CONFIG = {
      url2024: "https://spotifychese-maker.github.io/pemilu-kota-gorontalo-data/database_2024_final_kpu_minified.json",
      url2019: "https://spotifychese-maker.github.io/pemilu-kota-gorontalo-data/data/pileg2019.json",
      url2014: "https://spotifychese-maker.github.io/pemilu-kota-gorontalo-data/data/pileg2014.json"
    };

window.DEMO_DAPIL_MAP = {
      "DAPIL 1": ["KOTA SELATAN", "HULONTHALANGI", "DUMBO RAYA"],
      "DAPIL 2": ["KOTA BARAT", "DUNGINGI"],
      "DAPIL 3": ["KOTA TENGAH", "SIPATANA"],
      "DAPIL 4": ["KOTA UTARA", "KOTA TIMUR"]
    };

window.DEMO_SEATS = {"DAPIL 1":8,"DAPIL 2":8,"DAPIL 3":7,"DAPIL 4":7};

window.DEMO_PARTY_ORDER = ["PKB","GERINDRA","PDIP","GOLKAR","NASDEM","BURUH","GELORA","PKS","PKN","HANURA","GARUDA","PAN","PBB","DEMOKRAT","PSI","PERINDO","PPP","UMMAT"];

window.DEMO_PARTY_COLORS = {"PKB":"#00a650","GERINDRA":"#b22222","PDIP":"#cc0000","GOLKAR":"#f1c40f","NASDEM":"#1a233a","BURUH":"#e67e22","GELORA":"#00bfff","PKS":"#f39c12","PKN":"#c0392b","HANURA":"#d35400","GARUDA":"#e62a2a","PAN":"#2980b9","PBB":"#006400","DEMOKRAT":"#2c3e50","PSI":"#e74c3c","PERINDO":"#3498db","PPP":"#27ae60","UMMAT":"#000000"};

window.DEMO_KPU_SAINTE_OFFICIAL = {
      "DAPIL 1": {
        label: "KOTA GORONTALO 1",
        seats: 8,
        rows: [
          {partai:"PKB", nama:"Partai Kebangkitan Bangsa", suara:690},
          {partai:"GERINDRA", nama:"Partai Gerakan Indonesia Raya", suara:2786},
          {partai:"PDIP", nama:"Partai Demokrasi Indonesia Perjuangan", suara:2172},
          {partai:"GOLKAR", nama:"Partai Golongan Karya", suara:8982},
          {partai:"NASDEM", nama:"Partai NasDem", suara:3914},
          {partai:"BURUH", nama:"Partai Buruh", suara:40},
          {partai:"GELORA", nama:"Partai Gelombang Rakyat Indonesia", suara:44},
          {partai:"PKS", nama:"Partai Keadilan Sejahtera", suara:2129},
          {partai:"PKN", nama:"Partai Kebangkitan Nusantara", suara:13},
          {partai:"HANURA", nama:"Partai Hati Nurani Rakyat", suara:1600},
          {partai:"GARUDA", nama:"Partai Garda Republik Indonesia", suara:8},
          {partai:"PAN", nama:"Partai Amanat Nasional", suara:2881},
          {partai:"PBB", nama:"Partai Bulan Bintang", suara:7},
          {partai:"DEMOKRAT", nama:"Partai Demokrat", suara:2751},
          {partai:"PSI", nama:"Partai Solidaritas Indonesia", suara:144},
          {partai:"PERINDO", nama:"Partai Perindo", suara:625},
          {partai:"PPP", nama:"Partai Persatuan Pembangunan", suara:5517},
          {partai:"UMMAT", nama:"Partai Ummat", suara:5}
        ]
      },
      "DAPIL 2": {
        label: "KOTA GORONTALO 2",
        seats: 8,
        rows: [
          {partai:"PKB", nama:"Partai Kebangkitan Bangsa", suara:317},
          {partai:"GERINDRA", nama:"Partai Gerakan Indonesia Raya", suara:3538},
          {partai:"PDIP", nama:"Partai Demokrasi Indonesia Perjuangan", suara:2936},
          {partai:"GOLKAR", nama:"Partai Golongan Karya", suara:7465},
          {partai:"NASDEM", nama:"Partai NasDem", suara:3460},
          {partai:"BURUH", nama:"Partai Buruh", suara:29},
          {partai:"GELORA", nama:"Partai Gelombang Rakyat Indonesia", suara:23},
          {partai:"PKS", nama:"Partai Keadilan Sejahtera", suara:1388},
          {partai:"PKN", nama:"Partai Kebangkitan Nusantara", suara:16},
          {partai:"HANURA", nama:"Partai Hati Nurani Rakyat", suara:1522},
          {partai:"GARUDA", nama:"Partai Garda Republik Indonesia", suara:15},
          {partai:"PAN", nama:"Partai Amanat Nasional", suara:3122},
          {partai:"PBB", nama:"Partai Bulan Bintang", suara:9},
          {partai:"DEMOKRAT", nama:"Partai Demokrat", suara:3879},
          {partai:"PSI", nama:"Partai Solidaritas Indonesia", suara:73},
          {partai:"PERINDO", nama:"Partai Perindo", suara:69},
          {partai:"PPP", nama:"Partai Persatuan Pembangunan", suara:3143},
          {partai:"UMMAT", nama:"Partai Ummat", suara:10}
        ]
      },
      "DAPIL 3": {
        label: "KOTA GORONTALO 3",
        seats: 7,
        rows: [
          {partai:"PKB", nama:"Partai Kebangkitan Bangsa", suara:263},
          {partai:"GERINDRA", nama:"Partai Gerakan Indonesia Raya", suara:3312},
          {partai:"PDIP", nama:"Partai Demokrasi Indonesia Perjuangan", suara:2816},
          {partai:"GOLKAR", nama:"Partai Golongan Karya", suara:3068},
          {partai:"NASDEM", nama:"Partai NasDem", suara:4581},
          {partai:"BURUH", nama:"Partai Buruh", suara:22},
          {partai:"GELORA", nama:"Partai Gelombang Rakyat Indonesia", suara:25},
          {partai:"PKS", nama:"Partai Keadilan Sejahtera", suara:1188},
          {partai:"PKN", nama:"Partai Kebangkitan Nusantara", suara:82},
          {partai:"HANURA", nama:"Partai Hati Nurani Rakyat", suara:1308},
          {partai:"GARUDA", nama:"Partai Garda Republik Indonesia", suara:18},
          {partai:"PAN", nama:"Partai Amanat Nasional", suara:1861},
          {partai:"PBB", nama:"Partai Bulan Bintang", suara:123},
          {partai:"DEMOKRAT", nama:"Partai Demokrat", suara:1340},
          {partai:"PSI", nama:"Partai Solidaritas Indonesia", suara:103},
          {partai:"PERINDO", nama:"Partai Perindo", suara:111},
          {partai:"PPP", nama:"Partai Persatuan Pembangunan", suara:7194},
          {partai:"UMMAT", nama:"Partai Ummat", suara:6}
        ]
      },
      "DAPIL 4": {
        label: "KOTA GORONTALO 4",
        seats: 7,
        rows: [
          {partai:"PKB", nama:"Partai Kebangkitan Bangsa", suara:2163},
          {partai:"GERINDRA", nama:"Partai Gerakan Indonesia Raya", suara:2431},
          {partai:"PDIP", nama:"Partai Demokrasi Indonesia Perjuangan", suara:3018},
          {partai:"GOLKAR", nama:"Partai Golongan Karya", suara:3460},
          {partai:"NASDEM", nama:"Partai NasDem", suara:2436},
          {partai:"BURUH", nama:"Partai Buruh", suara:28},
          {partai:"GELORA", nama:"Partai Gelombang Rakyat Indonesia", suara:166},
          {partai:"PKS", nama:"Partai Keadilan Sejahtera", suara:1084},
          {partai:"PKN", nama:"Partai Kebangkitan Nusantara", suara:14},
          {partai:"HANURA", nama:"Partai Hati Nurani Rakyat", suara:1230},
          {partai:"GARUDA", nama:"Partai Garda Republik Indonesia", suara:12},
          {partai:"PAN", nama:"Partai Amanat Nasional", suara:2618},
          {partai:"PBB", nama:"Partai Bulan Bintang", suara:131},
          {partai:"DEMOKRAT", nama:"Partai Demokrat", suara:4598},
          {partai:"PSI", nama:"Partai Solidaritas Indonesia", suara:82},
          {partai:"PERINDO", nama:"Partai Perindo", suara:65},
          {partai:"PPP", nama:"Partai Persatuan Pembangunan", suara:5374},
          {partai:"UMMAT", nama:"Partai Ummat", suara:14}
        ]
      }
    };

window.DEMO_CALEG_TERPILIH_2019 = [
      {dapil:"DAPIL 1",partai:"PDIP",no:1,nama:"Hi. ARISTON TILAMEO",suara:1111},{dapil:"DAPIL 1",partai:"GOLKAR",no:5,nama:"SELVI MANTU, SH",suara:1234},{dapil:"DAPIL 1",partai:"PAN",no:5,nama:"HERIYANTO THALIB",suara:1056},{dapil:"DAPIL 1",partai:"HANURA",no:5,nama:"TIEN SUHARTI MOBILIU, SE",suara:1340},{dapil:"DAPIL 1",partai:"DEMOKRAT",no:1,nama:"MUCKSIN BREKAT, SH",suara:1379},
      {dapil:"DAPIL 2",partai:"GERINDRA",no:2,nama:"MASNI DUBAILI",suara:1831},{dapil:"DAPIL 2",partai:"PDIP",no:2,nama:"SUPANGKAT RAMADHAN HN, S.KM",suara:1264},{dapil:"DAPIL 2",partai:"GOLKAR",no:1,nama:"RISMAN TAHA",suara:3161},{dapil:"DAPIL 2",partai:"PPP",no:2,nama:"ARIFIN MIOLO",suara:2105},{dapil:"DAPIL 2",partai:"PAN",no:2,nama:"HERMAN HALUTI",suara:2300},{dapil:"DAPIL 2",partai:"DEMOKRAT",no:1,nama:"ERMAN LATJENGKE",suara:2393},
      {dapil:"DAPIL 3",partai:"GERINDRA",no:5,nama:"SYAMSIA MOHI",suara:1084},{dapil:"DAPIL 3",partai:"PDIP",no:1,nama:"Hi. DARMAWAN DUMING, S.IP",suara:2035},{dapil:"DAPIL 3",partai:"GOLKAR",no:2,nama:"HARDI SIDIKI",suara:1213},{dapil:"DAPIL 3",partai:"PPP",no:1,nama:"MOH. RIVAI BUKUSU",suara:2846},{dapil:"DAPIL 3",partai:"PPP",no:3,nama:"Hj. LENY ONTALU, SE",suara:1935},{dapil:"DAPIL 3",partai:"PAN",no:1,nama:"H. ALWI PODUNGGE",suara:2124},{dapil:"DAPIL 3",partai:"HANURA",no:1,nama:"Hi. EKWAN AHMAD, SH",suara:2940},{dapil:"DAPIL 3",partai:"DEMOKRAT",no:1,nama:"SYAFRUDIN JUNAIDI",suara:2708},
      {dapil:"DAPIL 4",partai:"GERINDRA",no:2,nama:"ANDI HELDA M. NYIWI, SE",suara:990},{dapil:"DAPIL 4",partai:"GOLKAR",no:6,nama:"MARYAM M. UMADJI",suara:3170},{dapil:"DAPIL 4",partai:"GOLKAR",no:5,nama:"SUCIPTO KADIR",suara:1801},{dapil:"DAPIL 4",partai:"PPP",no:1,nama:"ROLLY KADULLAH",suara:1506},{dapil:"DAPIL 4",partai:"PAN",no:2,nama:"Hi. SYAMSUDIN UMAR, S.IP",suara:1266},{dapil:"DAPIL 4",partai:"DEMOKRAT",no:1,nama:"JEMMY MAMANGKEY",suara:2005}
    ];
