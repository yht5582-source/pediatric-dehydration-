// 計算引擎測試（載入 index.html 中 /*ENGINE-START*/…/*ENGINE-END*/ 區塊）
// Run: node tests.cjs
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//);
if (!m) throw new Error('engine block not found');
const mod = { exports: {} };
new Function('module', m[1])(mod);
const PD = mod.exports;

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ✓ ' + name); }
  catch (e) { fail++; console.log('  ✗ ' + name + '\n    ' + e.message); }
}
const base = { weight: 10, bolus: 0, appearance: 0, eyes: 0, mucous: 0, tears: 0, voiding: true };
const P = o => PD.plan({ ...base, ...o });

console.log('CDS');
t('0 → 無脫水 0%', () => { const c = PD.cds(0, 0, 0, 0); assert.equal(c.level, 'none'); assert.equal(c.defaultPct, 0); });
t('1 → some 5%', () => assert.equal(PD.cds(1, 0, 0, 0).defaultPct, 5));
t('4 → some', () => assert.equal(PD.cds(1, 1, 1, 1).level, 'some'));
t('5 → 中重度 10%', () => { const c = PD.cds(2, 1, 1, 1); assert.equal(c.level, 'modsev'); assert.equal(c.defaultPct, 10); });
t('8 → 中重度', () => assert.equal(PD.cds(2, 2, 2, 2).score, 8));

console.log('Holliday-Segar');
t('5 kg → 500', () => assert.equal(PD.maintenance(5).daily, 500));
t('10 kg → 1000', () => assert.equal(PD.maintenance(10).daily, 1000));
t('15 kg → 1250', () => assert.equal(PD.maintenance(15).daily, 1250));
t('20 kg → 1500', () => assert.equal(PD.maintenance(20).daily, 1500));
t('30 kg → 1700', () => assert.equal(PD.maintenance(30).daily, 1700));
t('25 kg hourly = 1600/24', () => assert.equal(Math.round(PD.maintenance(25).hourly * 10) / 10, 66.7));
t('80 kg capped at 2400', () => { const x = PD.maintenance(80); assert.equal(x.daily, 2400); assert.ok(x.capped); });

console.log('24 小時計畫');
t('10 kg 5%: 8h 333+250, 16h 667+250', () => {
  const p = P({ appearance: 1 });
  assert.equal(p.deficit, 500);
  assert.equal(p.phases[0].volume, 583); assert.equal(p.phases[0].rate, 72.9);
  assert.equal(p.phases[1].volume, 917); assert.equal(p.phases[1].rate, 57.3);
  assert.equal(p.totalVolume, 1500);
});
t('bolus 扣除缺水', () => assert.equal(P({ appearance: 2, eyes: 2, mucous: 1, tears: 0, bolus: 200 }).remaining, 800));
t('bolus 大於缺水 → 0，不為負', () => assert.equal(P({ appearance: 1, bolus: 900 }).remaining, 0));
t('第二階段時間 8–24 hr', () => assert.equal(P({}).phases[1].range, '8–24 hr'));
t('手動 7%', () => assert.equal(P({ appearance: 1, pctOverride: '7' }).deficit, 700));
t('手動 0% 覆蓋 CDS', () => assert.equal(P({ appearance: 2, eyes: 2, mucous: 2, tears: 2, pctOverride: '0' }).deficit, 0));
t('病前體重 10.5 → 缺水 500 ml、4.8%', () => {
  const p = P({ weight: 10, preWeight: 10.5, appearance: 1 });
  assert.equal(p.deficit, 500); assert.equal(p.pct, 4.8); assert.equal(p.pctSource, '病前體重差');
});
t('病前體重 ≤ 目前 → 退回 CDS', () => assert.equal(P({ preWeight: 9, appearance: 1 }).deficit, 500));

console.log('點滴選擇 (AAP 2018 等張)');
t('原本會建議 0.33%/0.45% 的情境現在為等張', () => {
  const p = P({ appearance: 1 });
  assert.ok(/0\.9% NaCl/.test(p.fluid)); assert.ok(!/0\.45|0\.33/.test(p.fluid));
});
t('無脫水也為等張', () => assert.ok(/0\.9% NaCl/.test(P({}).fluid)));
t('未排尿不加 K', () => { const p = P({ voiding: false }); assert.equal(p.kGiven, 0); assert.ok(/暫不加 KCl/.test(p.fluid)); });
t('排尿後 K = 24h 量 × 20 mEq/L', () => assert.equal(P({ appearance: 1 }).kGiven, 30));
t('Na 給予 = 24h 量 × 154', () => assert.equal(P({ appearance: 1 }).naGiven, 231));

console.log('Bolus 建議');
t('CDS 0–4 無休克不建議 bolus', () => assert.equal(P({ appearance: 1 }).bolusAdvice, null));
t('中重度 → 20 ml/kg', () => assert.equal(P({ appearance: 2, eyes: 2, mucous: 1 }).bolusAdvice.ml, 200));
t('休克 → bolus', () => assert.equal(P({ shock: true }).bolusAdvice.ml, 200));
t('60 kg bolus 上限 1000', () => assert.equal(P({ weight: 60, shock: true }).bolusAdvice.ml, 1000));

console.log('血鈉');
t('Na 155 → 48 小時均速', () => {
  const p = P({ appearance: 1, sodium: 155 });
  assert.equal(p.hours, 48); assert.equal(p.totalVolume, 2500);
  assert.equal(p.phases[0].rate, p.phases[1].rate); assert.equal(p.phases[0].rate, 52.1);
});
t('Na 155 Na 給予量以 24h 計', () => assert.equal(P({ appearance: 1, sodium: 155 }).naGiven, 192.5));
t('Na 150 為高血鈉', () => assert.equal(PD.natremia(150), 'hyper'));
t('Na 149 等張', () => assert.equal(P({ sodium: 149 }).hours, 24));
t('Na 172 → ICU 警示', () => assert.ok(P({ sodium: 172 }).warnings.some(w => /≥170/.test(w.t))));
t('Na 122 → 3% NaCl 警示', () => assert.ok(P({ sodium: 122 }).warnings.some(w => /3% NaCl/.test(w.t))));
t('Na 128 低血鈉但無 3%', () => { const p = P({ sodium: 128 }); assert.equal(p.natremia, 'hypo'); assert.ok(!p.warnings.some(w => /3% NaCl/.test(w.t))); });

console.log('輸入驗證');
t('體重空白 → error', () => assert.equal(P({ weight: '' }).ok, false));
t('體重 0 → error', () => assert.equal(P({ weight: 0 }).ok, false));
t('體重 200 → error', () => assert.equal(P({ weight: 200 }).ok, false));
t('負 bolus → error（舊版會增加缺水量）', () => assert.equal(P({ bolus: -100 }).ok, false));
t('Na 80 → error', () => assert.equal(P({ sodium: 80 }).ok, false));
t('字串數字可解析', () => assert.equal(P({ weight: '12.5', bolus: '' }).maintenance.daily, 1125));

console.log('警示');
t('新生兒警示', () => assert.ok(P({ ageMonths: 0 }).warnings.some(w => /新生兒/.test(w.t))));
t('>36 月 CDS 提示', () => assert.ok(P({ ageMonths: 60 }).warnings.some(w => /1–36/.test(w.t))));
t('輕中度 → ORS 首選', () => assert.ok(P({ appearance: 1 }).warnings.some(w => /ORS/.test(w.t))));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
