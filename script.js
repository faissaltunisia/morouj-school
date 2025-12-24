const SB_URL = 'https://vchzkeebmjqiohgoknnm.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjaHprZWVibWpxaW9oZ29rbm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzU3MjgsImV4cCI6MjA4MTcxMTcyOH0.bDIOdzhpj5M_5Hx7_SdnaBulImmFG41OKIOQGnx7FHI';
const _sb = supabase.createClient(SB_URL, SB_KEY);

let surahs = [], curG = "الصف الخامس", curS = 1, dayS = null, isWon = false;
const allG = ["الصف الخامس", "الصف السادس", "الصف السابع", "الصف الثامن", "الصف التاسع", "الصف العاشر", "الصف الحادي عشر", "الصف الثاني عشر"];

async function init() {
    const { data } = await _sb.from('surahs').select('*');
    surahs = data || [];
    document.getElementById('g-list').innerHTML = allG.map(g => `<div class="grade-item" onclick="changeG('${g}')">${g}</div>`).join('');
    render();
}

function changeG(g) { curG = g; hideM('m-grades'); render(); }
function setSem(s) { curS = s; document.getElementById('s1').className = s===1?'sem-btn active':'sem-btn'; document.getElementById('s2').className = s===2?'sem-btn active':'sem-btn'; render(); }

function render() {
    document.getElementById('cur-g-label').innerText = curG;
    const list = surahs.filter(s => s.grade === curG && s.semester == curS);
    document.getElementById('grid').innerHTML = list.map(s => `
        <div class="surah-card" onclick="play('${s.video_path}','${s.title}', false)">
            <i class="fa fa-play-circle" style="color:var(--accent); font-size:1.7rem; margin-bottom:8px; display:block;"></i>
            <p style="font-size:0.85rem; font-weight:bold;">${s.title}</p>
        </div>
    `).join('');
    dayS = list[new Date().getDate() % list.length] || list[0]; 
    if(dayS) document.getElementById('ch-title').innerText = dayS.title;
}

function play(url, title, isCh) {
    const v = document.getElementById('v-vid');
    const y = document.getElementById('v-yt');
    const hud = document.getElementById('p-hud');
    document.getElementById('p-lay').style.display = 'flex';
    document.getElementById('v-name').innerText = title;
    v.pause(); v.src = ""; v.style.display = "none";
    y.src = ""; y.style.display = "none";
    hud.style.display = isCh ? 'block' : 'none';

    if(url.includes('youtube') || url.includes('youtu.be')) {
        let id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
        y.style.display = 'block';
        y.src = `https://www.youtube.com/embed/${id}?autoplay=1&controls=${isCh?0:1}&rel=0`;
        if(isCh) setTimeout(() => { if(!isWon) { isWon = true; document.getElementById('dot').style.display = 'block'; } }, 30000);
    } else {
        v.style.display = 'block'; v.controls = !isCh; v.src = url; v.load(); v.play();
        v.ontimeupdate = () => {
            if(isCh && v.duration) {
                let p = Math.floor((v.currentTime / v.duration) * 100);
                document.getElementById('p-fill').style.width = p+'%';
                document.getElementById('p-text').innerText = p+'%';
                if(p >= 90 && !isWon) { isWon = true; document.getElementById('dot').style.display = 'block'; }
            }
        };
    }
}

function startCh() { if(dayS) play(dayS.video_path, dayS.title, true); }
function openPrize() { if(isWon) showM('m-win'); else showM('m-locked'); }
function closeV() { document.getElementById('v-vid').pause(); document.getElementById('v-yt').src = ""; document.getElementById('p-lay').style.display = 'none'; }
function showM(id) { document.getElementById(id).style.display = 'flex'; }
function hideM(id) { document.getElementById(id).style.display = 'none'; }

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js'); });
}
init();
