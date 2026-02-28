/* ═══════════════════════════════════════
   GIGVAULT V2 — APP LOGIC
   MetaMask wallet = identity
   ═══════════════════════════════════════ */
(function () {
    'use strict';

    /* ═══ STATE ═══ */
    const state = {
        wallet: null,
        role: null,
        balance: '1.85',
        jobs: [
            { id: 1, title: 'Smart Contract Audit', date: '25 Feb 2026', budget: '0.5', apps: 3, status: 'active', freelancer: '0x4B2a...cD34', desc: 'Thorough security audit of DeFi lending protocol. Cover reentrancy, overflow, access control. Deliver report with severity classifications.', skills: ['Solidity', 'Security', 'DeFi'], timeline: '3 days', deadline: '10 Mar 2026', submitted: true, submissionNote: 'Audit complete — found 2 critical issues and 4 medium. Full report attached in the delivery link below.', submittedAt: '28 Feb 2026, 11:42 AM', deliveryLink: 'https://docs.gigvault.xyz/audit-report-v1' },
            { id: 2, title: 'NFT Marketplace Frontend', date: '24 Feb 2026', budget: '1.2', apps: 5, status: 'open', freelancer: null, desc: 'Build a fully functional NFT marketplace frontend using React and Web3.js. Must support wallet connect, minting, listing, and auction.', skills: ['React', 'Web3.js', 'UI/UX'], timeline: '2 weeks', deadline: '15 Mar 2026', submitted: false, submissionNote: '', submittedAt: '', deliveryLink: '' },
            { id: 3, title: 'Brand Identity Design', date: '22 Feb 2026', budget: '0.3', apps: 2, status: 'complete', freelancer: '0x2C8d...fE56', desc: 'Full brand identity for a DeFi protocol. Logo, color palette, typography, social assets.', skills: ['Design', 'Figma', 'Branding'], timeline: '5 days', deadline: '28 Feb 2026', submitted: false, submissionNote: '', submittedAt: '', deliveryLink: '' },
        ],
        browseJobs: [
            { id: 10, title: 'DeFi Dashboard Design', client: '0x9F1e...aB78', desc: 'Design a complete analytics dashboard for a DeFi protocol including charts, wallet stats, and transaction history. Figma deliverables required.', skills: ['Figma', 'UI Design', 'DeFi'], timeline: '1 week', deadline: '10 Mar 2026', budget: '0.7', applicants: 4 },
            { id: 11, title: 'Tokenomics Whitepaper', client: '0xA3d2...cC91', desc: 'Research and write a comprehensive tokenomics whitepaper for a new L2 protocol. Include supply mechanics, vesting schedules, and economic models.', skills: ['Research', 'Writing', 'Tokenomics'], timeline: '5 days', deadline: '05 Mar 2026', budget: '0.4', applicants: 2 },
            { id: 12, title: 'Monad Indexer Integration', client: '0x7b44...dF23', desc: 'Build a custom blockchain indexer for Monad testnet. Index events from multiple contracts, store in PostgreSQL, expose GraphQL API.', skills: ['Node.js', 'PostgreSQL', 'GraphQL', 'Monad'], timeline: '2 weeks', deadline: '20 Mar 2026', budget: '2.0', applicants: 1 },
            { id: 13, title: 'Discord Bot for DAO', client: '0xE2f1...8A45', desc: 'Build a Discord bot for a DAO that handles proposal notifications, vote reminders, treasury updates, and member verification via wallet connect.', skills: ['Discord.js', 'Node.js', 'Web3'], timeline: '4 days', deadline: '08 Mar 2026', budget: '0.6', applicants: 6 },
        ],
        applications: [
            { wallet: '0x4B2a...cD34', balance: '3.24 MON', msg: 'I have audited 12+ DeFi protocols. My last audit found a critical reentrancy bug saving $2M. I will deliver a full report within 48 hours with PoC exploits for each finding.', date: '26 Feb 2026', skills: ['Solidity', 'Security', 'DeFi'], accepted: false },
            { wallet: '0xF9c3...7E12', balance: '0.88 MON', msg: 'Certified smart contract auditor with 2 years experience. I specialize in DeFi protocols and have worked with top protocols on Ethereum and Polygon.', date: '26 Feb 2026', skills: ['Solidity', 'Security'], accepted: false },
            { wallet: '0xD1a5...90Bb', balance: '5.10 MON', msg: 'Security researcher and bug bounty hunter. I will provide a comprehensive audit including automated tool results (Slither, Mythril) and manual review.', date: '27 Feb 2026', skills: ['Solidity', 'DeFi', 'Audit'], accepted: false },
        ],
        myApplications: [
            { jobTitle: 'Smart Contract Audit', clientWallet: '0x7A3f...eB91', budget: '0.5', status: 'accepted', appliedDate: '26 Feb 2026' },
            { jobTitle: 'DeFi Dashboard Design', clientWallet: '0x9F1e...aB78', budget: '0.7', status: 'pending', appliedDate: '27 Feb 2026' },
        ],
        currentJobDetail: null,
        currentApplyJob: null,
        linkedFreelancer: null,
        linkedAmount: null,
    };

    /* ═══ SCREENS MAP ═══ */
    const S = {
        landing: document.getElementById('s-landing'),
        walletConnect: document.getElementById('s-wallet'),
        clientDash: document.getElementById('s-client-dash'),
        postJob: document.getElementById('s-post-job'),
        applications: document.getElementById('s-applications'),
        freelancerDash: document.getElementById('s-freelancer-dash'),
        activeJob: document.getElementById('s-active-job'),
        approveWork: document.getElementById('s-approve-work'),
        release: document.getElementById('s-release'),
        success: document.getElementById('s-success'),
    };

    function showScreen(name) {
        Object.values(S).forEach(s => { if (s) { s.classList.remove('active'); } });
        if (S[name]) {
            S[name].classList.add('active');
            window.scrollTo(0, 0);
            setTimeout(() => animateFadeUps(S[name]), 60);
        }
    }

    function animateFadeUps(container) {
        container.querySelectorAll('.fade-up:not(.vis)').forEach((el, i) => {
            setTimeout(() => el.classList.add('vis'), 55 * i);
        });
    }

    /* ═══ TRUNCATE WALLET ═══ */
    function trunc(addr) {
        if (!addr || addr.length < 10) return addr;
        return addr.slice(0, 6) + '...' + addr.slice(-4);
    }
    function truncFull(addr) { // already truncated format passthrough
        return addr;
    }

    /* ═══ UPDATE ALL WALLET DISPLAYS ═══ */
    function updateWalletUI() {
        const w = state.wallet || '0x----...----';
        const t = trunc(w);
        document.querySelectorAll('[data-wallet]').forEach(el => { el.textContent = t; });
        document.querySelectorAll('[data-balance]').forEach(el => { el.textContent = state.balance + ' MON'; });
        document.querySelectorAll('[data-role-badge]').forEach(el => {
            el.textContent = state.role ? state.role.toUpperCase() : '';
        });
    }

    /* ═══ LANDING PAGE ═══ */
    // CTA buttons → wallet connect
    document.getElementById('btn-client-cta')?.addEventListener('click', () => {
        state.role = 'client';
        showScreen('walletConnect');
        updateRoleCardUI();
    });
    document.getElementById('btn-freelancer-cta')?.addEventListener('click', () => {
        state.role = 'freelancer';
        showScreen('walletConnect');
        updateRoleCardUI();
    });
    document.getElementById('btn-connect-nav')?.addEventListener('click', () => showScreen('walletConnect'));

    /* ═══ WALLET CONNECT SCREEN ═══ */
    const mmBtn = document.getElementById('btn-metamask');
    const connectedState = document.getElementById('connected-state');
    const connectingState = document.getElementById('connecting-state');
    const roleStep = document.getElementById('role-step');
    const btnEnter = document.getElementById('btn-enter');

    mmBtn?.addEventListener('click', simulateMetaMask);

    function simulateMetaMask() {
        mmBtn.textContent = 'Connecting...';
        mmBtn.disabled = true;
        mmBtn.style.opacity = '0.7';
        setTimeout(() => {
            state.wallet = '0x7A3fB2d9eE4C1a8b3F7d2E5c9A1b4D8eaF6eB91';
            connectedState.style.display = 'flex';
            connectingState.style.display = 'none';
            document.getElementById('connected-addr').textContent = trunc(state.wallet);
            roleStep.style.display = 'block';
            roleStep.classList.add('vis');
            updateWalletUI();
        }, 1400);
    }

    // Role selection
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            roleCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.role = card.dataset.role;
            document.querySelectorAll('[data-role-badge]').forEach(el => el.textContent = state.role.toUpperCase());
            btnEnter?.classList.add('ready');
        });
    });

    function updateRoleCardUI() {
        if (state.role) {
            roleCards.forEach(c => { if (c.dataset.role === state.role) c.classList.add('selected'); });
            btnEnter?.classList.add('ready');
        }
    }

    btnEnter?.addEventListener('click', () => {
        if (!state.wallet) { simulateMetaMask(); return; }
        if (!state.role) return;
        updateWalletUI();
        showScreen(state.role === 'client' ? 'clientDash' : 'freelancerDash');
        renderClientDash();
        renderFreelancerDash();
    });

    /* ═══ CLIENT DASHBOARD ═══ */
    function renderClientDash() {
        const list = document.getElementById('client-job-list');
        if (!list) return;
        list.innerHTML = state.jobs.map(j => `
      <div class="job-card fade-up">
        <div class="jc-info">
          <div class="jc-title">${j.title}</div>
          <div class="jc-date">${j.date}</div>
        </div>
        <span class="jc-budget">${j.budget} MON</span>
        ${j.apps > 0 ? `<span class="app-count">${j.apps} applied</span>` : ''}
        <span class="badge badge-${j.status}">${j.status.toUpperCase()}</span>
        ${j.apps > 0 && j.status === 'open' ? `<button class="btn-sm btn-primary" onclick="openApplications(${j.id})">VIEW APPLICATIONS</button>` : ''}
        ${j.status === 'active' && j.submitted ? `<button class="btn-sm btn-gold" onclick="goApproveWork(${j.id})">REVIEW WORK ⚡</button>` : ''}
      </div>`).join('');
        setTimeout(() => animateFadeUps(document.getElementById('s-client-dash')), 80);
    }
    window.openApplications = function (id) {
        state.currentJobDetail = state.jobs.find(j => j.id === id);
        renderApplications();
        showScreen('applications');
    };
    window.goApproveWork = function (id) {
        state.currentJobDetail = state.jobs.find(j => j.id === id);
        renderApproveWork();
        showScreen('approveWork');
    };

    /* ═══ CLIENT SIDEBAR NAV ═══ */
    document.querySelectorAll('[data-nav-client]').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('[data-nav-client]').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            const nav = el.dataset.navClient;
            if (nav === 'overview') { showScreen('clientDash'); renderClientDash(); }
            else if (nav === 'post') showScreen('postJob');
            else if (nav === 'applications') showScreen('applications');
        });
    });

    /* ═══ FREELANCER SIDEBAR NAV ═══ */
    document.querySelectorAll('[data-nav-fl]').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('[data-nav-fl]').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            const nav = el.dataset.navFl;
            if (nav === 'overview') { showScreen('freelancerDash'); renderFreelancerDash(); }
            else if (nav === 'browse') { showScreen('freelancerDash'); renderFreelancerDash(); }
            else if (nav === 'active') { openActiveJob(state.myApplications[0]); }
        });
    });

    /* ═══ FAB ═══ */
    document.getElementById('fab-post')?.addEventListener('click', () => showScreen('postJob'));

    /* ═══ POST JOB FORM ═══ */
    const pv = {
        title: document.getElementById('pv-title'),
        client: document.getElementById('pv-client'),
        desc: document.getElementById('pv-desc'),
        skills: document.getElementById('pv-skills'),
        budget: document.getElementById('pv-budget'),
        timeline: document.getElementById('pv-timeline'),
        deadline: document.getElementById('pv-deadline'),
        lockAmount: document.getElementById('lock-amount'),
    };

    function updatePreview() {
        const title = document.getElementById('f-title')?.value;
        const desc = document.getElementById('f-desc')?.value;
        const budget = document.getElementById('f-budget')?.value;
        const timeline = document.getElementById('f-timeline')?.value;
        const deadline = document.getElementById('f-deadline')?.value;

        if (pv.title) pv.title.textContent = title || 'Job Title';
        if (pv.client) pv.client.textContent = 'Posted by: ' + trunc(state.wallet || '0x7A3f...eB91');
        if (pv.desc) pv.desc.textContent = desc || 'Job description will appear here...';
        if (pv.budget) pv.budget.textContent = (budget || '0') + ' MON';
        if (pv.timeline) pv.timeline.querySelector('span') && (pv.timeline.querySelector('span').textContent = timeline || '—');
        if (pv.deadline) pv.deadline.querySelector('span') && (pv.deadline.querySelector('span').textContent = deadline || '—');
        if (pv.lockAmount) pv.lockAmount.textContent = (budget || '0') + ' MON';
        document.getElementById('lock-amount-display') && (document.getElementById('lock-amount-display').textContent = (budget || '0') + ' MON');
    }

    ['f-title', 'f-desc', 'f-budget', 'f-timeline', 'f-deadline'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updatePreview);
    });

    // Tag input
    const tagContainer = document.getElementById('tag-container');
    const tagInput = document.getElementById('tag-input');
    if (tagInput) {
        tagInput.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim()) {
                e.preventDefault();
                addTag(tagInput.value.trim());
                tagInput.value = '';
                updatePreviewSkills();
            }
        });
    }
    function addTag(text) {
        const pill = document.createElement('span');
        pill.className = 't-pill';
        pill.innerHTML = `${text}<span class="rm" data-tag="${text}">×</span>`;
        pill.querySelector('.rm').addEventListener('click', () => { pill.remove(); updatePreviewSkills(); });
        tagContainer?.insertBefore(pill, tagInput);
    }
    function updatePreviewSkills() {
        const tags = [...(tagContainer?.querySelectorAll('.t-pill') || [])].map(p => p.textContent.replace('×', '').trim());
        if (pv.skills) pv.skills.innerHTML = tags.map(t => `<span class="skill-pill">${t}</span>`).join('');
    }

    document.getElementById('btn-post-job')?.addEventListener('click', () => {
        const title = document.getElementById('f-title')?.value;
        const budget = document.getElementById('f-budget')?.value;
        if (!title || !budget) { alert('Please fill in at least a job title and budget.'); return; }
        const newJob = {
            id: Date.now(), title, date: 'Today', budget,
            apps: 0, status: 'open', freelancer: null,
            desc: document.getElementById('f-desc')?.value || '',
            skills: [...(tagContainer?.querySelectorAll('.t-pill') || [])].map(p => p.textContent.replace('×', '').trim()),
            timeline: document.getElementById('f-timeline')?.value || '',
            deadline: document.getElementById('f-deadline')?.value || '',
            submitted: false, submissionNote: '', submittedAt: '', deliveryLink: ''
        };
        state.jobs.unshift(newJob);
        showScreen('clientDash');
        renderClientDash();
        // Reset form
        ['f-title', 'f-desc', 'f-budget', 'f-timeline', 'f-deadline'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
        });
        tagContainer?.querySelectorAll('.t-pill').forEach(p => p.remove());
        updatePreview();
    });

    /* ═══ APPLICATIONS SCREEN ═══ */
    function renderApplications() {
        const title = document.getElementById('apps-job-title');
        if (title && state.currentJobDetail) title.textContent = state.currentJobDetail.title;
        const list = document.getElementById('app-list');
        if (!list) return;
        list.innerHTML = state.applications.map((a, i) => `
      <div class="app-card fade-up" id="app-${i}">
        <div class="app-wallet">${a.wallet}</div>
        <div class="app-bal">Balance: ${a.balance}</div>
        <div class="app-msg">"${a.msg}"</div>
        <div class="app-skills">${a.skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}</div>
        <div class="app-meta">Applied: ${a.date}</div>
        <div class="app-actions">
          <button class="btn-primary btn-sm" onclick="acceptApplication(${i})">ACCEPT ✅</button>
          <button class="btn-muted btn-sm" onclick="declineApplication(${i})">DECLINE ✗</button>
        </div>
      </div>`).join('');
        setTimeout(() => animateFadeUps(document.getElementById('s-applications')), 80);
    }

    window.acceptApplication = function (idx) {
        const app = state.applications[idx];
        state.linkedFreelancer = app.wallet;
        state.linkedAmount = state.currentJobDetail?.budget || '0.5';
        showLinkModal(app.wallet, state.linkedAmount);
    };
    window.declineApplication = function (idx) {
        const card = document.getElementById('app-' + idx);
        if (card) { card.style.opacity = '0.3'; card.style.pointerEvents = 'none'; }
    };

    function showLinkModal(freelancerWallet, amount) {
        const modal = document.getElementById('link-modal');
        if (!modal) return;
        document.getElementById('link-client-addr').textContent = trunc(state.wallet || '0x7A3f...eB91');
        document.getElementById('link-fl-addr').textContent = freelancerWallet;
        document.getElementById('link-amount').textContent = amount + ' MON';
        modal.classList.add('open');
    }

    document.getElementById('btn-link-confirm')?.addEventListener('click', () => {
        document.getElementById('link-modal').classList.remove('open');
        showScreen('clientDash');
        renderClientDash();
    });
    document.getElementById('link-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('link-modal')) document.getElementById('link-modal').classList.remove('open');
    });
    document.querySelector('#link-modal .modal-close')?.addEventListener('click', () => {
        document.getElementById('link-modal').classList.remove('open');
    });

    /* ═══ FREELANCER DASHBOARD ═══ */
    function renderFreelancerDash() {
        const grid = document.getElementById('browse-grid');
        if (!grid) return;
        grid.innerHTML = state.browseJobs.map(j => `
      <div class="browse-card fade-up">
        <div class="bc-title">${j.title}</div>
        <div class="bc-client">Posted by: ${j.client}</div>
        <div class="bc-desc">${j.desc}</div>
        <div class="skills-row">${j.skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}</div>
        <div class="bc-meta">⏱ ${j.timeline} &nbsp;&nbsp; 📅 ${j.deadline}</div>
        <div class="bc-applicants">${j.applicants} applied</div>
        <div class="bc-budget">${j.budget} MON</div>
        <button class="btn-outline btn-full" onclick="openApplyModal(${j.id})">APPLY NOW ⚡</button>
      </div>`).join('');

        // My applications
        const myAppList = document.getElementById('my-app-list');
        if (myAppList) {
            myAppList.innerHTML = state.myApplications.map(a => `
        <div class="job-card fade-up">
          <div class="jc-info">
            <div class="jc-title">${a.jobTitle}</div>
            <div class="jc-date">Applied: ${a.appliedDate} · Client: ${a.clientWallet}</div>
          </div>
          <span class="jc-budget">${a.budget} MON</span>
          <span class="badge ${a.status === 'accepted' ? 'badge-active' : 'badge-open'}">${a.status.toUpperCase()}</span>
          ${a.status === 'accepted' ? `<button class="btn-primary btn-sm" onclick="openActiveJobByTitle('${a.jobTitle}')">VIEW JOB</button>` : ''}
        </div>`).join('');
        }
        setTimeout(() => animateFadeUps(document.getElementById('s-freelancer-dash')), 80);
    }

    /* Apply modal */
    window.openApplyModal = function (id) {
        const job = state.browseJobs.find(j => j.id === id);
        state.currentApplyJob = job;
        const modal = document.getElementById('apply-modal');
        if (!modal) return;
        document.getElementById('apply-job-title').textContent = job.title;
        document.getElementById('apply-wallet-show').textContent = trunc(state.wallet || '0xFREELANCER...ADDR');
        document.getElementById('apply-msg').value = '';
        modal.classList.add('open');
    };
    document.getElementById('btn-send-application')?.addEventListener('click', () => {
        const msg = document.getElementById('apply-msg')?.value;
        if (!msg) return;
        state.myApplications.unshift({
            jobTitle: state.currentApplyJob?.title,
            clientWallet: state.currentApplyJob?.client,
            budget: state.currentApplyJob?.budget,
            status: 'pending',
            appliedDate: 'Today'
        });
        document.getElementById('apply-modal').classList.remove('open');
        renderFreelancerDash();
    });
    document.getElementById('apply-modal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('apply-modal')) document.getElementById('apply-modal').classList.remove('open');
    });
    document.querySelector('#apply-modal .modal-close')?.addEventListener('click', () => {
        document.getElementById('apply-modal').classList.remove('open');
    });

    /* ═══ ACTIVE JOB (FREELANCER) ═══ */
    function openActiveJob(appJob) {
        const jobData = state.jobs[0]; // smart contract audit = accepted job
        state.currentJobDetail = jobData;
        renderActiveJob(jobData);
        showScreen('activeJob');
    }
    window.openActiveJobByTitle = function (title) {
        const jobData = state.jobs.find(j => j.title === title) || state.jobs[0];
        state.currentJobDetail = jobData;
        renderActiveJob(jobData);
        showScreen('activeJob');
    };

    function renderActiveJob(job) {
        const el = id => document.getElementById(id);
        if (el('aj-title')) el('aj-title').textContent = job.title;
        if (el('aj-client-addr')) el('aj-client-addr').textContent = '0x7A3f...eB91';
        if (el('aj-desc')) el('aj-desc').textContent = job.desc;
        if (el('aj-skills')) el('aj-skills').innerHTML = job.skills.map(s => `<span class="skill-pill">${s}</span>`).join('');
        if (el('aj-deadline')) el('aj-deadline').innerHTML = `DUE: <span>${job.deadline}</span>`;
        if (el('aj-timeline')) el('aj-timeline').innerHTML = `TIMELINE: <span>${job.timeline}</span>`;
        if (el('aj-amount')) el('aj-amount').textContent = job.budget + ' MON';
    }

    document.getElementById('btn-submit-work')?.addEventListener('click', () => {
        const notes = document.getElementById('delivery-notes')?.value;
        if (!notes) { alert('Please add delivery notes before submitting.'); return; }
        if (state.currentJobDetail) {
            state.currentJobDetail.submitted = true;
            state.currentJobDetail.submissionNote = notes;
            state.currentJobDetail.submittedAt = 'Just now';
        }
        showScreen('freelancerDash');
        renderFreelancerDash();
    });

    /* ═══ APPROVE WORK (CLIENT) ═══ */
    function renderApproveWork() {
        const job = state.currentJobDetail;
        if (!job) return;
        const el = id => document.getElementById(id);
        if (el('aw-job-title')) el('aw-job-title').textContent = job.title;
        if (el('aw-fl-wallet')) el('aw-fl-wallet').textContent = job.freelancer || '0x4B2a...cD34';
        if (el('aw-submission')) el('aw-submission').textContent = job.submissionNote || 'Work submitted. Please review the delivery.';
        if (el('aw-submitted-at')) el('aw-submitted-at').textContent = job.submittedAt || '';
        if (el('aw-delivery-link') && job.deliveryLink) {
            el('aw-delivery-link').textContent = job.deliveryLink;
            el('aw-delivery-link').href = job.deliveryLink;
        }
    }

    document.getElementById('btn-request-revision')?.addEventListener('click', () => {
        showScreen('clientDash');
        renderClientDash();
    });

    document.getElementById('btn-approve-work')?.addEventListener('click', () => {
        const job = state.currentJobDetail;
        state.linkedFreelancer = job?.freelancer || '0x4B2a...cD34';
        state.linkedAmount = job?.budget || '0.5';
        renderReleaseScreen();
        showScreen('release');
    });

    /* ═══ RELEASE SCREEN ═══ */
    function renderReleaseScreen() {
        const el = id => document.getElementById(id);
        const clientAddr = trunc(state.wallet || '0x7A3f...eB91');
        const flAddr = state.linkedFreelancer;
        const amount = state.linkedAmount;
        if (el('r-client')) el('r-client').textContent = clientAddr;
        if (el('r-freelancer')) el('r-freelancer').textContent = flAddr;
        if (el('r-amount')) el('r-amount').textContent = amount + ' MON';
        if (el('r-amount-lbl')) el('r-amount-lbl').textContent = 'Releasing ' + amount + ' MON';
    }

    document.getElementById('btn-cancel-release')?.addEventListener('click', () => {
        showScreen('clientDash');
        renderClientDash();
    });

    document.getElementById('btn-confirm-release')?.addEventListener('click', () => {
        renderSuccessScreen();
        showScreen('success');
        launchConfetti();
    });

    /* ═══ SUCCESS ═══ */
    function renderSuccessScreen() {
        const el = id => document.getElementById(id);
        if (el('succ-amount')) el('succ-amount').textContent = state.linkedAmount + ' MON';
        if (el('succ-addr')) el('succ-addr').textContent = state.linkedFreelancer;
    }
    document.getElementById('btn-back-from-success')?.addEventListener('click', () => {
        showScreen('clientDash');
        renderClientDash();
    });
    document.getElementById('tx-copy')?.addEventListener('click', () => {
        const hash = '0xab34ef9c2d8a71b3f0e56789012345678901234567890abcdef';
        navigator.clipboard?.writeText(hash);
        const el = document.getElementById('tx-copy');
        const orig = el.textContent;
        el.textContent = '✅ Copied!';
        setTimeout(() => { el.textContent = orig; }, 1800);
    });

    /* ═══ STATS COUNTER ═══ */
    function animateCounters(container) {
        container.querySelectorAll('[data-count]').forEach(el => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            const isFloat = el.dataset.count.includes('.');
            const dur = 1600;
            const start = performance.now();
            const tick = now => {
                const p = Math.min((now - start) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                el.textContent = (isFloat ? (ease * target).toFixed(1) : Math.floor(ease * target)) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }

    const statObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { animateCounters(e.target); statObs.unobserve(e.target); } });
    }, { threshold: 0.3 });
    document.querySelectorAll('.stats-bar, .stats-row').forEach(el => statObs.observe(el));

    /* ═══ SCROLL FADE ═══ */
    const fadeObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

    /* ═══ CONFETTI ═══ */
    function launchConfetti() {
        const canvas = document.getElementById('confetti');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const colors = ['#FF6B35', '#FF4500', '#FF8C42', '#FFB347', '#FF2D00', '#F5E6D3'];
        const particles = Array.from({ length: 140 }, () => ({
            x: canvas.width / 2 + (Math.random() - .5) * 300,
            y: canvas.height * .45,
            vx: (Math.random() - .5) * 18,
            vy: Math.random() * -20 - 6,
            w: Math.random() * 9 + 4, h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * 360, rs: (Math.random() - .5) * 14,
            grav: .28 + Math.random() * .16, opacity: 1
        }));
        let frame = 0;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            particles.forEach(p => {
                if (p.opacity <= 0) return; alive = true;
                p.x += p.vx; p.vy += p.grav; p.y += p.vy;
                p.rot += p.rs; p.opacity -= .007;
                ctx.save(); ctx.translate(p.x, p.y);
                ctx.rotate(p.rot * Math.PI / 180);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            frame++;
            if (alive && frame < 280) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        requestAnimationFrame(draw);
    }

    /* ═══ DATA-GOTO NAV ═══ */
    document.querySelectorAll('[data-goto]').forEach(el => {
        el.addEventListener('click', () => {
            const t = el.dataset.goto;
            showScreen(t);
            if (t === 'clientDash') renderClientDash();
            if (t === 'freelancerDash') renderFreelancerDash();
        });
    });

    /* ═══ INIT ═══ */
    showScreen('landing');
    updateWalletUI();
    setTimeout(() => animateFadeUps(document.getElementById('s-landing')), 100);

})();
