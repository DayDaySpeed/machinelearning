import { useRef, useState } from 'react';

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

  const rmse = 40000;
  const meanPrice = 180000;
  const minBudget = 50000;
  const maxBudget = 2000000;

  const features = [
    ['OverallQual', '🏠 房屋质量 (1-10)', 1, 10],
    ['GrLivArea', '📐 面积 (500-5000)', 500, 5000],
    ['GarageCars', '🚗 车库 (0-4)', 0, 4],
    ['TotalBsmtSF', '📊 地下室 (0-3000)', 0, 3000],
    ['YearBuilt', '📅 年份 (1900-2025)', 1900, 2025],
  ];

  const models = [
    ['Linear Regression', 0.79],
    ['Random Forest', 0.89],
    ['XGBoost', 0.90],
  ];

  const preferenceOptions = [
    {
      value: 'balanced',
      label: '⚖️ 均衡',
      description: '面积、品质和车库保持相对平衡，适合大多数场景。',
    },
    {
      value: 'spaceFirst',
      label: '📐 面积优先',
      description: '在预算内尽量提升面积，适合看重居住空间的家庭。',
    },
    {
      value: 'qualityFirst',
      label: '🏠 品质优先',
      description: '优先提升房屋品质，适合关注装修和居住体验的用户。',
    },
    {
      value: 'garageFirst',
      label: '🚗 车库优先',
      description: '优先保证更好的车位配置，适合多车家庭或通勤需求。',
    },
  ];

  // ✅ 核心：统一校验
  function validateForm() {
    for (let [key, , min, max] of features) {
      let val = Number(form[key]);

      if (isNaN(val)) {
        setError(`${key} 不是数字`);
        return false;
      }

      if (val < min || val > max) {
        setError(`${key} 必须在 ${min} ~ ${max}`);
        return false;
      }
    }

    const hasValid = Object.values(form).some(v => Number(v) > 0);
    if (!hasValid) {
      setError('请至少输入一个有效值');
      return false;
    }

    return true;
  }

  // ✅ 预测（统一入口）
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
      setError('请求失败，请检查后端');
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

    if (form[key] === '' || isNaN(val)) {
      val = 0;
    }

    setForm({ ...form, [key]: val });
  }

  function handleChange(key, value) {
    setForm({
      ...form,
      [key]: value === '' ? '' : Number(value)
    });
  }

  function handleEnterAction(e, action) {
    if (e.key !== 'Enter' || e.repeat) return;
    e.preventDefault();
    e.stopPropagation();
    action();
  }

  function getButtonStyle(disabled) {
    return {
      ...styles.button,
      opacity: disabled ? 0.7 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };
  }

  function handleBudgetChange(value) {
    const nextValue = Number(value);
    setBudget(value === '' ? '' : nextValue);
    setBudgetError(null);
  }

  function generateRecommendation() {
    if (budget === '' || Number.isNaN(Number(budget))) {
      setBudgetError('预算必须是数字');
      return;
    }

    if (Number(budget) < minBudget || Number(budget) > maxBudget) {
      setBudgetError(`预算需在 ${minBudget} ~ ${maxBudget}`);
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
      preference: preferenceOptions.find((item) => item.value === preference)?.label ?? '⚖️ 均衡',
    });
  }

  function getMarketLabel(price) {
    if (price > meanPrice * 1.2) return '偏高 🔺';
    if (price < meanPrice * 0.8) return '性价比高 🟢';
    return '正常';
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ✅ 用 form 包裹（关键） */}
        <form
          style={styles.cardLarge}
          onSubmit={(e) => {
            e.preventDefault();
            predictPrice();
          }}
        >
          <h1 style={styles.title}>房价预测系统</h1>
          <p style={styles.subtitle}>基于XGBoost的智能估价</p>

          <div style={styles.grid}>
            {features.map(([key, label]) => (
              <div key={key} style={styles.field}>
                <label>{label}</label>
                <input
                  type="number"
                  value={form[key]}
                  onFocus={() => handleFocus(key)}
                  onBlur={() => handleBlur(key)}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onKeyDown={(e) => handleEnterAction(e, predictPrice)}
                  style={styles.input}
                />
              </div>
            ))}
          </div>

          {/* ✅ submit按钮 */}
          <button
            type="submit"
            style={getButtonStyle(loading)}
            disabled={loading}
          >
            开始预测
          </button>

          {error && <div style={styles.errorBox}>{error}</div>}

          {price && (
            <div style={styles.resultBox}>
              <div style={styles.resultValue}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0
                }).format(price)}
              </div>

              <div>误差范围：± ${rmse.toLocaleString()}</div>
              <div>市场评价：{getMarketLabel(price)}</div>

              {/* ⭐ Explain AI */}
              <div style={{ marginTop: 10 }}>
                <strong>Why this price?</strong>
                <div>+ 房屋质量是主要影响因素</div>
                <div>+ 面积是第二关键因素</div>
              </div>
            </div>
          )}

          {/* 预算推荐 */}
          <div style={styles.section}>
            <h3>预算推荐</h3>
            <div style={styles.field}>
              <label>选择偏好</label>
              <div style={styles.preferenceGroup}>
                {preferenceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPreference(option.value)}
                    style={{
                      ...styles.preferenceButton,
                      ...(preference === option.value ? styles.preferenceButtonActive : {}),
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div style={styles.preferenceHint}>
                {preferenceOptions.find((option) => option.value === preference)?.description}
              </div>
            </div>
            <input
              type="number"
              value={budget}
              onChange={(e) => handleBudgetChange(e.target.value)}
              onKeyDown={(e) => handleEnterAction(e, generateRecommendation)}
              style={styles.input}
            />
            <button
              type="button"
              onClick={generateRecommendation}
              style={getButtonStyle(budget === '' || Number.isNaN(Number(budget)))}
              disabled={budget === '' || Number.isNaN(Number(budget))}
            >
              推荐配置
            </button>
            {budgetError && <div style={styles.errorBox}>{budgetError}</div>}

            {recommendation && (
              <div style={{ marginTop: 10 }}>
                偏好: {recommendation.preference}<br />
                面积: {recommendation.area} sqft<br />
                质量: {recommendation.quality}<br />
                车库: {recommendation.garage}
              </div>
            )}
          </div>
        </form>

        {/* 模型对比 */}
        <div style={styles.cardSmall}>
          <h2 style={styles.sectionTitle}>模型对比</h2>

          {models.map(([name, val]) => (
            <div key={name} style={styles.modelRow}>
              <div style={styles.modelHeader}>
                <span>{name}</span>
                <span>{val}</span>
              </div>
              <div style={styles.barBg}>
                <div style={{ ...styles.barFill, width: `${val * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// 样式不变
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    padding: 24,
    fontFamily: 'system-ui, sans-serif',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 20,
  },
  cardLarge: {
    background: '#fff',
    padding: 24,
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  cardSmall: {
    background: '#fff',
    padding: 20,
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  title: { fontSize: 28, fontWeight: 700 },
  subtitle: { color: '#64748b', marginBottom: 20 },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 20,
  },
  field: { display: 'flex', flexDirection: 'column' },
  preferenceGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
    marginTop: 8,
  },
  preferenceButton: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#0f172a',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 14,
  },
  preferenceButtonActive: {
    border: '1px solid #0f172a',
    background: '#0f172a',
    color: '#fff',
  },
  preferenceHint: {
    marginTop: 8,
    color: '#475569',
    fontSize: 13,
    lineHeight: 1.5,
  },
  input: {
    padding: 10,
    borderRadius: 10,
    border: '1px solid #e2e8f0',
  },
  button: {
    marginTop: 10,
    padding: 14,
    width: '100%',
    borderRadius: 12,
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    opacity: 1,
  },
  resultBox: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    background: '#ecfdf5',
  },
  resultValue: { fontSize: 32, fontWeight: 700 },
  errorBox: { marginTop: 20, padding: 12, background: '#fee2e2' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 20, marginBottom: 16 },
  modelRow: { marginBottom: 14 },
  modelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barBg: {
    width: '100%',
    height: 10,
    background: '#e2e8f0',
    borderRadius: 999,
  },
  barFill: {
    height: 10,
    background: '#0f172a',
  }
};