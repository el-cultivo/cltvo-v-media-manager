const express = require('express')
const multer = require('multer')
const {readAsText, writeFile} = require('coral-fs-tasks')
const makePhoto = require('./makePhoto')
const upload = multer({ storage:  multer.memoryStorage() })
const app = express()
const R = require('ramda')
const tap = x => {console.log(x); return x}

app.use(express.static(__dirname + '/photos'))
app.set('views', './')
app.set('view engine', 'pug')

app.get('/', function (req, res) {
   readAsText('utf8')('./photos.json')
    .map(JSON.parse)
    .fork(console.log, photos=> res.render('index', {photos}))
})

app.get('/ajax/photos', function (req, res) {
  readAsText('utf8')('./photos.json')
    .map(JSON.parse)
    .fork(console.log, photos => res.status(200).json({ photos }))
})

app.get('/ajax/photos/:id', function (req, res) {
  readAsText('utf8')('./photos.json')
    .map(JSON.parse)
    .map(photos => photos.filter(photo => Number(photo.id) === Number(req.params.id)))
    .map(R.pathOr({}, [0]))
    .fork(console.log, photo => res.status(200).json(photo))
})

app.post('/api/save', upload.single('file_input'),function (req, res) {
  let photos = []
  let photos_json = ''
  let id = -1
  readAsText('utf8')('./photos.json')
    .map(JSON.parse)
    .map(ps => {photos = ps; return ps})
    .map(photos => photos.map(p => p.id))
    .map(ids => ids.reduce((acc, id) => acc > id ? acc : id, 0))
    .map(last_id => last_id+1)
    .map(id_ => {id = id_; return id})
    .map(id => photos.concat(makePhoto(id, req.file.mimetype)))
    .map(JSON.stringify)
    .map(ps => {photos_json = ps; return ps})
    .chain(buffer => writeFile('./', {filename:'photos.json', buffer}))
    .chain(undef => writeFile('./photos/', {filename:`${id}.${req.file.mimetype.split('/')[1]}`, buffer:req.file.buffer}))
    .fork(console.log, s => res.json(photos_json))
})

app.listen(3000, function () {
  console.log('Listening on 3000');
})