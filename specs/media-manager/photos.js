const makePhoto = id => ({
  "id": id,
  "filename": `public/images/${id}.png`,
  "type": "image/png",
  "created_at": "2017-09-22 15:30:"+(id > 9 ? id : '0'+id),
  "updated_at": "2017-09-22 15:30:"+(id > 9 ? id : '0'+id),
  "es_title": "es_Title "+id,
  "es_alt": "es_Alt "+id,
  "es_description": "es_Description "+id,
  "en_title": "en_Title "+id,
  "en_alt": "en_Alt "+id,
  "en_description": "en_Description "+id,
  "thumbnail_url": `http://mm.dev/storage/images/thumbnails/${id}.png`,
  "url": `http://creelalumni.dev/storage/images/${id}.png`,
  "title": "Title "+id,
  "alt": "Alt "+id,
  "description": "Description "+id,
  "pivot_use": null,
  "pivot_class": null,
  "pivot_order": null,
  "languages": [
    {
      "id": 1,
      "iso6391": "es",
      "language_label": "Español",
      "language_id": 1,
      "photo_id": id,
      "title": "es_Title "+id,
      "alt": "es_Alt "+id,
      "description": "es_Description "+id,
      "pivot": {
        "photo_id": id,
        "language_id": 1,
        "title": "",
        "alt": "",
        "description": null,
        "created_at": "2017-09-22 15:30:"+(id > 9 ? id : '0'+id),
        "updated_at": "2017-09-22 15:30:"+(id > 9 ? id : '0'+id)
      }
    },
    {
      "id": 2,
      "iso6391": "en",
      "language_label": "English",
      "language_id": 1,
      "photo_id": id,
      "title": "en_Title "+id,
      "alt": "en_Alt "+id,
      "description": "en_Description "+id,
      "pivot": {
        "photo_id": id,
        "language_id": 1,
        "title": "",
        "alt": "",
        "description": null,
        "created_at": "2017-09-22 15:30:"+(id > 9 ? id : '0'+id),
        "updated_at": "2017-09-22 15:30:"+(id > 9 ? id : '0'+id)
      }
    }
  ]
})

export const photos = [0,1,2,3,4,5,6,7, 8, 9, 10].map(makePhoto)
