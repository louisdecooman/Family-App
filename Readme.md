# Family app
De family app moet alles bijhouden wat wij met het gezin doen. Deze app moet beschikbaar worden op zowel iphone als op android en moet terecht komen in de app store en de google play stor

## Ontwikkelen
Techniek: Expo (React Native + TypeScript), voor iOS en Android.

```
npm install
npm start        # scan de QR-code met Expo Go
```

Functies: inloggen, een gezin aanmaken of erbij komen met een uitnodigingscode, en gedeelde activiteiten toevoegen, bekijken (realtime) en verwijderen (lang indrukken).

## Backend (Supabase)
1. Maak een Supabase-project aan (regio EU).
2. Voer `supabase/migrations/0001_init.sql` uit in de SQL-editor.
3. Zet Realtime aan voor de tabel `activities` (Database > Replication).
4. Kopieer `.env.example` naar `.env` en vul URL en anon key in. Gebruik nooit de service_role key in de app.

## Naar de stores
Gebruik EAS Build (`npx eas build`) en `eas submit` voor App Store en Google Play. Daarvoor zijn een Apple Developer-account en een Google Play Console-account nodig.
