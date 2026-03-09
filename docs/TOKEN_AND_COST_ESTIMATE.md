# Token & Cost Estimate — Adding 100 Animals (Opus)

Rough estimates for generating **100 new animal entries** with the ADD_ANIMAL_WORKFLOW prompt and Claude **Opus** API.

---

## Token Counts (100 animals)

| 类型 | 估算方式 | 约 Token 数 |
|------|----------|-------------|
| **Output（模型生成）** | 实测：单只动物 JSON ≈ 2,086 字符 → 约 **700 tokens/只** | **≈ 70,000 tokens** |
| **Input（你发的 Prompt）** | 模板 + 100 条动物名单；分 5 批每批 20 只更稳 | **≈ 6,000–8,000 tokens** |
| **合计** | 以 Output 为主 | **≈ 76,000–78,000 tokens** |

说明：
- 单只动物 JSON 按当前 `animal_source.json` 结构（taxonomy 六层双语 + conservation + encyclopedia 三段双语）统计。
- 若一批请求 100 只，可能遇到输出截断，建议 **每批 15–20 只**，共 5–7 次请求。

---

## Claude Opus 单价（按官方/常见公开价）

| 版本 | Input（/百万 token） | Output（/百万 token） |
|------|----------------------|------------------------|
| **Opus 4.5（新）** | $5 | $25 |
| **Opus 4.1（旧）** | $15 | $75 |

---

## 100 只动物预估费用（Opus）

### 按 Opus 4.5（$5 / $25 per M）

| 项目 | 计算 | 金额 |
|------|------|------|
| Input | 8,000 × $5 / 1,000,000 | **≈ $0.04** |
| Output | 70,000 × $25 / 1,000,000 | **≈ $1.75** |
| **合计** | | **≈ $1.80 USD** |

### 按 Opus 4.1（$15 / $75 per M）

| 项目 | 计算 | 金额 |
|------|------|------|
| Input | 8,000 × $15 / 1,000,000 | **≈ $0.12** |
| Output | 70,000 × $75 / 1,000,000 | **≈ $5.25** |
| **合计** | | **≈ $5.40 USD** |

---

## 小结

| 项目 | 数值 |
|------|------|
| 100 只动物约总 Token | **~78,000**（其中 Output ~70,000） |
| Opus 4.5 预估总价 | **约 $1.80 美元** |
| Opus 4.1 预估总价 | **约 $5.40 美元** |

*实际费用以 Anthropic 当前定价为准；若使用 Batch 或 Prompt Caching 会有折扣。*
