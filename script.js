<script>
    const SB_URL = 'https://vchzkeebmjqiohgoknnm.supabase.co';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjaHprZWVibWpxaW9oZ29rbm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzU3MjgsImV4cCI6MjA4MTcxMTcyOH0.bDIOdzhpj5M_5Hx7_SdnaBulImmFG41OKIOQGnx7FHI';
    const _sb = supabase.createClient(SB_URL, SB_KEY);

    let surahs = [], currentGrade = "الصف الخامس", currentSem = 1, isChallenge = false, todaySurah = null, videoInstance = null, canWin = false;
    const grades = ["الصف الخامس", "الصف السادس", "الصف السابع", "الصف الثامن", "الصف التاسع", "الصف العاشر", "الصف الحادي عشر", "الصف الثاني عشر"];

    async function init() {
        try {
            const { data } = await _sb.from('surahs').select('*');
            surahs = data || [];
            document.getElementById('grades-list').innerHTML = grades.map(g => `<button class="grade-btn" onclick="setGrade('${g}')">${g}</button>`).join('');
            document.getElementById('grade-display').innerText = currentGrade;
            refreshUI();
            loadSplashScreen();
        } catch (e) { console.error("Error initializing:", e); }
    }

    function setGrade(g) {
        currentGrade = g;
        document.getElementById('grade-display').innerText = g;
        closeModal('modal-grades');
        refreshUI();
    }

    function switchSem(s) {
        currentSem = s;
        document.getElementById('sem1').className = s === 1 ? 'sem-btn active' : 'sem-btn';
        document.getElementById('sem2').className = s === 2 ? 'sem-btn active' : 'sem-btn';
        refreshUI();
    }

    function refreshUI() {
        const container = document.getElementById('surah-grid');
        const filtered = surahs.filter(s => s.grade === currentGrade && s.semester == currentSem);
        if (filtered.length === 0) {
            container.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:40px; color:#999;">لا توجد سور مضافة حالياً.</p>`;
        } else {
            container.innerHTML = filtered.map(s => `
                <div class="surah-card" onclick="playVideo('${s.video_path}', '${s.title}', false)">
                    <h3>${s.title}</h3>
                    <small style="color:var(--accent)">اضغط للبدء</small>
                </div>
            `).join('');
            todaySurah = filtered[new Date().getDate() % filtered.length];
            document.getElementById('challenge-title').innerText = todaySurah ? todaySurah.title : "...";
        }
    }

    // --- الدالة المحدثة باحترافية لتشغيل فيديوهات الوزارة ---
    function playVideo(url, title, challengeMode) {
        isChallenge = challengeMode;
        document.getElementById('player-modal').style.display = 'flex';
        document.getElementById('video-title').innerText = title;
        document.getElementById('progress-hud').style.display = challengeMode ? 'block' : 'none';
        
        const box = document.getElementById('video-box');
        box.innerHTML = "";

        // تنظيف الرابط من الفراغات
        let cleanUrl = url.trim();
        
        // ذكاء اصطناعي بسيط: إذا كان الرابط من الوزارة، نستخدمه كما هو.
        // إذا كان من Supabase، نضيف Anti-Cache لضمان التحديث.
        let finalUrl = cleanUrl;
        if (!cleanUrl.includes('moe.gov.om')) {
            finalUrl = cleanUrl.includes('?') ? `${cleanUrl}&t=${Date.now()}` : `${cleanUrl}?t=${Date.now()}`;
        }

        if(cleanUrl.includes('youtube') || cleanUrl.includes('youtu.be')) {
            let id = cleanUrl.includes('v=') ? cleanUrl.split('v=')[1].split('&')[0] : cleanUrl.split('/').pop();
            box.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            if(isChallenge) {
                let p = 0;
                if(window.ytTimer) clearInterval(window.ytTimer);
                window.ytTimer = setInterval(() => { if(p < 100) { p++; updateProgress(p); } }, 1000);
            }
        } else {
            const video = document.createElement('video');
            video.src = finalUrl;
            video.controls = true; 
            video.autoplay = true; 
            video.playsInline = true;
            video.preload = "auto"; // يسرع تشغيل فيديو الوزارة

            // في حال فشل التشفير، نحاول الرابط الأصلي بدون أي تعديلات
            video.onerror = function() {
                if (video.src !== cleanUrl) {
                    console.warn("Attempting fallback to clean URL...");
                    video.src = cleanUrl;
                }
            };

            box.appendChild(video);
            videoInstance = video;
            if(isChallenge) {
                video.ontimeupdate = () => { 
                    if(video.duration) updateProgress(Math.floor((video.currentTime / video.duration) * 100)); 
                };
            }
        }
    }

    function updateProgress(p) {
        document.getElementById('pct-text').innerText = p + '%';
        document.getElementById('fill-bar').style.width = p + '%';
        if(p >= 75 && !canWin) { 
            canWin = true; 
            document.getElementById('prize-notif').style.display = 'block'; 
        }
    }

    function closePlayer() {
        const box = document.getElementById('video-box');
        if(videoInstance) { 
            videoInstance.pause(); 
            videoInstance.removeAttribute('src'); 
            videoInstance.load(); 
            videoInstance.remove(); 
            videoInstance = null; 
        }
        box.innerHTML = "";
        if(window.ytTimer) clearInterval(window.ytTimer);
        document.getElementById('player-modal').style.display = 'none';
    }

    function openPrize() {
        const content = document.getElementById('prize-content');
        if(canWin) {
            content.innerHTML = `<div style="font-size:4rem;">🏆</div><h2>بطل المروج!</h2><p>استحققت الجائزة لإتمامك التلاوة.</p><button class="grade-btn" onclick="closeModal('modal-prize')">مبارك لك</button>`;
        } else {
            content.innerHTML = `<div style="font-size:4rem; opacity:0.2;">🔒</div><h2>الجائزة مغلقة</h2><p>أكمل 75% من التحدي أولاً.</p><button class="grade-btn" onclick="closeModal('modal-prize')">حسناً</button>`;
        }
        openModal('modal-prize');
    }

    function startChallenge() { if(todaySurah) playVideo(todaySurah.video_path, todaySurah.title, true); }
    function openModal(id) { document.getElementById(id).style.display = 'flex'; }
    function closeModal(id) { document.getElementById(id).style.display = 'none'; }
    async function loadSplashScreen() { try { const response = await fetch('splash.html'); const html = await response.text(); document.getElementById('splash-placeholder').innerHTML = html; setTimeout(() => { const splash = document.getElementById('splash-screen'); if(splash) { splash.style.opacity = '0'; setTimeout(() => splash.style.display = 'none', 800); } }, 2500); } catch (e) {} }

    init();
</script>
