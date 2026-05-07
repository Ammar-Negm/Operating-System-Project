const COLORS = ['#5a7a9e','#4e8c6e','#8c6a3f','#6e5a9e','#8c4e6e','#3f7a8c','#7a8c3f','#6a6a6a'];

let procs = [
  {id:0,name:'P1',at:0,bt:6},
  {id:1,name:'P2',at:1,bt:3},
  {id:2,name:'P3',at:2,bt:8},
  {id:3,name:'P4',at:3,bt:4},
  {id:4,name:'P5',at:4,bt:2},
];
let nid = 5;

function colorOf(i){ return COLORS[i % COLORS.length]; }

function colMap(){
  const m = {};
  procs.forEach((p,i) => m[p.name] = colorOf(i));
  return m;
}

// Render input table
function renderTable(){
  const tb = document.getElementById('ptbody');
  const addBtn = document.getElementById('add-btn');
  tb.innerHTML = '';
  procs.forEach((p,i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="dot" style="background:${colorOf(i)}"></span></td>
      <td><input value="${p.name}" onchange="procs[${i}].name=this.value"></td>
      <td><input type="number" value="${p.at}" min="0" onchange="procs[${i}].at=+this.value"></td>
      <td><input type="number" value="${p.bt}" min="1" onchange="procs[${i}].bt=+this.value"></td>
      <td><button class="del-btn" onclick="procs.splice(${i},1);renderTable()">x</button></td>`;
    tb.appendChild(tr);
  });
  addBtn.disabled = procs.length >= 8;
  addBtn.title = procs.length >= 8 ? 'Maximum 8 processes' : '';
}

function addProc(){
  if(procs.length >= 8) return;
  procs.push({id:nid++, name:'P'+(procs.length+1), at:0, bt:4});
  renderTable();
}

function resetAll(){
  procs = [
    {id:0,name:'P1',at:0,bt:6},
    {id:1,name:'P2',at:1,bt:3},
    {id:2,name:'P3',at:2,bt:8},
    {id:3,name:'P4',at:3,bt:4},
    {id:4,name:'P5',at:4,bt:2},
  ];
  nid = 5;
  document.getElementById('q').value = 3;
  document.getElementById('qerr').textContent = '';
  document.getElementById('q').classList.remove('err');
  renderTable();
  ['rr-gantt','sjf-gantt'].forEach(id =>
    document.getElementById(id).innerHTML = '<div class="empty">Run to see chart</div>'
  );
  ['rr-tbl','sjf-tbl'].forEach(id =>
    document.getElementById(id).innerHTML = '<div class="empty">-</div>'
  );
  document.getElementById('cmp-panel').style.display = 'none';
  document.getElementById('qlabel').textContent = 3;
}

// Round Robin
function simRR(ps, q){
  const jobs = ps.map(p => ({...p, rem:p.bt, ct:0, rt:-1}))
                 .sort((a,b) => a.at - b.at);
  let t=0, gantt=[], queue=[], idx=0, done=0;

  const enq = time => {
    while(idx < jobs.length && jobs[idx].at <= time)
      queue.push(jobs[idx++]);
  };

  enq(0);
  if(!queue.length && jobs.length){ t = jobs[0].at; enq(t); }

  while(done < jobs.length){
    if(!queue.length){
      // CPU idle: jump to next arriving process
      const next = jobs.find(j => j.rem > 0 && j.at > t);
      if(!next) break;
      t = next.at;
      enq(t);
    }
    const cur = queue.shift();
    // Record first response time
    if(cur.rt === -1) cur.rt = t - cur.at;

    const run = Math.min(q, cur.rem);
    gantt.push({name:cur.name, s:t, e:t+run});
    t += run;
    cur.rem -= run;
    enq(t);

    if(cur.rem > 0){
      queue.push(cur);       // re-queue: not finished
    } else {
      cur.ct = t;            // completed
      done++;
    }
  }
  return {gantt, jobs};
}

// SJF Non-Preemptive
function simSJF(ps){
  const jobs = ps.map(p => ({...p, ct:0, rt:-1, done:false}));
  let t=0, gantt=[], done=0;

  while(done < jobs.length){
    const avail = jobs.filter(j => j.at <= t && !j.done);

    if(!avail.length){
      // CPU idle: jump to earliest arriving remaining process
      const next = jobs.filter(j => !j.done).sort((a,b) => a.at - b.at)[0];
      if(!next) break;
      t = next.at;
      continue;
    }

    // Pick shortest burst; tiebreak by earliest arrival
    avail.sort((a,b) => a.bt === b.bt ? a.at - b.at : a.bt - b.bt);
    const cur = avail[0];

    cur.rt = t - cur.at;
    gantt.push({name:cur.name, s:t, e:t + cur.bt});
    t += cur.bt;
    cur.ct = t;
    cur.done = true;
    done++;
  }
  return {gantt, jobs};
}

// Draw Gantt chart with time axis
function drawGantt(containerId, gantt, cm){
  const el = document.getElementById(containerId);
  if(!gantt.length){ el.innerHTML = '<div class="empty">No data</div>'; return; }

  const total = gantt[gantt.length-1].e;
  // Keep the chart compact while leaving room for short process labels.
  const U = Math.max(18, Math.min(34, 520 / total));

  // Collect all time tick points
  const ticks = [...new Set(gantt.flatMap(g => [g.s, g.e]))].sort((a,b) => a-b);

  let bars = '<div class="gantt-bars">';
  gantt.forEach(g => {
    const w = (g.e - g.s) * U;
    const col = cm[g.name] || '#555';
    bars += `<div class="gbar"
      style="width:${w}px;background:${col}"
      title="${g.name}: ${g.s} to ${g.e} (${g.e-g.s} units)"
    >${w >= 16 ? g.name : ''}</div>`;
  });
  bars += '</div>';

  let tickHtml = `<div class="gticks" style="width:${total*U}px">`;
  ticks.forEach(t => {
    tickHtml += `<div class="gtick" style="left:${t*U}px">${t}</div>`;
  });
  tickHtml += '</div>';

  el.innerHTML = `<div class="gantt-inner">${bars}${tickHtml}</div>`;
}

// Draw metrics table (WT, TAT, RT, CT + averages)
function drawMetrics(containerId, jobs, procOrder){
  const sorted = [...jobs].sort((a,b) =>
    procOrder.indexOf(a.name) - procOrder.indexOf(b.name)
  );
  const n = sorted.length;
  let sumWT=0, sumTAT=0, sumRT=0;

  let rows = sorted.map(j => {
    const tat = j.ct - j.at;
    const wt  = tat  - j.bt;
    const rt  = j.rt;
    sumWT += wt; sumTAT += tat; sumRT += rt;
    return `<tr>
      <td>${j.name}</td>
      <td>${j.at}</td>
      <td>${j.bt}</td>
      <td>${j.ct}</td>
      <td>${tat}</td>
      <td>${wt}</td>
      <td>${rt}</td>
    </tr>`;
  }).join('');

  const avgWT  = (sumWT/n).toFixed(2);
  const avgTAT = (sumTAT/n).toFixed(2);
  const avgRT  = (sumRT/n).toFixed(2);

  document.getElementById(containerId).innerHTML = `
    <table class="metrics">
      <thead>
        <tr><th>P</th><th>AT</th><th>BT</th><th>CT</th><th>TAT</th><th>WT</th><th>RT</th></tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="avg-row">
          <td colspan="4">Average</td>
          <td>${avgTAT}</td>
          <td>${avgWT}</td>
          <td>${avgRT}</td>
        </tr>
      </tbody>
    </table>`;

  return { avgWT:+avgWT, avgTAT:+avgTAT, avgRT:+avgRT };
}

// Main run function with validation
function run(){
  const qInput = document.getElementById('q');
  const qErr   = document.getElementById('qerr');
  const q      = parseInt(qInput.value);

  // Validate quantum
  if(isNaN(q) || q < 1){
    qErr.textContent = 'Quantum must be a positive integer';
    qInput.classList.add('err');
    return;
  }
  qErr.textContent = '';
  qInput.classList.remove('err');

  // Validate processes
  if(procs.length < 1){
    alert('Add at least one process.');
    return;
  }
  for(let i=0; i<procs.length; i++){
    if(procs[i].at < 0){ alert(`${procs[i].name}: Arrival Time must be >= 0`); return; }
    if(procs[i].bt < 1){ alert(`${procs[i].name}: Burst Time must be >= 1`);   return; }
  }

  document.getElementById('qlabel').textContent = q;

  const cm        = colMap();
  const procOrder = procs.map(p => p.name);

  const rr  = simRR(procs, q);
  const sjf = simSJF(procs);

  drawGantt('rr-gantt',  rr.gantt,  cm);
  drawGantt('sjf-gantt', sjf.gantt, cm);

  const rrA  = drawMetrics('rr-tbl',  rr.jobs,  procOrder);
  const sjfA = drawMetrics('sjf-tbl', sjf.jobs, procOrder);

  drawCmp(rrA, sjfA);
}

// Init
renderTable();
