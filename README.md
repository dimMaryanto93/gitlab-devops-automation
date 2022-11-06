## Gitlab CI/CD Workflow

Gitlab mengediakan 2 workflow yaitu

- Continuous Integration / Continuous Delivery (CI/CD)
- GitOps (Pull request, Merge request)

Yang jadi pertanyaan kita harus pilih yang mana? Jawabannya `It's Depend, what you want todo!` kita bisa menggunakan CI/CD atau GitOps ataupun Combine between of them.

Untuk menggunakan workflow CI/CD temen-temen bisa menggunakan branch 

- `main`
- `feature/main` (development version)

Untuk menggunakan workflow GitOps temen-temen bisa menggunakan branch

- `gitlab-kas`
- `feature/gitlab-kas` (development version)

Semua branch di sertai dengan contoh penggunaanya, temen-temen bisa lihat pada folder `examples/<modules>`