
### [2026-04-22 19:42:01] Review Failed for: 铰口鲨
- The `image` field is `null` (missing data).

### [2026-04-22 20:05:02] Review Failed for: 巴塔哥尼亚豚鼠
FATAL JSON GENERATION ERROR: fetch failed

### [2026-04-22 20:10:12] Review Failed for: 毛冠鹿
FATAL JSON GENERATION ERROR: fetch failed

### [2026-04-22 20:34:00] Review Failed for: 东部菱背响尾蛇
* The `image` field is set to `null`, missing the required image data/object.

### [2026-06-07 16:40:00] Review Failed for: 细纹斑马
FATAL JSON GENERATION ERROR: Unexpected end of JSON input

### [2026-06-07 16:40:13] Review Failed for: 吞噬鳗
- 'global_distribution_polygons' are simple, low-resolution shapes (each polygon has only ~24-26 points) that roughly outline the Atlantic, Pacific, and Indian Oceans. They lack the high-precision, complex contours expected for a species with a "cosmopolitan distribution."

### [2026-06-07 16:40:21] Review Failed for: 鳄蜥
- 'global_distribution_polygons' contains a 4-point polygon (the last one: [[26.5,112.5],[26.3,112.8],[26,113],[25.7,112.9],[25.6,112.6],[25.8,112.3],[26.1,112.2],[26.4,112.4],[26.5,112.5]] is actually 9 points, but the first polygon has 14 points, second has 10, third has 8 — all are relatively simple and may not represent a complex, high-precision shape; however, the main issue is that the polygons appear to be small, simple clusters rather than detailed, organic boundaries. The task requires "complex, high-precision shape" — these are too few points and too simplistic for a species with a fragmented distribution. Additionally, the coordinates seem to be in a rough rectangular/box-like pattern for each cluster, not organic.
