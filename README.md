# kv-hessen-scraper
Web scraper to collect doctor/therapist information from the KV Hessen doctors search.

## Usage
Create a file params.json in the `src` directory with the following parameters:
```json
{
    "page": "suche",
    "rpp": 500,
    "fachrichtung": <...>,
    "haus_facharzt": "<...>",
    "fachrichtung_psycho": <...>,
    "plz": <...>,
    "ort": "<...>",
    "entfernung": 10,
    "action[SucheStarten]": "",
    "name": "--alle--",
    "vorname": "--alle--",
    "geschlecht": "egal",
    "status": "--alle--",
    "genehmigung": "--alle--",
    "zusatzbezeichnung": "--alle--",
    "testungaufSARSCoV2": "--alle--",
    "fremdsprache": "--alle--",
    "sz_von_sel": "",
    "sz_bis_sel": ""
}
```
