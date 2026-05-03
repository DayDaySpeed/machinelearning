import { useRef, useState } from 'react';
import './App.css';

export default function HousePriceEstimator() {
  const isPredictingRef = useRef(false);
  const [form, setForm] = useState({
    OverallQual: 6,
    GrLivArea: 1600,
    GarageCars: 2,
    TotalBsmtSF: 1000,
    YearBuilt: 2005,
  });

  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [budget, setBudget] = useState(400000);
  const [preference, setPreference] = useState('balanced');
  const [recommendation, setRecommendation] = useState(null);
  const [budgetError, setBudgetError] = useState(null);

  const rmse = 27980.53;
  const meanPrice = 180000;
  const minBudget = 50000;
  const maxBudget = 2000000;

  const features = [
    ['OverallQual', '整体质量 OverallQual', 1, 10],
    ['GrLivArea', '地上居住面积 GrLivArea', 500, 5000],
    ['GarageCars', '车库容量 GarageCars', 0, 4],
    ['TotalBsmtSF', '地下室面积 TotalBsmtSF', 0, 3000],
    ['YearBuilt', '建造年份 YearBuilt', 1900, 2026],
  ];

  /** 与 README / Notebook 一致的验证集指标；R² 用于条形图比例展示 */
  const models = [
    { name: 'Linear Regression', r2: 0.793865, rmse: 39763.3 },
    { name: 'Random Forest', r2: 0.890988, rmse: 28916.33 },
    { name: 'XGBoost', r2: 0.89793, rmse: 27980.53 },
  ];
  const maxR2 = Math.max(...models.map((m) => m.r2));

  const preferenceOptions = [
    {
      value: 'balanced',
      label: '均衡',
      description: '面积、品质与车库相对平衡，适合多数购房场景。',
    },
    {
      value: 'spaceFirst',
      label: '面积优先',
      description: '在预算内倾向更大居住面积。',
    },
    {
      value: 'qualityFirst',
      label: '品质优先',
      description: '优先提升整体质量与居住体验。',
    },
    {
      value: 'garageFirst',
      label: '车位优先',
      description: '倾向更充足的车库/车位配置。',
    },
  ];

  function validateForm() {
    for (const [key, , min, max] of features) {
      const val = Number(form[key]);

      if (Number.isNaN(val)) {
        setError(`${key} 须为有效数字`);
        return false;
      }

      if (val < min || val > max) {
        setError(`${key} 须在 ${min}～${max} 范围内`);
        return false;
      }
    }

    const hasValid = Object.values(form).some((v) => Number(v) > 0);
    if (!hasValid) {
      setError('请至少填写一项有效数值');
      return false;
    }

    return true;
  }

  async function predictPrice() {
    if (loading || isPredictingRef.current) return;
    setError(null);

    if (!validateForm()) return;

    isPredictingRef.current = true;
    setLoading(true);

    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v)])
      );

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setPrice(Math.round(data.predicted_price));
    } catch {
      setError('请求失败，请确认后端服务已启动');
    } finally {
      isPredictingRef.current = false;
      setLoading(false);
    }
  }

  function handleFocus(key) {
    if (form[key] === 0) {
      setForm({ ...form, [key]: '' });
    }
  }

  function handleBlur(key) {
    let val = Number(form[key]);

    if (form[key] === '' || Number.isNaN(val)) {
      val = 0;
    }

    setForm({ ...form, [key]: val });
  }

  function handleChange(key, value) {
    setForm({
      ...form,
      [key]: value === '' ? '' : Number(value),
    });
  }

  function handleEnterAction(e, action) {
    if (e.key !== 'Enter' || e.repeat) return;
    e.preventDefault();
    e.stopPropagation();
    action();
  }

  function handleBudgetChange(value) {
    const nextValue = Number(value);
    setBudget(value === '' ? '' : nextValue);
    setBudgetError(null);
  }

  function generateRecommendation() {
    if (budget === '' || Number.isNaN(Number(budget))) {
      setBudgetError('请输入有效预算金额');
      return;
    }

    if (Number(budget) < minBudget || Number(budget) > maxBudget) {
      setBudgetError(`预算须在 ${minBudget.toLocaleString()}～${maxBudget.toLocaleString()} 之间`);
      return;
    }

    setBudgetError(null);
    const normalizedBudget = Number(budget);
    const baseArea = Math.round(normalizedBudget / 200);
    const baseQuality = Math.min(10, Math.round(normalizedBudget / 50000));
    let area = baseArea;
    let quality = baseQuality;
    let garage = 2;

    if (preference === 'spaceFirst') {
      area = Math.round(baseArea * 1.15);
      quality = Math.max(4, baseQuality - 1);
      garage = 2;
    } else if (preference === 'qualityFirst') {
      area = Math.round(baseArea * 0.9);
      quality = Math.min(10, baseQuality + 1);
      garage = 2;
    } else if (preference === 'garageFirst') {
      area = Math.round(baseArea * 0.95);
      quality = Math.max(4, baseQuality);
      garage = 3;
    }

    setRecommendation({
      area,
      quality,
      garage,
      preference:
        preferenceOptions.find((item) => item.value === preference)?.label ?? '均衡',
    });
  }

  function getMarketLabel(p) {
    if (p > meanPrice * 1.2) return '高于样本均价区间';
    if (p < meanPrice * 0.8) return '低于样本均价区间';
    return '处于样本均价附近';
  }

  const currencyFmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="app">
      <header className="app-nav">
        <div className="app-brand">
          <div className="app-logo" aria-hidden>
            PP
          </div>
          <div className="app-brand-text">
            <span className="app-brand-name">Price Projections</span>
            <span className="app-brand-tag">House price estimator</span>
          </div>
        </div>
        <span className="app-nav-meta">Kaggle · XGBoost 部署版</span>
      </header>

      <main className="app-main">
        <div className="app-hero">
          <h1>房价智能估价</h1>
          <p>
            基于结构化特征（质量、面积、车库、地下室、建造年份）的回归预测。输入参数后获取美元计价估计值，并查看与基线模型的指标对比。
          </p>
        </div>

        <div className="app-layout">
          <form
            className="panel panel-primary"
            onSubmit={(e) => {
              e.preventDefault();
              predictPrice();
            }}
          >
            <div className="panel-header">
              <h2>参数输入</h2>
              <p className="panel-desc">所有字段将提交至 /api/predict，与训练管线一致的五维特征。</p>
            </div>
            <div className="panel-divider" />
            <div className="panel-body">
              <div className="form-grid">
                {features.map(([key, label, min, max]) => (
                  <div key={key} className="field">
                    <div className="field-label-row">
                      <label htmlFor={key}>{label}</label>
                      <span className="field-hint">
                        {min}–{max}
                      </span>
                    </div>
                    <input
                      id={key}
                      type="number"
                      inputMode="decimal"
                      value={form[key]}
                      onFocus={() => handleFocus(key)}
                      onBlur={() => handleBlur(key)}
                      onChange={(e) => handleChange(key, e.target.value)}
                      onKeyDown={(e) => handleEnterAction(e, predictPrice)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '正在预测…' : '运行预测'}
              </button>

              {error && <div className="alert alert-error">{error}</div>}

              {price != null && (
                <div className="result-card">
                  <div className="result-price">{currencyFmt.format(price)}</div>
                  <div className="result-meta">
                    <div>
                      <strong>参考误差带</strong>：± {Math.round(rmse).toLocaleString()} USD（与当前部署模型验证 RMSE 同量级）
                    </div>
                    <div>
                      <strong>相对位置</strong>：{getMarketLabel(price)}
                    </div>
                  </div>
                  <div className="result-explain">
                    <h3>结果说明</h3>
                    <ul>
                      <li>OverallQual 与 GrLivArea 对估价影响通常最为显著。</li>
                      <li>预测值为点估计，实际成交受地段、市场周期等因素影响。</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="section-block">
                <h3>预算与偏好</h3>
                <div className="field">
                  <span className="field-label-row">
                    <label>购房偏好</label>
                  </span>
                  <div className="preference-grid">
                    {preferenceOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`preference-btn${preference === option.value ? ' is-active' : ''}`}
                        onClick={() => setPreference(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="preference-hint">
                    {preferenceOptions.find((o) => o.value === preference)?.description}
                  </p>
                </div>

                <div className="field" style={{ marginTop: '1rem' }}>
                  <div className="field-label-row">
                    <label htmlFor="budget">预算（USD）</label>
                    <span className="field-hint">
                      {minBudget.toLocaleString()}–{maxBudget.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="budget"
                    type="number"
                    inputMode="numeric"
                    value={budget}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    onKeyDown={(e) => handleEnterAction(e, generateRecommendation)}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={generateRecommendation}
                  disabled={budget === '' || Number.isNaN(Number(budget))}
                >
                  生成参考配置
                </button>
                {budgetError && <div className="alert alert-error">{budgetError}</div>}

                {recommendation && (
                  <div className="rec-card">
                    <dl>
                      <div>
                        <dt>偏好 · </dt>
                        <dd>{recommendation.preference}</dd>
                      </div>
                      <div>
                        <dt>参考面积 · </dt>
                        <dd>{recommendation.area} sq ft</dd>
                      </div>
                      <div>
                        <dt>参考质量分 · </dt>
                        <dd>{recommendation.quality} / 10</dd>
                      </div>
                      <div>
                        <dt>参考车位 · </dt>
                        <dd>{recommendation.garage}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </form>

          <aside className="panel panel-aside">
            <div className="panel-header">
              <h2>模型性能</h2>
              <p className="panel-desc">与仓库内 Notebook 一致的验证集 R² 与 RMSE（五维特征）。</p>
            </div>
            <div className="panel-divider" />
            <div className="panel-body">
              <div className="model-list">
                {models.map((m) => (
                  <div key={m.name} className="model-item">
                    <div className="model-item-header">
                      <span className="model-item-name">{m.name}</span>
                      <span className="model-item-metric">R² {m.r2.toFixed(4)}</span>
                    </div>
                    <div className="model-bar-track">
                      <div
                        className="model-bar-fill"
                        style={{ width: `${(m.r2 / maxR2) * 100}%` }}
                      />
                    </div>
                    <div className="model-item-footer">
                      RMSE {Math.round(m.rmse).toLocaleString()} USD
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <footer className="app-footer">
          课程演示用途 · 预测结果不构成投资或定价建议
        </footer>
      </main>
    </div>
  );
}
