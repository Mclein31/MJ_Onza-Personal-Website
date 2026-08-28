---
project: PersonalPortfolio
type: design
status: active
created: 2026-08-28
updated: 2026-08-28
tags:
  - math
  - 3d
---

# 3D Transform Math

$$\text{Offset } \Delta = (i - \text{currentIndex} + N) \pmod{N}$$
Transforms applied:
- Center: `translate3d(0, 0, 0) scale3d(1, 1, 1)`
- Next: `translate3d(60%, 0, -120px) rotateY(-25deg) scale3d(0.85, 0.85, 1)`
- Prev: `translate3d(-60%, 0, -120px) rotateY(25deg) scale3d(0.85, 0.85, 1)`
