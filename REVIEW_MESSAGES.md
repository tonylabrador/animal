# 🚨 Independent AI Review Issues


### [2026-03-22 21:45:08] Review Failed for: 黑翅土白蚁
* The `image` field is `null`.
* `global_distribution_polygons` contains low-precision 4-point shapes (Polygons 3 and 4) that do not qualify as complex or high-precision.
* The `global_distribution_polygons` structure is logically incorrect, as it uses a single-polygon nested array format that defines separate landmasses (Taiwan, Ryukyu Islands) as interior rings (holes) within the primary mainland polygon.

### [2026-03-22 21:45:25] Review Failed for: 天堂金花蛇
* The `global_distribution_polygons` contains low-precision shapes, including a 5-point polygon (Polygon 4) which is a simple 4-vertex box.
* The `image` field is null.

### [2026-03-22 21:49:40] Review Failed for: 金花蛇
* The `image` field is null, representing missing data for a wildlife database entry.
* The `ui_tags` field is not bilingual, containing only Chinese terms, which is inconsistent with the bilingual requirement of the application.

### [2026-03-22 21:53:55] Review Failed for: 美洲红松鼠
* `ui_tags` are not bilingual.
* `image` field is null (missing data).

### [2026-03-22 21:54:28] Review Failed for: 克氏原螯虾
* 'global_distribution_polygons' are low-precision and lack complexity; several shapes consist of only 4 to 8 points, which is insufficient for a high-precision wildlife database.
* The 'image' field is null, indicating missing visual data.

### [2026-03-22 22:01:10] Review Failed for: 普通野蝗
* `global_distribution_polygons` contains a lazy 5-point box (Polygon 2) and lacks the high-precision detail required for a continent-spanning distribution.
* The `image` field is `null` (missing data).
* `ui_tags` are not bilingual.

### [2026-03-22 22:05:18] Review Failed for: 睫角守宫
* `global_distribution_polygons` are low-precision geometric shapes (5-7 unique points) rather than complex, high-precision organic shapes.
* `ui_tags` are not bilingual (missing English translations).
* `image` field is null, representing missing data.

### [2026-03-22 22:06:59] Review Failed for: 美洲鹤
* The `global_distribution_polygons` field contains lazy 5-point boxes (specifically the third and fourth polygons), which lack the required high-precision complexity.
* The `image` field is null, indicating missing data for the application.

### [2026-03-22 22:11:09] Review Failed for: 沙丘鹤
* `global_distribution_polygons` contains a lazy 4-point polygon (the 5th entry).
* `global_distribution_polygons` lacks high-precision coordinates (uses simplified integer and half-degree values).
* The `image` field is null.

### [2026-03-22 22:11:32] Review Failed for: 灰鹤
* `global_distribution_polygons` are not closed (the first and last coordinate pairs in each array must be identical to form a valid linear ring).
* `global_distribution_polygons` lack high-precision detail (several polygons use only 6–10 points to represent vast continental ranges, which is considered "lazy" and low-resolution).
* `ui_tags` are not bilingual (only Chinese terms are provided).
* The `image` field is null and contains no data.

### [2026-03-24 21:11:32] Review Failed for: 蓝山雀
* The `image` field is null (missing data).
* The `ui_tags` field is not bilingual (only provided in Chinese).

### [2026-03-24 21:12:49] Review Failed for: 欧亚喜鹊
* `global_distribution_polygons` contains a lazy 5-point polygon (Polygon 2).
* `description` is not strictly bilingual; the Chinese version includes an additional sentence regarding cultural symbolism not present in the English text.
* `ui_tags` are not bilingual (provided only in Chinese).
* `image` field is null (missing data).

### [2026-03-24 23:50:27] Review Failed for: 维多利亚草原无耳龙
* `image` field is null (missing data).
* `ui_tags` are not strictly bilingual (English only).
* `global_distribution_polygons` lack high-precision complexity (Polygon 2 is a simple 6-point shape).
* `taxonomy.genus.zh` ("耳龙属") is inconsistent with the species name translation ("无耳龙").

### [2026-03-26 07:08:06] Review Failed for: 土豚
- The first polygon in `global_distribution_polygons` is not closed (the first and last coordinates must be identical to form a valid ring).
- The `image` field is null, which constitutes a missing data error.
- `ui_tags` are not strictly bilingual (only Chinese strings are provided, which is inconsistent with the rest of the schema).

### [2026-03-26 07:11:39] Review Failed for: 象牙喙啄木鸟
* The `image` field is `null` (missing data).
* `global_distribution_polygons` contains low-precision shapes (e.g., a 5-point polygon for South Carolina and a 7-point polygon for Cuba) that fail the requirement for complex, high-precision geometry.
* `global_distribution_polygons` uses an incorrect nested array structure for disjointed regions (it is structured as a single polygon with internal rings/holes rather than a MultiPolygon).
* `global_distribution_polygons` uses `[Latitude, Longitude]` coordinate order, which is a schema-breaking error for standard GeoJSON implementations.

### [2026-03-26 07:36:39] Review Failed for: 鳙鱼
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-03-26 07:37:08] Review Failed for: 鲢
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-03-26 07:37:19] Review Failed for: 胭脂鱼
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-03-26 07:39:11] Review Failed for: 苍鹰
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-03-26 07:41:02] Review Failed for: 日本鳗鲡
* The first polygon in 'global_distribution_polygons' is a lazy 5-point rectangle.

### [2026-03-26 07:45:37] Review Failed for: 绢粉蝶
* `global_distribution_polygons` are not high-precision (low coordinate resolution and few vertices).
* `description` and `encyclopedia` are not strictly bilingual (Chinese version contains additional information not present in the English text).
* The `image` field is `null` (missing data).

### [2026-03-26 07:50:18] Review Failed for: 大鵟
* The `image` field is null.
    * The `ui_tags` are not bilingual.
    * The `taxonomy` object is missing the `species` level.

### [2026-03-26 07:51:06] Review Failed for: 美洲红鹮
FATAL JSON GENERATION ERROR: Expected ',' or '}' after property value in JSON at position 3770 (line 51 column 2)

### [2026-03-26 07:51:37] Review Failed for: 辉亭鸟
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-03-26 07:52:24] Review Failed for: 黑鹳
* The fourth polygon in `global_distribution_polygons` is a lazy 5-point rectangle, failing the requirement for complex, high-precision shapes.

### [2026-03-26 07:52:53] Review Failed for: 镰嘴管舌鸟
* The `global_distribution_polygons` for Maui and Kauai are low-precision (5-point and 4-point shapes), which are considered "lazy" and do not meet the requirement for complex, high-precision organic shapes.

### [2026-03-26 08:04:12] Review Failed for: 斑马跳蛛
* `ui_tags` is not bilingual (missing English translations).
* `global_distribution_polygons` contains an unclosed ring (the first polygon's start and end points do not match).
* `taxonomy` is missing the `species` level.
* `image` field is null.

### [2026-03-26 22:26:54] Review Failed for: 家蟋蟀
* The fourth polygon in `global_distribution_polygons` is a lazy 5-point shape.
* The `image` field is null, indicating missing data.

### [2026-03-26 22:32:45] Review Failed for: 胭脂鱼
* The `global_distribution_polygons` is not a closed loop (the first and last coordinates must be identical).
* The `ui_tags` field is not bilingual (contains only Chinese).
* The `image` field is null, which constitutes a missing data error.
* The coordinates in `global_distribution_polygons` lack high precision (only one decimal place).

### [2026-03-30 14:36:15] Review Failed for: 鸿雁
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-03-30 14:36:18] Review Failed for: 金黄鹂
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-03-30 15:00:57] Review Failed for: 鸿雁
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-04-03 02:06:03] Review Failed for: 野猪
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-04-03 02:06:53] Review Failed for: 鸳鸯
FATAL JSON GENERATION ERROR: Gemini API error: 503

### [2026-04-11 00:26:08] Review Failed for: 小蜂虎
* The `image` field is null, indicating missing data.
* The `global_distribution_polygons` array does not form a closed linear ring (the first coordinate `[16, -16.5]` and the last coordinate `[12, -16.5]` are not identical), which is a schema-breaking error for valid polygon geometry.

### [2026-04-11 00:37:25] Review Failed for: 三趾翠鸟
* The `image` field is set to `null` (missing image data).

### [2026-04-11 00:41:36] Review Failed for: 麝雉
- The `global_distribution_polygons` geometry is schema-breaking because the linear ring is not closed (the first coordinate `[9.5, -62.5]` does not match the last coordinate `[9.5, -63.5]`).
- The `image` field is set to `null`, meaning the image data is missing.
