import Vue from 'vue'
import MediaManager from '../src/media-manager.vue'
import {photos} from './media-manager/photos'

const tick = Vue.nextTick

fdescribe('MediaManager', () => {
	let vm = {}
	let MM;

	beforeEach(() => {//Configuración previa al test
		vm = new Vue({//creamos una instancia de Vue que nos sirva para el test
			replace:false,//no es necesario fuera del test, es sólo para cuando usamos el método mount sobre el body
			template: `
			<div id="main-vue">
				<media-manager></media-manager>
			</div>`,//metemos nuestro componente en el template de la instancia e Vue.  Como se ve podemos pasar props
			mixins: [],
			// ready() {console.log(this.$children);},
			data: {
				store: {
					media_manager: {
						routes: {
							index: 'http://blaa.com/api/photos'
						}
					},
					photos: []
				},
			},
			components: {
				MediaManager
			},
			methods: {//podemos mockear algunos metodos, ver el spyOn más abajo
				generalError: function(){},
				alertError: function() {},
				get: function(route, {success, error}){
					MM[success]({
						data: {
							photos:photos
						}
					})
				},
				post: function(){},
			}
		}).$mount('body')//esto tambien es para el test

		MM = vm.$children[0]//guardamos el child en la variable, para facilitar nuestro acceso a ella

		//asi terminamos de mockearlos
		spyOn(vm, 'generalError')
		spyOn(vm, 'alertError')
		spyOn(vm, 'post')
	}) 
	
	describe('Tiene un template', () => {
		it('tiene un template que existe en el DOM', () => {
			expect(document.getElementById('media-manager')).not.toEqual(null)
		})
		it('el template esta en un inicio oculto', () => {
			expect(document.getElementById('media-manager').style.display).toEqual('none')
		})
	})

	describe('Display', () => {
		it('puede ser abierto', (done) => {
			MM.open()
			tick(() => {
				expect(document.getElementById('media-manager').style.display).toEqual('block')
				done()
			})
		});
		it('puede ser cerrado', (done) => {
			MM.open()
			tick(() => {
				MM.close()
				tick(() => {
					expect(document.getElementById('media-manager').style.display).toEqual('none')
					done()
				})
			})
		});
	})	

	describe('[GET] Trae Medias', ()=> {
		fit('puede hacer una petición GET ajax para traer imágenes', (done) => {
			MM.getPhotos()
			tick(()=> {
				expect(MM.photos).toEqual(photos)
				done()
			})
		})

		fit('puede, al ser abierto, hacer un request GET ajax para traer las imágenes', (done) => {
			MM.open()
			tick(()=> {
				expect(MM.photos).toEqual(photos)
				done()
			})
		})

		fit('puede mostrar las imágenes una vez que existan en this.$root.store.photos', (done) => {
			MM.open()
			tick(() =>{
				let images = $('.media-manager__image')
				
				let urls = images.map((i, el) => $(el).css('background-image').replace('url(', '').replace(')', '')).toArray()

				expect(images.length).toEqual(MM.photos.length)

				expect(urls).toEqual(photos.map(p=>p.thumbnail_url))

				done()
			})
				
		})

		fit('puede mandar un error si la petición falla', (done) => {
			vm.get = function(route, {success, error}){	
				MM[error]({message: ['errores']})
			}
			MM.getPhotos()
			tick(()=> {
				expect(vm.alertError).toHaveBeenCalledWith({message: ['errores']})
				done()
			})
		})
	})

	describe('[POST] Crea una media', () => {
		xit('puede hacer una petición POST ajax para crear una imagen', (done) => {});
		xit('puede agregar la imagen a la lista de imágenes', (done) => {});
		xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});
	})

	describe('[PATCH] Edita propiedades de la media', () => {
		xit('puede hacer una petición PATCH ajax para editar los contenidos de una imagen', (done) => {});
		xit('puede actualizar la imagen si la petición fue exitosa', (done) => {});
		xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});
	})

	describe('[DELETE] Eliminación de medias', ()=> {
		xit('puede hacer una petición DELETE ajax para eliminar una imagen', (done) => {});
		xit('puede actualizar las imágenes que se muestran si se elimina exitosamente la imagen', (done) => {});
		xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});
	})

	describe('Interacción con otros componentes', ()=>{
		describe('Invocación por parte de un componente', () => {
			xit('puede ser abierto por un componente', (done) => {});
			xit('puede recibir una referencia al componente que lo invoca (el "this" del componente)', (done) => {});
			xit('puede eliminar esta referencia una vez que se cierra', (done) => {});
		})
		describe('[POST] Asociación de medias', () => {
			xit('puede hacer una petición a nombre de SingleImage y Gallery para asociar una imágen a un recurso (página, post, etc.)', (done) => {});
			xit('puede mandar la imagen y otros metadatos al SingleImage o a Gallery si la respuesta fue exitosa (esto invocando un método callback propio del componente que llamó al Media Manager)'/*ver 'Invocación por parte de un componente'*/, (done) => {});
			xit('puede mostrar un error si la peticion no fue exitosa', (done) => {});			
		})	
	})

	describe('Orden y Filtros', () => {
		xit('puede ordenar fotos por fecha', (done) => {});
		xit('puede filtrar fotos por título', (done) => {});
	})

});


