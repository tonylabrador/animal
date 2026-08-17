# 旧动物 QC 批次 02

- 完成日期：2026-08-16
- 记录数：10
- Weekly budget 基线：剩余 **48%**
- 完成后剩余比例：等待用户从 Codex 用量界面读取
- 本批实际消耗：`48% - 完成后剩余比例`（百分点）
- 修改前基线：[legacy-qc-batch-02-baseline.json](./legacy-qc-batch-02-baseline.json)

## 结果

| ID | 全球 IUCN | 关键分类结果 | 原地图 | 地图处理 | 图片来源 / 许可 |
|---|---|---|---:|---|---|
| `african-buffalo` | NT | `Syncerus caffer`；偶蹄目、牛科 | 2 个多边形 | 坐标逐点保留 | iNaturalist / CC BY |
| `alberts-lyrebird` | **LC** | `Menura alberti`；雀形目、琴鸟科 | 1 个多边形 | 坐标逐点保留 | iNaturalist / CC BY-SA |
| `american-crocodile` | VU | `Crocodylus acutus`；爬行纲、鳄目 | 4 个多边形 | 坐标逐点保留 | iNaturalist / CC BY |
| `american-lobster` | LC | `Homarus americanus`；软甲纲、十足目 | 1 个多边形 | 坐标逐点保留 | iNaturalist / CC BY |
| `common-fruit-fly` | NE | `Drosophila melanogaster`；昆虫纲、双翅目 | 2 个多边形 | 坐标逐点保留 | iNaturalist / CC0 |
| `australian-box-jellyfish` | NE | `Chironex fleckeri`；立方水母纲 | 1 个多边形 | 坐标逐点保留 | Wikimedia Commons / CC BY-SA 2.0 |
| `aye-aye` | EN | `Daubentonia madagascariensis`；灵长目、指猴科 | 1 个多边形 | 坐标逐点保留 | iNaturalist / CC BY |
| `bee-hummingbird` | NT | `Mellisuga helenae`；雨燕目、蜂鸟科 | 代表点 | 原点和缩放保留 | iNaturalist / CC BY |
| `bighead-carp` | DD | `Hypophthalmichthys nobilis`；鲤形目、鲴科 | 2 个多边形 | 坐标逐点保留 | iNaturalist / CC BY |
| `black-footed-ferret` | EN | `Mustela nigripes`；食肉目、鼬科 | 代表点 | 原点和缩放保留 | iNaturalist / CC BY |

本批没有把任何旧多边形改成一个点。导入后用 JSON 精确比较验证：10/10 的原栖息地文字、中心点、缩放级别和全部多边形数组完全不变。

## 明确纠错与口径说明

- 艾氏琴鸟旧记录的全球等级由 NT 改为 LC。全球 IUCN/BirdLife 口径与澳大利亚州级名录必须分开：新南威尔士州仍可列为 Vulnerable、昆士兰州可列为 Near Threatened，但不能用州级等级替代全球等级。
- 黑腹果蝇与澳大利亚箱水母均保持 NE。未找到物种级 IUCN 评估，不能自行推断为 LC 或 DD。
- 鳙保持 DD。引入区数量很多不能证明其原生分布区没有灭绝风险；记录明确区分原生区保护不确定性与外来入侵影响。
- 鳙的科级处理在现代数据库中存在 Cyprinidae 与 Xenocyprididae 两种口径；本项目沿用较新的鲴科处理并在演化段落说明差异。
- 美洲鳄采用标准的 Reptilia / Crocodylia / Crocodylidae 体系，没有照搬 GBIF 返回中缺失的目级字段。

## 内容与翻译 QC

- 每条记录均加入 6 个紧凑 Quick Facts，并保留用户偏好的长段双语简介布局。
- 每条均补齐生活史、适应、生态角色、保护、鉴别、感官与交流、年度节律、人类关系、演化、野外踪迹、冷知识及类群专项内容。
- 10 条 draft schema、来源键和唯一性检查通过。
- 本批共检查 500 组中英字段；修正数字重复和 `up to / 可达` 表达后，自动双语一致性检查零错误、零警告。
- 导入后全库 21 条 v2 共 1,055 组中英字段通过；405 条旧记录仍在逐条迁移队列中。

## 图片 QC

- 9 个原来许可不明的旧图替换为逐张查看、物种身份可支持且带开放许可的候选图。
- 澳大利亚箱水母继续沿用先前已人工确认的 Wikimedia Commons 图片。
- 拒绝或避开了尸体、残骸、幼鸟巢照、运输笼、主体过小、鉴别特征不足等候选。
- 所有 10 张发布图均为 `human-approved`，包含来源链接、作者署名、许可、尺寸、哈希和复核日期。

## 地图与浏览器验证

- 中文地图：高德国内线路实测加载，10 个抽样瓦片完整返回；非洲水牛显示 2 个保留多边形。
- 英文地图：CARTO/OSM 实测加载，10 个抽样瓦片完整返回；非洲水牛显示 2 个保留多边形。
- 代表点样例：黑足鼬显示 1 个自定义 Leaflet 点标记、0 个范围多边形，并明确标注“不是完整分布范围”。
- 10/10 页面实际加载标题、Quick Facts、英文简介、中文简介、主图来源链接；生产版本中 10/10 主图完整加载。

## 全库与构建验证

- Rich Content v2 schema 单元测试：通过。
- 426 条发布数据校验：通过。
- ESLint：通过。
- Next.js production build：通过；生成 435 个静态页面，其中 426 个动物页。
- 当前迁移进度：21/426 已完成 v2，405 条待处理。

## Weekly budget 计算

Codex 无法从项目文件或终端读取用户账户的 weekly budget 百分比。用户提供的可靠基线是剩余 48%。本批完成后由用户查看同一用量界面并提供新数值：

`本批消耗（百分点） = 48 - 新的剩余百分比`

例如完成后剩余 45%，本批消耗就是 3 个百分点；这是周额度界面百分比变化，不是内部 token 数或记录迁移比例。
