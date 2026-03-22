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
