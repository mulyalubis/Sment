# Dataset

## Sumber
**Garbage Classification (12 classes)** oleh Mostafa Mohamed, Kaggle  
https://www.kaggle.com/datasets/mostafaabla/garbage-classification

Dataset asli berisi sekitar 15.000 gambar dalam 12 kelas sampah rumah tangga.

## Kelas yang dipakai

| Folder asli | Kategori di sistem |
|---|---|
| `biological` | Organic Waste |
| `plastic` | Plastic Waste |
| `paper` | Paper Waste |

Kelas lain (cardboard, metal, glass, clothes, shoes, battery, trash) tidak dipakai.

## Subset yang dilatih
- 300 gambar per kelas, diambil acak (seed 42), total **900 gambar** (syarat minimal 150).
- Pembagian per kelas: 70% train (210), 15% validation (45), 15% test (45).
- Data test tidak dipakai saat training.

## Cara mengunduh ulang
Gunakan sel unduh di `notebooks/train_waste_classifier.ipynb` (butuh `kaggle.json`), atau unduh zip dari tautan di atas.
Dataset mentah tidak ikut di repo karena ukurannya besar.

## Lisensi
Mengikuti lisensi yang tertera pada halaman dataset di Kaggle. Dataset dipakai hanya untuk keperluan tes teknikal ini.
