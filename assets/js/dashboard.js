document.addEventListener("DOMContentLoaded", function() {

    const CONFIG = window.DEMO_PORTAL_CONFIG;
    const DAPIL_MAP = window.DEMO_DAPIL_MAP;
    const SEATS = window.DEMO_SEATS;
    const PARTY_ORDER = window.DEMO_PARTY_ORDER;
    const PARTY_COLORS = window.DEMO_PARTY_COLORS;
    const KPU_SAINTE_OFFICIAL = window.DEMO_KPU_SAINTE_OFFICIAL;
    const CALEG_TERPILIH_2019 = window.DEMO_CALEG_TERPILIH_2019;









    const $ = (id) => document.getElementById(id);
    const fmt = (n) => (n===null || n===undefined || Number.isNaN(Number(n))) ? "-" : Number(n).toLocaleString("id-ID");
    const num = (v) => (v===null || v===undefined || v==="" || Number.isNaN(Number(v))) ? 0 : Number(v);
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
    const isAll = (v) => !v || v === "Semua";
    const pct = (a,b,dec=0) => b ? (a/b*100).toFixed(dec).replace(".",",") : "0";
    const titleCase = (s) => String(s || "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    function cleanName(name) {
      let s = String(name || "").trim();
      if (!s) return "-";

      // Rapikan spasi dan koma.
      s = s.replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();

      // Hilangkan gelar di awal nama.
      // Contoh: Hi., Hj., H., Ha., Dr., Dra., Drs., Ir., Prof., Capt.
      let before = "";
      while (before !== s) {
        before = s;
        s = s.replace(/^\s*(?:H\.?|HI\.?|HJ\.?|HA\.?|HAJI|HAJJAH|DR\.?|DRS\.?|DRA\.?|IR\.?|PROF\.?|CAPT\.?)\s+/i, "");
      }

      // Jika ada koma, bagian setelah koma umumnya adalah gelar.
      // Contoh: "SAMSUDIN UMAR, S. I. P." -> "SAMSUDIN UMAR"
      if (s.includes(",")) {
        s = s.split(",")[0].trim();
      }

      // Hilangkan gelar/sertifikasi di akhir nama tanpa koma.
      // Termasuk: S.Mn, S.Pdk, S.Pd.K, S.I.P, S.I.Kom, S.E, S.H, S.T,
      // S.Ag, S.Ak, S.Kep, S.Pt, M.M, M.H, M.Si, M.A.P, M.Kn, M.Pd,
      // M.T, M.Mar, A.Md, A.Md.Ak, A.Ma.Ak, CCPS, CATS, dan variasinya.
      before = "";
      while (before !== s) {
        before = s;
        s = s
          .replace(/\s+(?:S\.?\s?E\.?|SE|S\.?\s?H\.?|SH|S\.?\s?T\.?|ST|S\.?\s?P\.?|SP|S\.?\s?M\.?|SM|S\.?\s?MN\.?|SMN|S\.?\s?AG\.?|SAG|S\.?\s?AK\.?|SAK|S\.?\s?KEP\.?|SKEP|S\.?\s?PT\.?|SPT|S\.?\s?I\.?\s?P\.?|SIP|S\.?\s?I\.?\s?KOM\.?|SIKOM|S\.?\s?KOM\.?|SKOM|S\.?\s?KM\.?|SKM|S\.?\s?SOS\.?|SSOS|S\.?\s?PD\.?\s?K\.?|S\.?\s?PDK\.?|SPDK|S\.?\s?PD\.?\s?I\.?|S\.?\s?PDI\.?|SPDI|S\.?\s?PD\.?|SPD|S\.?\s?SI\.?|SSI|M\.?\s?M\.?|MM|M\.?\s?H\.?|MH|M\.?\s?SI\.?|MSI|M\.?\s?AP\.?|MAP|M\.?\s?KOM\.?|MKOM|M\.?\s?KN\.?|MKN|M\.?\s?PD\.?|MPD|M\.?\s?P\.?|MP|M\.?\s?T\.?|MT|M\.?\s?MAR\.?|MMAR|A\.?\s?MD\.?\s?AK\.?|AMDAK|A\.?\s?MD\.?|AMD|A\.?\s?MA\.?\s?AK\.?|AMAAK|CCPS|C\.?\s?C\.?\s?P\.?\s?S\.?|CATS|C\.?\s?A\.?\s?T\.?\s?S\.?)\.?$/i, "")
          .replace(/\s*,\s*$/g, "");
      }

      return s.replace(/\s+/g, " ").trim();
    }

    const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9 ]/g," ").replace(/\s+/g," ").trim();
    const tpsNum = (s) => String(parseInt(String(s || "0").replace(/\D/g,"") || "0",10));

    let DB24 = null, DB19 = null, DB14 = null;
    let charts = {};
    let issueRows = [], issuePage = 1, activeTab = "beranda";
    let calegTpsTrackerRows = [];
    let wilayahDetailRows = [], wilayahDetailPage = 1, wilayahDetailColspan = 6;
    const wilayahDetailPageSize = 10;

    function setStatus(text, kind) {
      $("badgeStatus").className = "pill " + (kind || "");
      $("badgeStatus").innerHTML = "<i class='fa-solid fa-database'></i> " + esc(text);
    }

    function fillSelect(id, values, labelAll, selected) {
      const el = $(id);
      if (!el) return;
      const cur = selected !== undefined ? selected : el.value;
      let html = labelAll ? `<option value="Semua">${labelAll}</option>` : "";
      html += values.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
      el.innerHTML = html;
      if (Array.from(el.options).some(o => o.value === cur)) el.value = cur;
    }

    function normalizeLocationText(s) {
      let raw = String(s || "").toUpperCase().replace(/\s+/g," ").trim();
      let m = raw.match(/^(.+?)\s*-\s*TPS\s*0*(\d+)$/);
      if (m) return `${m[1].trim()} - TPS ${parseInt(m[2],10)}`;
      return raw;
    }

    function prep2024(raw) {
      const kecToDapil = {};
      Object.keys(DAPIL_MAP).forEach(d => DAPIL_MAP[d].forEach(k => kecToDapil[k] = d));
      const locIndex = {};
      (raw.master_wilayah_tps || []).forEach(w => {
        const kec = String(w.nama_kec || "").toUpperCase();
        const kel = String(w.nama_kel || "").toUpperCase();
        const tps = tpsNum(w.nomor_tps);
        const dapil = kecToDapil[kec] || "";
        const key1 = normalizeLocationText(`${kel} - TPS ${tps}`);
        const key2 = normalizeLocationText(`${kel} - TPS ${String(w.nomor_tps)}`);
        const obj = {dapil, kec, kel, tps, lokasi:`${kel} - TPS ${tps}`};
        locIndex[key1] = obj; locIndex[key2] = obj;
      });
      raw._tx = (raw.rekap_suara_transaksi || []).map(t => {
        const loc = locIndex[normalizeLocationText(t.lokasi_tps_teks)] || {};
        return {
          ...t,
          suara: num(t.jumlah_suara),
          partai: t.kode_partai || t.partai || "",
          ent: t.jenis_entitas || "",
          nama: t.id_atau_nama_entitas || "",
          no: num(t.no_urut),
          dapil: t.dapil || loc.dapil || "",
          kec: loc.kec || "",
          kel: loc.kel || "",
          tps: loc.tps || "",
          lokasi: t.lokasi_tps_teks || loc.lokasi || ""
        };
      });
      raw._caleg = (raw.master_caleg || []).map(c => ({...c, key:`${c.dapil}|${c.partai}|${c.no_urut}`}));
      raw._partaiOrder = {};
      (raw.master_partai || []).forEach(p => raw._partaiOrder[p.kode_partai] = num(p.nomor_urut_kpu));
      return raw;
    }

    function matchScope(t, f={}) {
      if (!isAll(f.dapil) && t.dapil !== f.dapil) return false;
      if (!isAll(f.kec) && t.kec !== f.kec) return false;
      if (!isAll(f.kel) && t.kel !== f.kel) return false;
      if (!isAll(f.tps) && t.tps !== f.tps) return false;
      return true;
    }

    function scopeTx(f={}, kind=null) {
      return (DB24?._tx || []).filter(t => (!kind || t.ent === kind) && matchScope(t,f));
    }

    function totalSah(f={}) {
      return scopeTx(f,"total_semua").reduce((a,t)=>a+t.suara,0);
    }

    function partyTotals(f={}) {
      const m = {};
      scopeTx(f,"total_partai").forEach(t => { if(t.partai) m[t.partai] = (m[t.partai] || 0) + t.suara; });
      return m;
    }

    function partyRanking(f={}) {
      const m = partyTotals(f);
      return Object.entries(m).map(([partai,suara]) => ({partai,suara,order:DB24?._partaiOrder?.[partai] || 999}))
        .sort((a,b)=>b.suara-a.suara || a.order-b.order);
    }

    function candidateRows(f={}, partai=null, caleg=null) {
      const rows = {};
      scopeTx(f,"caleg").forEach(t => {
        if (partai && t.partai !== partai) return;
        if (caleg && !(t.dapil === caleg.dapil && t.partai === caleg.partai && String(t.no) === String(caleg.no))) return;
        const key = `${t.dapil}|${t.partai}|${t.no}`;
        const master = (DB24?._caleg || []).find(c => c.dapil === t.dapil && c.partai === t.partai && String(c.no_urut) === String(t.no));
        if (!rows[key]) rows[key] = {key,dapil:t.dapil,partai:t.partai,no:t.no,nama:(master && master.nama_caleg) || t.nama,suara:0};
        rows[key].suara += t.suara;
      });
      return Object.values(rows).sort((a,b)=>b.suara-a.suara || a.dapil.localeCompare(b.dapil) || a.partai.localeCompare(b.partai) || a.no-b.no);
    }

    function tpsSummaries(f={}) {
      const map = {};
      scopeTx(f).forEach(t => {
        if (!t.lokasi) return;
        if (!map[t.lokasi]) map[t.lokasi] = {lokasi:t.lokasi,dapil:t.dapil,kec:t.kec,kel:t.kel,tps:t.tps,total:0,partai:{},logo:{},caleg:{}};
        if (t.ent === "total_semua") map[t.lokasi].total += t.suara;
        if (t.ent === "total_partai") map[t.lokasi].partai[t.partai] = (map[t.lokasi].partai[t.partai] || 0) + t.suara;
        if (t.ent === "partai") map[t.lokasi].logo[t.partai] = (map[t.lokasi].logo[t.partai] || 0) + t.suara;
        if (t.ent === "caleg") {
          const key = `${t.dapil}|${t.partai}|${t.no}|${t.nama}`;
          map[t.lokasi].caleg[key] = (map[t.lokasi].caleg[key] || 0) + t.suara;
        }
      });
      return Object.values(map).map(x => {
        const rank = Object.entries(x.partai).sort((a,b)=>b[1]-a[1]);
        x.winner = rank[0] ? rank[0][0] : "-";
        x.winnerVotes = rank[0] ? rank[0][1] : 0;
        x.runner = rank[1] ? rank[1][0] : "-";
        x.runnerVotes = rank[1] ? rank[1][1] : 0;
        x.margin = x.winnerVotes - x.runnerVotes;
        return x;
      }).sort((a,b)=>(a.dapil||"").localeCompare(b.dapil||"") || (a.kec||"").localeCompare(b.kec||"") || (a.kel||"").localeCompare(b.kel||"") || num(a.tps)-num(b.tps));
    }

    function destroyChart(id){ if(charts[id]){charts[id].destroy(); charts[id]=null;} }
    function barChart(id, labels, data, label, colors, horizontal=false) {
      destroyChart(id);
      const el = $(id); if(!el) return;
      charts[id] = new Chart(el.getContext("2d"), {
        type:"bar",
        data:{labels,datasets:[{label:label||"Suara",data,backgroundColor:colors || labels.map(l=>PARTY_COLORS[l] || "#94a3b8"),borderRadius:4}]},
        options:{
          indexAxis: horizontal ? "y" : "x",
          responsive:true,maintainAspectRatio:false,
          plugins:{
            legend:{display:false},
            datalabels:{
              display:true,
              color:"#020617",
              backgroundColor:"rgba(255,255,255,.92)",
              borderColor:"#cbd5e1",
              borderWidth:1,
              borderRadius:4,
              padding:4,
              font:{size:10,weight:"900"},
              anchor:"end",
              align:function(ctx){ return horizontal ? "right" : "top"; },
              offset:4,
              clamp:true,
              formatter:function(value){ return fmt(value); }
            },
            tooltip:{callbacks:{label:(ctx)=>`${ctx.dataset.label}: ${fmt(ctx.raw)}`}}
          },
          scales:{
            x:{
              grid:{display:horizontal},
              ticks:{
                font:{weight:"bold",size:10},
                callback:function(value){ return horizontal ? fmt(value) : this.getLabelForValue(value); }
              }
            },
            y:{
              ticks:{font:{weight:"bold",size:10}, callback:function(value){ return horizontal ? this.getLabelForValue(value) : fmt(value); }},
              grace:"18%"
            }
          }
        }
      });
    }
    function doughnutChart(id, labels, data) {
      destroyChart(id);
      const el = $(id); if(!el) return;
      charts[id] = new Chart(el.getContext("2d"), {
        type:"doughnut",
        data:{labels,datasets:[{data,backgroundColor:labels.map(l=>PARTY_COLORS[l] || "#94a3b8"),borderWidth:2,borderColor:"#fff"}]},
        options:{responsive:true,maintainAspectRatio:false,cutout:"55%",plugins:{legend:{position:"bottom",labels:{font:{weight:"bold"}}},datalabels:{color:"#020617",backgroundColor:"rgba(255,255,255,.92)",borderColor:"#cbd5e1",borderWidth:1,borderRadius:4,padding:4,font:{size:11,weight:"900"},formatter:(v)=>v>0?fmt(v):""}}}
      });
    }

    function allocateDapil(dapil) {
      const seats = SEATS[dapil] || 0;
      const votes = partyTotals({dapil});
      let qs = [];
      Object.entries(votes).forEach(([p,v]) => {
        for(let d=1; d<=seats*2+1; d+=2) qs.push({partai:p,score:v/d,votes:v,divisor:d,dapil});
      });
      qs.sort((a,b)=>b.score-a.score);
      const picked = qs.slice(0,seats);
      const seatCounts = {};
      picked.forEach(q => seatCounts[q.partai] = (seatCounts[q.partai] || 0) + 1);

      // Pasangkan caleg terpilih dengan skor Sainte-Laguë partainya.
      // Jika satu partai mendapat 2 kursi di dapil yang sama:
      // caleg pertama memakai suara partai / 1, caleg kedua memakai suara partai / 3.
      const elected = [];
      Object.entries(seatCounts).forEach(([p,c]) => {
        const partySeatQuotients = picked
          .filter(q => q.partai === p)
          .sort((a,b)=>a.divisor-b.divisor);

        candidateRows({dapil}, p).slice(0,c).forEach((cand,i) => {
          const q = partySeatQuotients[i] || {score:votes[p] || 0, divisor:(i*2)+1, votes:votes[p] || 0};
          elected.push({
            dapil,
            partai:p,
            nama:cand.nama,
            no:cand.no,
            suara:cand.suara,
            totalSuaraParpol:votes[p] || 0,
            suaraParpol:q.score || 0,
            divisor:q.divisor || ((i*2)+1),
            seat:i+1
          });
        });
      });
      return {dapil,seats,votes,seatCounts,elected,passing:picked[picked.length-1]?.score || 0};
    }

    function allocateSeats(dapil="Semua") {
      const dapils = isAll(dapil) ? Object.keys(SEATS) : [dapil];
      const totalSeat = {}, totalVotes = {}, elected = [];
      let passing = null, seatTotal = 0;
      dapils.forEach(d => {
        const r = allocateDapil(d);
        seatTotal += r.seats;
        Object.entries(r.seatCounts).forEach(([p,c]) => totalSeat[p] = (totalSeat[p] || 0) + c);
        Object.entries(r.votes).forEach(([p,v]) => totalVotes[p] = (totalVotes[p] || 0) + v);
        elected.push(...r.elected);
        if (r.passing && (passing === null || r.passing < passing)) passing = r.passing;
      });
      return {seatTotal,totalSeat,totalVotes,elected,passing:passing || 0};
    }

    function comparisonTotals(db, year, dapil="Semua") {
      const out = {};
      if (!db || !db.rekap_suara_transaksi) return out;
      (db.rekap_suara_transaksi || []).forEach(t => {
        if (t.jenis_entitas !== "total_partai") return;
        if (t.wilayah_tipe && t.wilayah_tipe !== "jumlah_akhir") return;
        if (!isAll(dapil) && t.dapil !== dapil) return;
        if (year === 2014 && (t.kode_partai === "PAN" || t.kode_partai === "DEMOKRAT")) return;
        if (t.jumlah_suara === null || t.jumlah_suara === undefined) return;
        if (t.status_data && String(t.status_data).toLowerCase().includes("tidak")) return;
        const p = t.kode_partai || t.partai;
        out[p] = (out[p] || 0) + num(t.jumlah_suara);
      });
      return out;
    }

    function findHistory(db, name, year) {
      if (!db || !name) return null;
      const target = norm(name);
      const map = {};
      (db.rekap_suara_transaksi || []).forEach(t => {
        if (t.jenis_entitas !== "caleg") return;
        if (t.wilayah_tipe && t.wilayah_tipe !== "jumlah_akhir") return;
        const nm = t.nama_caleg || t.id_atau_nama_entitas || "";
        if (!similarName(target, norm(nm))) return;
        const key = `${t.dapil}|${t.kode_partai}|${t.no_urut}|${nm}`;
        if (!map[key]) map[key] = {tahun:year,dapil:t.dapil,partai:t.kode_partai || t.partai,no:t.no_urut,nama:nm,suara:0};
        map[key].suara += num(t.jumlah_suara);
      });
      return Object.values(map).sort((a,b)=>b.suara-a.suara)[0] || null;
    }

    function similarName(a,b) {
      if (!a || !b) return false;
      if (a === b) return true;
      if (a.length > 8 && b.length > 8 && (a.includes(b) || b.includes(a))) return true;
      const A = a.split(" ").filter(x=>x.length>2), B = b.split(" ").filter(x=>x.length>2);
      return A.filter(x=>B.includes(x)).length >= Math.min(2,A.length,B.length);
    }

    function renderHome() {
      const total = totalSah({});
      const tps = tpsSummaries({});
      const parties = partyRanking({});
      const topCaleg = candidateRows({}).slice(0,10);
      const seats = allocateSeats("Semua");
      const seatRank = Object.entries(seats.totalSeat).sort((a,b)=>b[1]-a[1]);

      $("homeTotalSah").textContent = fmt(total);
      $("homeTps").textContent = `${fmt(tps.length)} / ${fmt(DB24?.master_wilayah_tps?.length || tps.length)}`;
      $("homeTopParty").textContent = parties[0]?.partai || "-";
      $("homeTopPartySub").textContent = parties[0] ? `${fmt(parties[0].suara)} suara` : "-";
      if (parties.length >= 3) {
        $("homeMargin").innerHTML = `<div style="font-size:19px;">1-2: ${fmt(parties[0].suara-parties[1].suara)}</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px;">1-3: ${fmt(parties[0].suara-parties[2].suara)} | 2-3: ${fmt(parties[1].suara-parties[2].suara)}</div>`;
        $("homeMarginSub").textContent = `${parties[0].partai}, ${parties[1].partai}, ${parties[2].partai}`;
      }
      $("homeSeatTop").textContent = seatRank[0] ? seatRank[0][0] : "-";
      $("homeSeatTopSub").textContent = seatRank[0] ? `${seatRank[0][1]} kursi dari ${seats.seatTotal}` : "-";
      $("homeCalegTop").textContent = topCaleg[0] ? cleanName(topCaleg[0].nama) : "-";
      $("homeCalegTopSub").textContent = topCaleg[0] ? `${topCaleg[0].partai} | ${fmt(topCaleg[0].suara)} suara` : "-";

      barChart("chartHomePartai", parties.slice(0,10).map(x=>x.partai), parties.slice(0,10).map(x=>x.suara), "Suara");
      doughnutChart("chartHomeKursi", seatRank.map(x=>x[0]), seatRank.map(x=>x[1]));
      $("homeTopCalegTable").innerHTML = topCaleg.map((c,i)=>`<tr><td><span class="badge gold">#${i+1}</span></td><td>${esc(c.dapil)}</td><td><span class="badge-partai" style="background:${PARTY_COLORS[c.partai]||'#64748b'}">${esc(c.partai)}</span></td><td>${esc(c.no)}</td><td>${esc(cleanName(c.nama))}</td><td style="text-align:right;font-weight:900;">${fmt(c.suara)}</td></tr>`).join("");
    }

    function initFilterOptions() {
      const dapils = Object.keys(SEATS);
      fillSelect("calegDapil", dapils, "Semua Dapil");
      fillSelect("wilayahDapil", dapils, "Semua Dapil");
      fillSelect("komposisiDapil", dapils, "Semua Dapil");
      fillSelect("analitikDapil", dapils, "Semua Dapil");
      fillSelect("calegPartai", PARTY_ORDER, "Pilih Partai");
      updateCalegDependent();
      updateWilayahDependent();
    }

    function updateCalegDependent(forceAll=false) {
      const dapil = $("calegDapil").value;
      const partai = $("calegPartai").value;
      const calegList = (DB24?._caleg || []).filter(c => (isAll(dapil) || c.dapil === dapil) && (!isAll(partai) && c.partai === partai));
      const calegOptions = calegList.sort((a,b)=>a.dapil_no-b.dapil_no || a.no_urut-b.no_urut).map(c => `${c.dapil}|${c.partai}|${c.no_urut}|${c.nama_caleg}`);
      const old = $("calegNama").value;
      $("calegNama").innerHTML = `<option value="Semua">${isAll(partai) ? "Pilih Partai Dulu" : "Semua Caleg"}</option>` + calegOptions.map(v => {
        const p = v.split("|");
        return `<option value="${esc(v)}">${esc(p[2]+" - "+cleanName(p[3]))}</option>`;
      }).join("");

      if (forceAll || isAll(partai)) {
        $("calegNama").value = "Semua";
      } else if (Array.from($("calegNama").options).some(o=>o.value===old)) {
        $("calegNama").value = old;
      } else {
        $("calegNama").value = "Semua";
      }

      const kecs = Array.from(new Set((DB24?.master_wilayah_tps || []).filter(w => {
        const kec = String(w.nama_kec||"").toUpperCase();
        return isAll(dapil) || DAPIL_MAP[dapil]?.includes(kec);
      }).map(w => String(w.nama_kec||"").toUpperCase()))).sort();
      fillSelect("calegKecamatan", kecs, "Semua Kecamatan");
      updateCalegKelurahan();
    }

    function updateCalegKelurahan() {
      const dapil = $("calegDapil").value, kec = $("calegKecamatan").value;
      const kels = Array.from(new Set((DB24?.master_wilayah_tps || []).filter(w => {
        const K = String(w.nama_kec||"").toUpperCase();
        return (isAll(dapil) || DAPIL_MAP[dapil]?.includes(K)) && (isAll(kec) || K === kec);
      }).map(w => String(w.nama_kel||"").toUpperCase()))).sort();
      fillSelect("calegKelurahan", kels, "Semua Kelurahan");
    }

    function selectedCaleg() {
      const v = $("calegNama").value;
      if (isAll(v)) return null;
      const [dapil,partai,no,nama] = v.split("|");
      return {dapil,partai,no:num(no),nama};
    }

    window.openCalegTpsDetail = function(index) {
      const row = calegTpsTrackerRows[index];
      const sel = selectedCaleg();
      if (!row || !sel) return;

      const topPartai = Object.entries(row.partai || {}).sort((a,b)=>b[1]-a[1]).slice(0,5);
      const internal = (row.internal || []).filter(c => c.suara > 0).slice(0,12);
      const partaiShare = row.total > 0 ? pct(row.suaraPartai, row.total, 1) : "0";
      const calegSharePartai = row.suaraPartai > 0 ? pct(row.suaraCaleg, row.suaraPartai, 1) : "0";
      const suaraLogo = row.suaraLogo || 0;
      const narasiCaleg = row.suaraCaleg > 0
        ? `<strong>${esc(cleanName(sel.nama))}</strong> memperoleh <strong>${fmt(row.suaraCaleg)} suara</strong> di TPS ini. Kontribusi ke suara ${esc(sel.partai)} di TPS ini: <strong>${calegSharePartai}%</strong>.`
        : `Caleg yang dipilih <strong>tidak memperoleh suara pribadi</strong> di TPS ini. ${suaraLogo > 0 ? `Namun terdapat <strong>${fmt(suaraLogo)} suara</strong> COBLOS PARTAI ${esc(sel.partai)}.` : `Tidak ada suara COBLOS PARTAI ${esc(sel.partai)} pada TPS ini.`}`;

      $("detailModalTitle").innerHTML = `<i class="fa-solid fa-map-location-dot"></i> Detail ${titleCase(row.kel)} - TPS ${esc(row.tps)}`;
      $("detailModalBody").innerHTML = `
        <div class="modal-stat-grid">
          <div class="modal-stat-card">
            <div class="modal-stat-title">Total Suara Sah TPS</div>
            <div class="modal-stat-value">${fmt(row.total)}</div>
          </div>
          <div class="modal-stat-card">
            <div class="modal-stat-title">Total Suara ${esc(sel.partai)}</div>
            <div class="modal-stat-value" style="color:var(--accent-primary);">${fmt(row.suaraPartai)}</div>
          </div>
          <div class="modal-stat-card">
            <div class="modal-stat-title">COBLOS PARTAI</div>
            <div class="modal-stat-value" style="color:${suaraLogo > 0 ? 'var(--warning)' : 'var(--text-muted)'};">${fmt(suaraLogo)}</div>
          </div>
          <div class="modal-stat-card">
            <div class="modal-stat-title">Suara Caleg Dipilih</div>
            <div class="modal-stat-value" style="color:${row.suaraCaleg > 0 ? 'var(--success)' : 'var(--danger)'};">${fmt(row.suaraCaleg)}</div>
          </div>
        </div>

        <div class="notice ${row.suaraCaleg > 0 ? 'success' : 'danger'}" style="margin-bottom:14px;">
          ${narasiCaleg}
          <br/>Penguasaan total ${esc(sel.partai)} terhadap suara sah TPS: <strong>${partaiShare}%</strong>.
        </div>

        <div class="modal-grid-2">
          <div class="card" style="padding:14px; box-shadow:none;">
            <div class="card-title" style="font-size:13px;">Top 5 Partai Penguasa di TPS</div>
            <div class="table-responsive">
              <table>
                <thead><tr><th>Rank</th><th>Partai</th><th style="text-align:right;">Suara</th><th>%</th></tr></thead>
                <tbody>
                  ${topPartai.map((p,i)=>`<tr>
                    <td><span class="badge">#${i+1}</span></td>
                    <td><span class="badge-partai" style="background:${PARTY_COLORS[p[0]]||'#64748b'}">${esc(p[0])}</span></td>
                    <td style="text-align:right;font-weight:900;">${fmt(p[1])}</td>
                    <td>${pct(p[1], row.total, 1)}%</td>
                  </tr>`).join("") || `<tr><td colspan="4" style="text-align:center;">Tidak ada data partai.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card" style="padding:14px; box-shadow:none;">
            <div class="card-title" style="font-size:13px;">Rincian Internal ${esc(sel.partai)}</div>
            <div class="table-responsive">
              <table>
                <thead><tr><th>Rank</th><th>No.</th><th>Nama Caleg</th><th style="text-align:right;">Suara</th></tr></thead>
                <tbody>
                  ${suaraLogo > 0 ? `<tr>
                    <td><span class="badge warn">COBLOS PARTAI</span></td>
                    <td>-</td>
                    <td><strong>COBLOS PARTAI ${esc(sel.partai)}</strong></td>
                    <td style="text-align:right;font-weight:900;color:var(--warning);">${fmt(suaraLogo)}</td>
                  </tr>` : ""}
                  ${internal.map((c,i)=>`<tr>
                    <td><span class="badge">#${i+1}</span></td>
                    <td>${esc(c.no)}</td>
                    <td>${esc(cleanName(c.nama))}</td>
                    <td style="text-align:right;font-weight:900;${String(c.no)===String(sel.no)?'color:var(--accent-primary);':''}">${fmt(c.suara)}</td>
                  </tr>`).join("") || (suaraLogo > 0 ? "" : `<tr><td colspan="4" style="text-align:center;">Tidak ada suara internal partai di TPS ini.</td></tr>`)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      $("detailModal").style.display = "flex";
    };

    function renderCalegAll(partai) {
      const f = {dapil:$("calegDapil").value,kec:$("calegKecamatan").value,kel:$("calegKelurahan").value};
      const area = `${isAll(f.dapil)?"Semua Dapil":f.dapil}${isAll(f.kec)?"":" / "+titleCase(f.kec)}${isAll(f.kel)?"":" / "+titleCase(f.kel)}`;
      const candidates = candidateRows(f, partai);
      const totalCaleg = candidates.reduce((a,x)=>a+x.suara,0);
      const suaraParpol = partyTotals(f)[partai] || 0;
      const coblosDb = scopeTx(f,"partai").filter(t => t.partai === partai).reduce((a,t)=>a+t.suara,0);
      const coblosPartai = coblosDb > 0 ? coblosDb : Math.max(0, suaraParpol - totalCaleg);
      const topCaleg = candidates[0];

      $("calegPrompt").style.display="none";
      $("calegContent").style.display="block";

      if ($("calegCardTitle1")) $("calegCardTitle1").textContent = "Total Suara Partai";
      if ($("calegCardTitle2")) $("calegCardTitle2").textContent = "Total Suara Caleg";
      if ($("calegCardTitle3")) $("calegCardTitle3").textContent = "COBLOS PARTAI";
      if ($("calegCardTitle4")) $("calegCardTitle4").textContent = isAll(f.dapil) ? "Dapil Terkuat" : "Caleg Peringkat 1";

      $("calegTotal").textContent = fmt(suaraParpol);
      $("calegArea").textContent = `${partai} | ${area}`;
      $("calegRank").textContent = fmt(totalCaleg);
      $("calegRankSub").textContent = `Akumulasi suara semua caleg ${partai}`;
      $("calegContribution").textContent = fmt(coblosPartai);
      $("calegContributionSub").textContent = `${pct(coblosPartai, suaraParpol, 1)}% dari suara ${partai}`;

      if (isAll(f.dapil)) {
        const byDapil = {};
        Object.keys(SEATS).forEach(d => byDapil[d] = partyTotals({dapil:d})[partai] || 0);
        const topD = Object.entries(byDapil).sort((a,b)=>b[1]-a[1])[0];
        $("calegHistoryStatus").textContent = topD ? topD[0] : "-";
        $("calegHistorySub").textContent = topD ? `${fmt(topD[1])} suara ${partai}` : "Belum ada data";
      } else {
        $("calegHistoryStatus").textContent = topCaleg ? cleanName(topCaleg.nama) : "-";
        $("calegHistorySub").textContent = topCaleg ? `${fmt(topCaleg.suara)} suara | ${partai}` : "Belum ada data";
      }

      // Bagan sebaran: saat Semua Caleg, yang dijumlahkan adalah suara caleg partai,
      // bukan suara satu individu.
      const sebarMode = $("calegSebaranMode") ? $("calegSebaranMode").value : "kecamatan";
      const byArea = {};
      scopeTx(f,"caleg").forEach(t => {
        if (t.partai !== partai) return;
        const key = sebarMode === "kelurahan" ? t.kel : t.kec;
        if (!key) return;
        byArea[key] = (byArea[key] || 0) + t.suara;
      });
      const sebar = Object.entries(byArea).sort((a,b)=>b[1]-a[1]);
      if ($("chartCalegSebaran") && $("chartCalegSebaran").parentElement) {
        $("chartCalegSebaran").parentElement.style.height = sebar.length > 12 ? Math.min(900, 240 + (sebar.length * 26)) + "px" : "350px";
      }
      barChart("chartCalegSebaran", sebar.map(x=>titleCase(x[0])), sebar.map(x=>x[1]), `Suara Caleg ${partai} per ${sebarMode === "kelurahan" ? "Kelurahan" : "Kecamatan"}`, null, true);

      // Bagan komparasi internal.
      barChart("chartCalegInternal", candidates.slice(0,12).map(x=>cleanName(x.nama)), candidates.slice(0,12).map(x=>x.suara), "Suara Caleg", candidates.slice(0,12).map(x=>PARTY_COLORS[x.partai] || "#94a3b8"), true);

      if ($("calegBottomTitle")) $("calegBottomTitle").innerHTML = `<i class="fa-solid fa-users"></i> ${isAll(f.dapil) ? "Daftar Caleg Partai se-Kota" : "Daftar Caleg Partai di Dapil"}`;
      if ($("calegBottomBadge")) {
        $("calegBottomBadge").className = "badge";
        $("calegBottomBadge").innerHTML = isAll(f.dapil) ? "Rekap Semua Dapil" : "Persaingan Internal";
      }
      if ($("calegBottomNote")) {
        $("calegBottomNote").textContent = isAll(f.dapil)
          ? "Mode ini menampilkan kekuatan seluruh caleg dalam satu partai di semua dapil. Peringkat ini bersifat rekap suara, bukan penetapan kursi karena kursi DPRD dihitung per dapil."
          : "Mode ini menampilkan persaingan internal caleg dalam satu partai pada dapil yang dipilih. Status Terpilih dibaca dari alokasi kursi partai berdasarkan metode Sainte-Laguë dan suara caleg tertinggi dalam partai.";
      }

      let kursiPartai = 0;
      let electedKeys = new Set();

      if (isAll(f.dapil)) {
        const alokasiSemua = allocateSeats("Semua");
        electedKeys = new Set(
          (alokasiSemua.elected || [])
            .filter(e => e.partai === partai)
            .map(e => `${e.dapil}|${e.partai}|${e.no}`)
        );
      } else {
        const alokasi = allocateDapil(f.dapil);
        kursiPartai = alokasi.seatCounts[partai] || 0;
        electedKeys = new Set(
          (alokasi.elected || [])
            .filter(e => e.partai === partai)
            .map(e => `${e.dapil}|${e.partai}|${e.no}`)
        );
      }

      const rows = candidates.map((c,i) => {
        const kontribusi = pct(c.suara, suaraParpol, 1);
        const selisihAtas = i === 0 ? "-" : fmt(candidates[i-1].suara - c.suara);
        const isTerpilih = electedKeys.has(`${c.dapil}|${c.partai}|${c.no}`);
        let status = "";
        if (isTerpilih) {
          status = "Terpilih";
        } else if (!isAll(f.dapil)) {
          status = i < Math.max(kursiPartai + 2, 3) ? "Kompetitif" : "Penopang";
        } else {
          status = c.suara >= (totalCaleg / Math.max(1,candidates.length)) ? "Unggulan" : "Penopang";
        }
        return `<tr>
          <td><span class="badge">#${i+1}</span></td>
          ${isAll(f.dapil) ? `<td>${c.dapil}</td>` : ""}
          <td>${esc(cleanName(c.nama))}</td>
          <td style="text-align:right;font-weight:900;">${fmt(c.suara)}</td>
          <td>${kontribusi}%</td>
          <td>${selisihAtas}</td>
          <td><span class="badge ${status.includes("Terpilih") || status.includes("Top") ? "success" : status.includes("Kompetitif") || status.includes("Unggulan") ? "warn" : ""}">${status}</span></td>
        </tr>`;
      }).join("");

      $("calegTpsTracker").innerHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                ${isAll(f.dapil) ? "<th>Dapil</th>" : ""}
                <th>Nama Caleg</th>
                <th style="text-align:right;">Suara</th>
                <th>Kontribusi</th>
                <th>Selisih dari Atas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="${isAll(f.dapil)?7:6}" style="text-align:center;">Tidak ada data caleg.</td></tr>`}</tbody>
          </table>
        </div>`;
    }

    function renderCaleg() {
      const partai = $("calegPartai").value;
      const sel = selectedCaleg();

      if (isAll(partai)) {
        $("calegPrompt").style.display="block";
        $("calegContent").style.display="none";
        return;
      }

      if (!sel) {
        renderCalegAll(partai);
        return;
      }

      $("calegPrompt").style.display="none"; $("calegContent").style.display="block";
      const f = {dapil:$("calegDapil").value,kec:$("calegKecamatan").value,kel:$("calegKelurahan").value};

      if ($("calegCardTitle1")) $("calegCardTitle1").textContent = "Total Suara Caleg";
      if ($("calegCardTitle2")) $("calegCardTitle2").textContent = "Peringkat Internal Partai";
      if ($("calegCardTitle3")) $("calegCardTitle3").textContent = "Kontribusi ke Partai";
      if ($("calegCardTitle4")) $("calegCardTitle4").textContent = "Riwayat Caleg";
      if ($("calegBottomTitle")) $("calegBottomTitle").innerHTML = `<i class="fa-solid fa-location-dot"></i> Pelacakan Suara per TPS`;
      if ($("calegBottomBadge")) {
        $("calegBottomBadge").className = "badge warn";
        $("calegBottomBadge").innerHTML = `<i class="fa-solid fa-hand-pointer"></i> Klik kartu TPS`;
      }
      if ($("calegBottomNote")) $("calegBottomNote").textContent = "Kartu di bawah menampilkan suara caleg pada setiap TPS dalam filter aktif. Klik salah satu TPS untuk melihat detail pop-up: total suara sah TPS, suara partai, suara caleg, top partai, dan rincian internal partai.";

      const rows = candidateRows(f, sel.partai, sel);
      const total = rows.reduce((a,x)=>a+x.suara,0);
      const internal = candidateRows(f, sel.partai);
      const rank = internal.findIndex(x => x.dapil === sel.dapil && x.partai === sel.partai && String(x.no) === String(sel.no)) + 1;
      const partaiTotal = partyTotals(f)[sel.partai] || 0;
      const area = `${isAll(f.dapil)?"Semua Dapil":f.dapil}${isAll(f.kec)?"":" / "+titleCase(f.kec)}${isAll(f.kel)?"":" / "+titleCase(f.kel)}`;
      $("calegTotal").textContent = fmt(total);
      $("calegArea").textContent = area;
      $("calegRank").textContent = rank ? `#${rank}` : "-";
      $("calegRankSub").textContent = `Dari ${internal.length} caleg ${sel.partai}`;
      $("calegContribution").textContent = `${pct(total,partaiTotal,1)}%`;
      $("calegContributionSub").textContent = `${fmt(total)} dari ${fmt(partaiTotal)} suara ${sel.partai}`;

      const terpilih = CALEG_TERPILIH_2019.find(x => similarName(norm(sel.nama), norm(x.nama)));
      const h19 = findHistory(DB19, sel.nama, 2019);
      const h14 = findHistory(DB14, sel.nama, 2014);
      if (terpilih) {
        $("calegHistoryStatus").textContent = "Petahana 2019";
        $("calegHistorySub").textContent = `${terpilih.partai} ${terpilih.dapil} | ${fmt(terpilih.suara)} suara`;
      } else if (h19) {
        $("calegHistoryStatus").textContent = "Pernah Caleg 2019";
        $("calegHistorySub").textContent = `${h19.partai} ${h19.dapil} | ${fmt(h19.suara)} suara`;
      } else if (h14) {
        $("calegHistoryStatus").textContent = "Pernah Caleg 2014";
        $("calegHistorySub").textContent = `${h14.partai} ${h14.dapil} | ${fmt(h14.suara)} suara`;
      } else {
        $("calegHistoryStatus").textContent = "Caleg Baru";
        $("calegHistorySub").textContent = "Tidak ditemukan riwayat 2014/2019";
      }

      const tpsRows = tpsSummaries(f).map(t => {
        const suaraPartai = t.partai[sel.partai] || 0;
        const internalSemua = Object.entries(t.caleg || {}).map(([key,suara]) => {
          const parts = key.split("|");
          return {dapil:parts[0], partai:parts[1], no:parts[2], nama:parts.slice(3).join("|"), suara};
        }).filter(x => x.partai === sel.partai).sort((a,b)=>b.suara-a.suara || num(a.no)-num(b.no));

        const selectedInternal = internalSemua.find(x => x.dapil === sel.dapil && String(x.no) === String(sel.no));
        const suaraCaleg = selectedInternal ? selectedInternal.suara : 0;

        const suaraLogoDb = t.logo ? (t.logo[sel.partai] || 0) : 0;
        const totalCalegInternal = internalSemua.reduce((a,x)=>a+x.suara,0);
        const suaraLogo = suaraLogoDb > 0 ? suaraLogoDb : Math.max(0, suaraPartai - totalCalegInternal);
        const internal = internalSemua.filter(x => x.suara > 0);
        return {...t, suaraCaleg, suaraPartai, suaraLogo, internal};
      }).sort((a,b)=>(a.kec||"").localeCompare(b.kec||"") || (a.kel||"").localeCompare(b.kel||"") || num(a.tps)-num(b.tps));

      calegTpsTrackerRows = tpsRows;

      const tpsRowsPositive = tpsRows.filter(x => x.suaraCaleg > 0);
      const sebarMode = $("calegSebaranMode") ? $("calegSebaranMode").value : "kecamatan";
      const byArea = {};
      tpsRowsPositive.forEach(t => {
        const key = sebarMode === "kelurahan" ? `${t.kel}` : `${t.kec}`;
        byArea[key] = (byArea[key] || 0) + t.suaraCaleg;
      });
      const sebar = Object.entries(byArea).sort((a,b)=>b[1]-a[1]);
      if ($("chartCalegSebaran") && $("chartCalegSebaran").parentElement) {
        $("chartCalegSebaran").parentElement.style.height = sebar.length > 12 ? Math.min(900, 240 + (sebar.length * 26)) + "px" : "350px";
      }
      barChart("chartCalegSebaran", sebar.map(x=>titleCase(x[0])), sebar.map(x=>x[1]), `Suara Caleg per ${sebarMode === "kelurahan" ? "Kelurahan" : "Kecamatan"}`, null, true);
      barChart("chartCalegInternal", internal.slice(0,10).map(x=>cleanName(x.nama)), internal.slice(0,10).map(x=>x.suara), "Suara", null, true);

      if (!tpsRows.length) {
        $("calegTpsTracker").innerHTML = `<div class="empty-state"><i class="fa-solid fa-map-location-dot"></i>Tidak ada data TPS pada filter ini.</div>`;
      } else {
        let html = "";
        let lastGroup = "";
        tpsRows.forEach((t,i) => {
          const group = `${t.kec}|${t.kel}`;
          if (group !== lastGroup) {
            html += `${lastGroup ? "</div>" : ""}<div class="tps-track-group-title">${titleCase(t.kec)} / ${titleCase(t.kel)}</div><div class="tps-track-grid">`;
            lastGroup = group;
          }
          html += `
            <div class="tps-track-card ${t.suaraCaleg === 0 ? 'tps-track-zero' : ''}" onclick="window.openCalegTpsDetail(${i})" title="Klik untuk melihat detail TPS">
              <div class="tps-track-title">TPS ${esc(t.tps)}</div>
              <div class="tps-track-label">Suara Caleg</div>
              <div class="tps-track-value">${fmt(t.suaraCaleg)}</div>
              <div class="tps-track-stats">
                <div>Partai<strong>${fmt(t.suaraPartai)}</strong></div>
                <div>Coblos<strong>${fmt(t.suaraLogo || 0)}</strong></div>
              </div>
            </div>
          `;
        });
        html += "</div>";
        $("calegTpsTracker").innerHTML = html;
      }
    }


    function updateWilayahDependent() {
      const dapil = $("wilayahDapil").value;
      const kecs = Array.from(new Set((DB24?.master_wilayah_tps || []).filter(w => {
        const K = String(w.nama_kec||"").toUpperCase();
        return isAll(dapil) || DAPIL_MAP[dapil]?.includes(K);
      }).map(w => String(w.nama_kec||"").toUpperCase()))).sort();
      fillSelect("wilayahKecamatan", kecs, "Semua Kecamatan");
      updateWilayahKelTps();
    }

    function updateWilayahKelTps() {
      const dapil = $("wilayahDapil").value, kec = $("wilayahKecamatan").value;
      const rows = (DB24?.master_wilayah_tps || []).filter(w => {
        const K = String(w.nama_kec||"").toUpperCase();
        return (isAll(dapil) || DAPIL_MAP[dapil]?.includes(K)) && (isAll(kec) || K === kec);
      });
      const kels = Array.from(new Set(rows.map(w => String(w.nama_kel||"").toUpperCase()))).sort();
      fillSelect("wilayahKelurahan", kels, "Semua Kelurahan");
      updateWilayahTps();
    }

    function updateWilayahTps() {
      const dapil = $("wilayahDapil").value, kec = $("wilayahKecamatan").value, kel = $("wilayahKelurahan").value;
      const rows = (DB24?.master_wilayah_tps || []).filter(w => {
        const K = String(w.nama_kec||"").toUpperCase(), L = String(w.nama_kel||"").toUpperCase();
        return (isAll(dapil) || DAPIL_MAP[dapil]?.includes(K)) && (isAll(kec) || K === kec) && (isAll(kel) || L === kel);
      });
      const tpss = Array.from(new Set(rows.map(w => tpsNum(w.nomor_tps)))).sort((a,b)=>num(a)-num(b));
      fillSelect("wilayahTps", tpss, "Semua TPS");
    }

    function setWilayahDetailRows(rows, colSpan) {
      wilayahDetailRows = rows || [];
      wilayahDetailColspan = colSpan || 6;
      wilayahDetailPage = 1;
      renderWilayahDetailPage();
    }

    function renderWilayahDetailPage() {
      const total = wilayahDetailRows.length;
      const totalPages = Math.max(1, Math.ceil(total / wilayahDetailPageSize));
      if (wilayahDetailPage < 1) wilayahDetailPage = 1;
      if (wilayahDetailPage > totalPages) wilayahDetailPage = totalPages;

      const start = (wilayahDetailPage - 1) * wilayahDetailPageSize;
      const end = start + wilayahDetailPageSize;
      const pageRows = wilayahDetailRows.slice(start, end);

      $("wilayahTableBody").innerHTML = pageRows.join("") || `<tr><td colspan="${wilayahDetailColspan}" style="text-align:center;">Tidak ada data.</td></tr>`;

      if ($("wilayahPageInfo")) {
        const startLabel = total === 0 ? 0 : start + 1;
        const endLabel = Math.min(end, total);
        $("wilayahPageInfo").textContent = `Menampilkan ${startLabel}-${endLabel} dari ${total} data | Halaman ${wilayahDetailPage}/${totalPages}`;
      }
      if ($("wilayahPrev")) $("wilayahPrev").disabled = wilayahDetailPage <= 1;
      if ($("wilayahNext")) $("wilayahNext").disabled = wilayahDetailPage >= totalPages;
    }

    function renderWilayah() {
      const f = {dapil:$("wilayahDapil").value,kec:$("wilayahKecamatan").value,kel:$("wilayahKelurahan").value,tps:$("wilayahTps").value};
      const area = `${isAll(f.dapil)?"Semua Dapil":f.dapil}${isAll(f.kec)?"":" / "+titleCase(f.kec)}${isAll(f.kel)?"":" / "+titleCase(f.kel)}${isAll(f.tps)?"":" / TPS "+f.tps}`;
      $("wilayahStatus").value = area;
      const total = totalSah(f), pr = partyRanking(f), tpss = tpsSummaries(f);
      $("wilayahTotal").textContent = fmt(total);
      $("wilayahArea").textContent = area;
      $("wilayahWinner").textContent = pr[0]?.partai || "-";
      $("wilayahWinnerSub").textContent = pr[0] ? `${fmt(pr[0].suara)} suara (${pct(pr[0].suara,total,1)}%)` : "-";
      $("wilayahMargin").textContent = pr.length>=2 ? fmt(pr[0].suara-pr[1].suara) : "-";
      $("wilayahMarginSub").textContent = pr.length>=2 ? `${pr[0].partai} unggul atas ${pr[1].partai}` : "-";
      $("wilayahTpsCount").textContent = fmt(tpss.length);
      barChart("chartWilayahPartai", pr.slice(0,10).map(x=>x.partai), pr.slice(0,10).map(x=>x.suara), "Suara");
      const cr = candidateRows(f).slice(0,10);
      barChart("chartWilayahCaleg", cr.map(x=>cleanName(x.nama)), cr.map(x=>x.suara), "Suara Caleg", cr.map(x=>PARTY_COLORS[x.partai] || "#94a3b8"), true);

      if (!isAll(f.tps)) {
        $("wilayahTableHead").innerHTML = `<tr><th>Rank</th><th>Partai</th><th style="text-align:right;">Suara</th><th>Penguasaan</th></tr>`;
        const rows = pr.map((p,i)=>`<tr><td><span class="badge">${i+1}</span></td><td><span class="badge-partai" style="background:${PARTY_COLORS[p.partai]||'#64748b'}">${p.partai}</span></td><td style="text-align:right;font-weight:900;">${fmt(p.suara)}</td><td>${pct(p.suara,total,1)}%</td></tr>`);
        setWilayahDetailRows(rows, 4);
      } else {
        $("wilayahTableHead").innerHTML = `<tr><th>Kecamatan</th><th>Kelurahan</th><th>TPS</th><th style="text-align:right;">Total Sah</th><th>Pemenang</th><th>Margin</th></tr>`;
        const rows = tpss.map(t=>`<tr><td>${titleCase(t.kec)}</td><td>${titleCase(t.kel)}</td><td>${t.tps}</td><td style="text-align:right;font-weight:900;">${fmt(t.total)}</td><td><span class="badge-partai" style="background:${PARTY_COLORS[t.winner]||'#64748b'}">${t.winner}</span></td><td>${fmt(t.margin)}</td></tr>`);
        setWilayahDetailRows(rows, 6);
      }
    }


    function romanRank(n) {
      return ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV"][n] || String(n);
    }

    function formatPembagiValue(v) {
      return Number.isInteger(v) ? fmt(v) : v.toLocaleString("id-ID", {minimumFractionDigits:2, maximumFractionDigits:2});
    }

    function kpuSainteCell(q) {
      const isWin = !!q.rank;
      const style = isWin
        ? "background:#dcfce7;color:#166534;font-weight:900;border:2px solid #22c55e;"
        : "color:#0f172a;";
      return `<td style="text-align:right;${style}">${formatPembagiValue(q.value)}</td>`;
    }

    function buildKpuSainteRows(dapil) {
      const data = KPU_SAINTE_OFFICIAL[dapil];
      if (!data) return [];
      const divisors = [1,3,5,7,9,11];
      const quotientList = [];
      data.rows.forEach(r => {
        divisors.forEach(divisor => quotientList.push({
          partai:r.partai,
          divisor,
          score:r.suara / divisor
        }));
      });
      quotientList.sort((a,b)=>b.score-a.score);
      const rankMap = {};
      quotientList.slice(0, data.seats).forEach((q,idx) => {
        rankMap[`${q.partai}|${q.divisor}`] = romanRank(idx+1);
      });

      return data.rows.map(r => {
        const q = {};
        let seats = 0;
        divisors.forEach(divisor => {
          const key = `${r.partai}|${divisor}`;
          const rank = rankMap[key] || "";
          if (rank) seats++;
          q[divisor] = {value:r.suara/divisor, rank};
        });
        return {...r, dapil, label:data.label, seats, q};
      });
    }

    function renderKpuSainteTable(dapil) {
      if (!$("kpuSainteTable")) return;

      // Tabel Sainte-Laguë resmi KPU hanya ditampilkan jika pengguna memilih dapil tertentu.
      // Saat "Semua Dapil" dipilih, tabel disembunyikan agar halaman tidak terlalu panjang.
      if (isAll(dapil)) {
        if ($("kpuSainteSection")) $("kpuSainteSection").style.display = "none";
        $("kpuSainteTable").innerHTML = "";
        return;
      }

      if ($("kpuSainteSection")) $("kpuSainteSection").style.display = "grid";
      const dapils = [dapil];
      let html = "";

      dapils.forEach(d => {
        const data = KPU_SAINTE_OFFICIAL[d];
        if (!data) return;
        html += `<tr><td colspan="10" style="background:#ffedd5;color:#7c2d12;font-weight:900;text-align:left;">${d} / ${data.label} — Jumlah Kursi: ${data.seats}</td></tr>`;
        buildKpuSainteRows(d).forEach((r, idx) => {
          html += `<tr>
            <td>${idx + 1}</td>
            <td><span class="badge-partai" style="background:${PARTY_COLORS[r.partai]||'#64748b'}">${r.nama}</span></td>
            <td style="text-align:right;font-weight:900;">${fmt(r.suara)}</td>
            ${kpuSainteCell(r.q[1])}
            ${kpuSainteCell(r.q[3])}
            ${kpuSainteCell(r.q[5])}
            ${kpuSainteCell(r.q[7])}
            ${kpuSainteCell(r.q[9])}
            ${kpuSainteCell(r.q[11])}
            <td style="font-weight:900;text-align:center;color:${r.seats>0?'#166534':'#64748b'};">${r.seats || ""}</td>
          </tr>`;
        });
      });

      $("kpuSainteTable").innerHTML = html || `<tr><td colspan="10" style="text-align:center;">Data resmi KPU tidak tersedia untuk filter ini.</td></tr>`;
    }


    function renderKomposisi() {
      const d = $("komposisiDapil").value;
      const res = allocateSeats(d);
      const seatRank = Object.entries(res.totalSeat).sort((a,b)=>b[1]-a[1]);
      const totalVotes = Object.values(res.totalVotes).reduce((a,b)=>a+b,0);
      $("kompTotalKursi").textContent = `${res.seatTotal} Kursi`;
      $("kompKursiSub").textContent = isAll(d) ? "Seluruh dapil" : d;
      $("kompTopPartai").textContent = seatRank[0]?.[0] || "-";
      $("kompTopPartaiSub").textContent = seatRank[0] ? `${seatRank[0][1]} kursi` : "-";
      $("kompPartaiLolos").textContent = `${seatRank.length} Partai`;
      $("kompPassingGrade").textContent = fmt(Math.floor(res.passing));
      doughnutChart("chartParlemen", seatRank.map(x=>x[0]), seatRank.map(x=>x[1]));

      const eff = Object.keys(res.totalVotes).map(p => {
        const suara = res.totalVotes[p] || 0, kursi = res.totalSeat[p] || 0;
        const ps = totalVotes ? suara/totalVotes*100 : 0, pk = res.seatTotal ? kursi/res.seatTotal*100 : 0;
        return {p,suara,kursi,ps,pk,gap:pk-ps};
      }).filter(x=>x.suara>0 || x.kursi>0).sort((a,b)=>b.kursi-a.kursi || b.suara-a.suara);
      barChart("chartEfisiensi", eff.map(x=>x.p), eff.map(x=>Number(x.gap.toFixed(1))), "Efisiensi poin", eff.map(x=>PARTY_COLORS[x.p]||"#94a3b8"), true);
      $("kompEfisiensiTable").innerHTML = eff.map(x=>`<tr><td><span class="badge-partai" style="background:${PARTY_COLORS[x.p]||'#64748b'}">${x.p}</span></td><td style="text-align:right;">${fmt(x.suara)}</td><td>${x.kursi}</td><td>${x.ps.toFixed(1)}%</td><td>${x.pk.toFixed(1)}%</td><td style="font-weight:900;color:${x.gap>=0?'#166534':'#b91c1c'}">${x.gap>0?"+":""}${x.gap.toFixed(1)} poin</td></tr>`).join("");
      $("kompElectedTable").innerHTML = res.elected
        .sort((a,b)=>a.dapil.localeCompare(b.dapil) || (b.suaraParpol || 0) - (a.suaraParpol || 0) || b.suara - a.suara)
        .map((e,i)=>`<tr>
          <td>${i+1}</td>
          <td>${e.dapil}</td>
          <td><span class="badge-partai" style="background:${PARTY_COLORS[e.partai]||'#64748b'}">${e.partai}</span></td>
          <td>${esc(cleanName(e.nama))}</td>
          <td style="text-align:right;font-weight:900;">${fmt(e.suara)}</td>
          <td style="text-align:right;font-weight:900;color:var(--accent-primary);">${fmt(Math.floor(e.suaraParpol || 0))}</td>
        </tr>`).join("") || `<tr><td colspan="6">Tidak ada data.</td></tr>`;
      renderKpuSainteTable(d);
    }

    function setIssueRows(rows) {
      issueRows = rows;
      issuePage = 1;
      renderIssuePage();
    }
    function renderIssuePage() {
      const total = issueRows.length, pages = Math.max(1, Math.ceil(total/10));
      if (issuePage < 1) issuePage = 1; if (issuePage > pages) issuePage = pages;
      const start = (issuePage-1)*10, end = start+10;
      $("anaIssueTable").innerHTML = issueRows.slice(start,end).join("") || `<tr><td colspan="3" style="text-align:center;">Tidak ada isu utama.</td></tr>`;
      $("anaPageInfo").textContent = `Menampilkan ${total?start+1:0}-${Math.min(end,total)} dari ${total} data | Halaman ${issuePage}/${pages}`;
      $("anaPrev").disabled = issuePage <= 1; $("anaNext").disabled = issuePage >= pages;
    }

    function renderAnalitik() {
      const d = $("analitikDapil").value;
      const f = {dapil:d};
      const total = totalSah(f), pr = partyRanking(f), tpss = tpsSummaries(f);
      const p1 = pr[0] || {partai:"-",suara:0}, p2 = pr[1] || {partai:"-",suara:0}, p3 = pr[2] || {partai:"-",suara:0};
      const margin = p1.suara - p2.suara;
      const status = total ? (margin/total <= .01 ? "Sangat Ketat" : margin/total <= .04 ? "Kompetitif" : margin/total <= .08 ? "Cukup Terbuka" : "Dominan") : "-";
      $("anaStatus").textContent = status;
      $("anaStatusSub").textContent = isAll(d) ? "Seluruh Kota Gorontalo" : d;
      $("anaMargin").textContent = fmt(margin);
      $("anaMarginSub").textContent = `${p1.partai} unggul atas ${p2.partai}`;
      const ketat = tpss.filter(x=>x.margin <= 5 && x.runner !== "-").sort((a,b)=>a.margin-b.margin);
      $("anaTpsKetat").textContent = `${ketat.length} TPS`;
      const top10Tps = tpss.slice().sort((a,b)=>b.total-a.total).slice(0,10);
      $("anaKonsentrasi").textContent = `${pct(top10Tps.reduce((a,x)=>a+x.total,0), total,1)}%`;

      const y19 = comparisonTotals(DB19,2019,d), y14 = comparisonTotals(DB14,2014,d);
      $("anaPartyTrend").innerHTML = pr.slice(0,12).map((p,i)=>{
        const v19 = y19[p.partai], v14 = y14[p.partai];
        const delta = v19===undefined ? null : p.suara-v19;
        const dText = delta===null ? "Tidak tersedia" : `${delta>0?"+":""}${fmt(delta)}`;
        return `<tr><td><span class="badge">#${i+1}</span></td><td><span class="badge-partai" style="background:${PARTY_COLORS[p.partai]||'#64748b'}">${p.partai}</span></td><td style="text-align:right;font-weight:900;">${fmt(p.suara)}</td><td>${v19===undefined?"-":fmt(v19)}</td><td>${v14===undefined?"-":fmt(v14)}</td><td style="font-weight:900;color:${delta===null?'#475569':delta>=0?'#166534':'#b91c1c'}">${dText}</td></tr>`;
      }).join("");

      const rows = [];
      ketat.slice(0,40).forEach(x => rows.push(`<tr><td><span class="badge warn">TPS Ketat</span></td><td>${esc(x.lokasi)}</td><td>${x.winner} unggul ${fmt(x.margin)} suara atas ${x.runner}.</td></tr>`));
      tpss.filter(x=>x.total && x.winnerVotes/x.total >= .50).slice(0,20).forEach(x => rows.push(`<tr><td><span class="badge success">Dominasi TPS</span></td><td>${esc(x.lokasi)}</td><td>${x.winner} menguasai ${pct(x.winnerVotes,x.total,1)}% suara sah TPS.</td></tr>`));
      setIssueRows(rows);

      $("anaConclusion").innerHTML = `<ul style="padding-left:20px;margin:0;">
        <li>Di ${isAll(d)?"seluruh Kota Gorontalo":d}, tiga partai teratas adalah <strong>${p1.partai}</strong>, <strong>${p2.partai}</strong>, dan <strong>${p3.partai}</strong>.</li>
        <li>Margin peringkat 1 dan 2 sebesar <strong style="color:var(--accent-primary);">${fmt(margin)} suara</strong>, sehingga status persaingan dibaca sebagai <strong>${status}</strong>.</li>
        <li>Terdapat <strong style="color:#d97706;">${ketat.length} TPS kompetitif ketat</strong> dengan selisih pemenang maksimal 5 suara.</li>
        <li>Data 2014 digunakan terbatas; PAN dan Demokrat 2014 tidak dimasukkan dalam tren karena data tidak lengkap.</li>
      </ul>`;
    }

    function renderAll() {
      if (!DB24) return;
      if (activeTab === "beranda") renderHome();
      if (activeTab === "caleg") renderCaleg();
      if (activeTab === "wilayah") renderWilayah();
      if (activeTab === "komposisi") renderKomposisi();
      if (activeTab === "analitik") renderAnalitik();
    }

    function openTab(tab) {
      activeTab = tab;
      document.querySelectorAll(".menu-item a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
      document.querySelectorAll(".tab-content").forEach(t => t.classList.toggle("active", t.id === "tab-" + tab));
      if (window.innerWidth <= 780) document.body.classList.remove("sidebar-open");
      setTimeout(renderAll,80);
    }

    document.querySelectorAll(".menu-item a").forEach(a => a.addEventListener("click", () => openTab(a.dataset.tab)));
    $("sidebarToggle").addEventListener("click", () => { if(window.innerWidth<=780) document.body.classList.toggle("sidebar-open"); else document.body.classList.toggle("sidebar-closed"); });
    $("mobileOverlay").addEventListener("click", () => document.body.classList.remove("sidebar-open"));
    $("detailModalClose").addEventListener("click", () => $("detailModal").style.display="none");
    $("detailModal").addEventListener("click", e => { if(e.target === $("detailModal")) $("detailModal").style.display="none"; });

    $("calegDapil").addEventListener("change", () => { updateCalegDependent(); renderCaleg(); });
    $("calegPartai").addEventListener("change", () => { updateCalegDependent(true); renderCaleg(); });
    $("calegKecamatan").addEventListener("change", () => { updateCalegKelurahan(); renderCaleg(); });
    ["calegNama","calegKelurahan"].forEach(id => $(id).addEventListener("change", renderCaleg));
    if ($("calegSebaranMode")) $("calegSebaranMode").addEventListener("change", renderCaleg);

    $("wilayahDapil").addEventListener("change", () => { updateWilayahDependent(); renderWilayah(); });
    $("wilayahKecamatan").addEventListener("change", () => { updateWilayahKelTps(); renderWilayah(); });
    $("wilayahKelurahan").addEventListener("change", () => { updateWilayahTps(); renderWilayah(); });
    $("wilayahTps").addEventListener("change", renderWilayah);
    if ($("wilayahPrev")) $("wilayahPrev").addEventListener("click", () => { wilayahDetailPage--; renderWilayahDetailPage(); });
    if ($("wilayahNext")) $("wilayahNext").addEventListener("click", () => { wilayahDetailPage++; renderWilayahDetailPage(); });

    $("komposisiDapil").addEventListener("change", renderKomposisi);
    $("analitikDapil").addEventListener("change", renderAnalitik);
    $("anaPrev").addEventListener("click", () => { issuePage--; renderIssuePage(); });
    $("anaNext").addEventListener("click", () => { issuePage++; renderIssuePage(); });

    async function fetchOptional(url) {
      try { const r = await fetch(url + "?v=" + Date.now(), {cache:"no-store"}); return r.ok ? await r.json() : null; } catch(e) { return null; }
    }

    async function init() {
      setStatus("Memuat database", "");
      try {
        const [db24, db19, db14] = await Promise.all([
          fetch(CONFIG.url2024 + "?v=" + Date.now(), {cache:"no-store"}).then(r => r.json()),
          fetchOptional(CONFIG.url2019),
          fetchOptional(CONFIG.url2014)
        ]);
        DB24 = prep2024(db24); DB19 = db19; DB14 = db14;
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = "#0f172a";
        if (window.ChartDataLabels) Chart.register(ChartDataLabels);
        initFilterOptions();
        setStatus("Database aktif", "success");
        renderHome();
      } catch(e) {
        console.error(e);
        setStatus("Database gagal dimuat", "danger");
      }
    }
    init();
  });
