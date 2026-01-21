# SECURITY DEFINER Standard (Non-Negotiable)

## 1) search_path zorunlu

Her SECURITY DEFINER fonksiyon şu satırı içermelidir:

- SET search_path = public, pg_temp;

## 2) Parametre doğrulama

- NULL kontrolü
- numeric range kontrolü
- enum/text allow-list
- lat/lng bounds

## 3) SELECT \* yasak

- Dönüş kolonları explicit olmalı.

## 4) Idempotency zorunlu (kritik işlemler)

- gift create
- escrow release/refund
- withdrawal initiate
- webhook event process

DB’de:

- idempotency_key + UNIQUE constraint
- ikinci çağrı “var olan sonucu” döndürür.

## 5) Transaction safety

- tek transaction
- concurrency safe (row lock veya güvenli update)

## 6) Audit

- actor_id, action, entity_id, metadata (PII yok)
- immutable log prensibi

## 7) Access modeli

- Client tablo update yerine policy RPC/edge endpoint kullanır.
