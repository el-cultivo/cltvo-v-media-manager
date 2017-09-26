const makePhoto = (id, mimetype) => ({
  "id": id,
  "filename": id+"."+mimetype.split('/')[1],
  "type": mimetype,
  "created_at": "2017-09-22 15:30:45",
  "updated_at": "2017-09-22 15:30:45",
  "es_title": "",
  "es_alt": "",
  "es_description": "",
  "thumbnail_url": "http://localhost:3000/"+id+"."+mimetype.split('/')[1],
  "url": "http://localhost:3000/"+id+"."+mimetype.split('/')[1],
  "title": "",
  "alt": "",
  "description": null,
  "pivot_use": null,
  "pivot_class": null,
  "pivot_order": null,
  "languages": [
    {
      "id": id,
      "iso6391": "es",
      "language_label": "Español",
      "language_id": 1,
      "photo_id": 3,
      "title": "",
      "alt": "",
      "description": null,
      "pivot": {
        "photo_id": id,
        "language_id": 1,
        "title": "",
        "alt": "",
        "description": null,
        "created_at": "2017-09-22 15:30:46",
        "updated_at": "2017-09-22 15:30:46"
      }
    }
  ]
})

module.exports = makePhoto