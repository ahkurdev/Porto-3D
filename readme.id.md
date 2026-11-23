# Porto-3D — Portofolio 3D

English version: [README.md](README.md)

Porto-3D adalah situs web portofolio 3D milik Ahmad Kurniawan — portofolio satu halaman yang interaktif dan dirender dalam 3D dengan React, Three.js, dan Vite.

## Fitur

- Adegan 3D interaktif yang dibangun dengan Three.js melalui @react-three/fiber dan @react-three/drei
- Efek pasca-pemrosesan (post-processing) dengan @react-three/postprocessing
- Pengguliran halaman yang halus dengan Lenis
- Konten portofolio diatur lewat satu konfigurasi pusat (`src/config.ts`)
- Dibangun dengan React 19, TypeScript, dan Vite

## Memulai

Prasyarat: Node.js dan npm.

```bash
npm install
npm run dev      # server pengembangan di http://localhost:3000
npm run build    # build produksi
npm run preview  # pratinjau hasil build produksi
npm run lint     # pemeriksaan tipe
```

## Struktur Proyek

```
src/
  App.tsx        # titik masuk dan tata letak aplikasi
  Scene.tsx      # adegan 3D
  components/    # komponen 3D dan antarmuka
  config.ts      # konfigurasi konten portofolio
```

## Lisensi

Proyek ini dilisensikan di bawah MIT License. Lihat berkas [LICENSE](LICENSE).
