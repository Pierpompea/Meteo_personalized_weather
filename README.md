# Me!teo: Meteo su Misura

Una piccola app meteo personalizzata in italiano.

## Avvio

Apri `index.html` nel browser oppure, per usare `localhost`, avvia:

```bash
npm start
```

Poi visita:

```text
http://127.0.0.1:4173
```

## Come funziona

- Mostra temperatura effettiva, umidita, vento e temperatura percepita base.
- Chiede cosa stai indossando.
- Registra se hai avuto freddo, caldo o se stavi bene.
- Consiglia cosa indossare in base alla temperatura percepita dal tuo profilo.
- Salva un profilo termico nel browser con `localStorage`.
- Corregge la temperatura personale in base ai feedback successivi.

I dati meteo arrivano da Open-Meteo e non richiedono una chiave API.

## Installazione sul telefono

Questa app e pronta come PWA installabile.

1. Apri il link dal telefono.
2. Su Android, usa Chrome e scegli `Installa app` o `Aggiungi a schermata Home`.
3. Su iPhone, usa Safari, apri il menu di condivisione e scegli `Aggiungi alla schermata Home`.

Le preferenze personali restano salvate sul telefono finche non cancelli i dati del sito o del browser.
