# Token Reduction Delta Prompts

## A) Genel (Max 10 lines)

```text
SSoT docs-ssot/ geçerli. Yeni kural ekleme.
Hedef: <tek cümle>
Değiştirilecek dosyalar: <maks 5 path>
Kısıtlar: <maks 5 madde>
Kabul kriterleri: <maks 5 madde>
Sadece diff üret ve dosya bazlı çıktı ver.
```

## B) Supabase (Hard/Sert)

```text
Sadece supabase/** ve scripts/** ve .github/workflows/** değişebilir.
anon tablo write 0. RLS default deny. SECURITY DEFINER search_path zorunlu.
Çalıştırılabilir smoke.sql ve audit script üret. CI gate kırılmasın.
Değiştirilecek dosyalar: <liste>
Kabul kriterleri: db-smoke ve security-baseline yeşil.
```
